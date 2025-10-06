// PS3 XMB Menu Navigation Logic - v4 with Dynamic Configuration
// Integrated with configuration system and dynamic menu structure

const DIRECTION = {
    Left: -1,
    Right: 1,
    Up: 1,
    Down: -1
};

// Get configuration-based movement amounts
function getMovementAmounts() {
    const config = window.xmbConfig;
    const isMobileDevice = window.innerWidth <= 768;
    
    return {
        horizontal: isMobileDevice ? 100 : 170,
        vertical: isMobileDevice ? 90 : 120,
        verticalOffset: isMobileDevice ? 200 : 250
    };
}

let isTransitioningHorizontally = false;
let isTransitioningVertically = false;
let activeMenuItemIndex = 1;
const menuItemsData = [];

// System initialization state
let systemInitialized = false;
let menuSystemReady = false;
let blogSystemReady = false;

/**
 * Check if current device is mobile
 */
function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Check if current browser is Safari
 */
function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/**
 * Builds menu items data from dynamic menu structure
 * It is used to keep track of menu items and sub menu items
 */
function buildMenuItemsData() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Clear existing data
    menuItemsData.length = 0;

    menuItems.forEach((menuItem, index) => {
        const subMenuItemContainer = menuItem.querySelector('.sub-menu-item-container');
        let subMenuItemCount = subMenuItemContainer ?
            subMenuItemContainer.children.length
            : -1;

        const menuItemIndex = index;
        const activeSubMenuItemIndex = 0;

        menuItemsData.push({
            subMenuItemCount,
            menuItemIndex,
            activeSubMenuItemIndex,
            subMenuItemContainer,
        });
    });
    
    console.log(`Built menu data for ${menuItemsData.length} menu items`);
}

/**
 * Adds event listener for keyboard and touch interactions
 */
function addEventListeners() {
    // Clear existing listeners to prevent duplicates
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchend', handleTouchEnd);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyDown);

    // Touch navigation for mobile
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    // Mouse navigation
    addMouseEventListeners();
}

let touchStartX = 0;
let touchStartY = 0;

async function handleKeyDown(event) {
    let direction;

    if (event.key === 'ArrowLeft') {
        direction = DIRECTION.Left;
        await moveMenuItemsHorizontally(direction);
    }
    else if (event.key === 'ArrowRight') {
        direction = DIRECTION.Right;
        await moveMenuItemsHorizontally(direction);
    }
    else if (event.key === 'ArrowUp') {
        direction = DIRECTION.Up;
        await moveSubMenuItemsVertically(direction);
    }
    else if (event.key === 'ArrowDown') {
        direction = DIRECTION.Down;
        await moveSubMenuItemsVertically(direction);
    }
    else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault(); // Prevent page scroll on spacebar
        triggerActiveSubMenuItem();
    }
}

function handleTouchStart(e) {
    // Check if touch is on floating settings button
    const target = e.target.closest('.floating-settings-btn');
    if (target) {
        return; // Let the button handle its own touch events
    }
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

async function handleTouchEnd(e) {
    // Check if touch is on floating settings button
    const target = e.target.closest('.floating-settings-btn');
    if (target) {
        return; // Let the button handle its own touch events
    }
    
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;

    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe left (move right in menu)
                await moveMenuItemsHorizontally(DIRECTION.Right);
            } else {
                // Swipe right (move left in menu)
                await moveMenuItemsHorizontally(DIRECTION.Left);
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                // Swipe up (move down in sub-menu)
                await moveSubMenuItemsVertically(DIRECTION.Down);
            } else {
                // Swipe down (move up in sub-menu)
                await moveSubMenuItemsVertically(DIRECTION.Up);
            }
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}

/**
 * Add mouse event listeners for navigation
 */
function addMouseEventListeners() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach((menuItem, index) => {
        // Click to navigate to menu item
        menuItem.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (index !== activeMenuItemIndex) {
                const direction = index > activeMenuItemIndex ? DIRECTION.Right : DIRECTION.Left;
                const steps = Math.abs(index - activeMenuItemIndex);
                
                // Move step by step to the target menu item
                for (let i = 0; i < steps; i++) {
                    await moveMenuItemsHorizontally(direction);
                }
            }
        });
        
        // Add mouse hover effects
        menuItem.addEventListener('mouseenter', () => {
            if (index !== activeMenuItemIndex) {
                menuItem.style.opacity = '0.7';
                menuItem.style.cursor = 'pointer';
            }
        });
        
        menuItem.addEventListener('mouseleave', () => {
            if (index !== activeMenuItemIndex) {
                menuItem.style.opacity = '1';
                menuItem.style.cursor = 'default';
            }
        });
    });
    
    // Add click listeners to sub-menu items
    addSubMenuMouseListeners();
}

/**
 * Add mouse event listeners for sub-menu items (handles dynamic menu actions)
 */
function addSubMenuMouseListeners() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach((menuItem, menuIndex) => {
        const subMenuItemContainer = menuItem.querySelector('.sub-menu-item-container');
        if (!subMenuItemContainer) return;
        
        const subMenuItems = subMenuItemContainer.querySelectorAll('.sub-menu-item');
        
        subMenuItems.forEach((subMenuItem, subIndex) => {
            // Skip blog items entirely - they have their own handlers
            if (subMenuItem.hasAttribute('data-blog-index')) {
                return; // Let blog system handle this completely
            }
            
            // Click to navigate to sub-menu item
            subMenuItem.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Only handle if this is the active menu item
                if (menuIndex === activeMenuItemIndex) {
                    const activeMenuItem = menuItemsData[activeMenuItemIndex];
                    const currentSubIndex = activeMenuItem.activeSubMenuItemIndex;
                    
                    if (subIndex !== currentSubIndex) {
                        const direction = subIndex > currentSubIndex ? DIRECTION.Down : DIRECTION.Up;
                        const steps = Math.abs(subIndex - currentSubIndex);
                        
                        // Move step by step to the target sub-menu item
                        for (let i = 0; i < steps; i++) {
                            await moveSubMenuItemsVertically(direction);
                        }
                    } else {
                        // Item is already selected, perform action using menu system
                        if (window.menuSystem) {
                            window.menuSystem.handleSubMenuAction(subMenuItem);
                        }
                    }
                }
            });
            
            // Add hover effects for sub-menu items
            subMenuItem.addEventListener('mouseenter', () => {
                if (menuIndex === activeMenuItemIndex) {
                    const activeMenuItem = menuItemsData[activeMenuItemIndex];
                    if (subIndex !== activeMenuItem.activeSubMenuItemIndex) {
                        subMenuItem.style.opacity = '0.7';
                        subMenuItem.style.cursor = 'pointer';
                    }
                }
            });
            
            subMenuItem.addEventListener('mouseleave', () => {
                if (menuIndex === activeMenuItemIndex) {
                    const activeMenuItem = menuItemsData[activeMenuItemIndex];
                    if (subIndex !== activeMenuItem.activeSubMenuItemIndex) {
                        subMenuItem.style.opacity = '1';
                        subMenuItem.style.cursor = 'default';
                    }
                }
            });
        });
    });
}

async function moveMenuItemsHorizontally(direction) {
    // Check if can move horizontally
    if (!(direction === DIRECTION.Right && activeMenuItemIndex < menuItemsData.length - 1 || 
          direction === DIRECTION.Left && activeMenuItemIndex > 0)) {
        return;
    }

    if (isTransitioningHorizontally) {
        return;
    }

    // Start transitioning
    isTransitioningHorizontally = true;

    // Change active menu item index
    changeActiveMenuItemIndex(direction);

    // Update style of active menu item
    updateStyleActiveMenuItem();

    // Get all menu items
    const menuItems = document.querySelectorAll('.menu-item');

    // Get movement amount from position manager or config
    const moveAmount = window.menuPositionManager?.getNavigationAmounts()?.horizontal || getMovementAmounts().horizontal;

    menuItems.forEach((menuItem) => {
        const currentTranslateX = getTranslateX(menuItem);
        menuItem.style.transform = `translateX(${currentTranslateX + (moveAmount * -direction)}px)`;
    });

    // Wait for the transition to complete
    await waitForAllTransitions(menuItems);

    // End transitioning
    isTransitioningHorizontally = false;
}

async function moveSubMenuItemsVertically(direction) {
    const activeMenuItem = menuItemsData.find(item => item.menuItemIndex === activeMenuItemIndex);
    const subMenuItemsCount = activeMenuItem.subMenuItemCount;
    const activeSubMenuItemIndex = activeMenuItem.activeSubMenuItemIndex;

    // Check if menu item has sub menu items
    if (activeMenuItem.subMenuItemCount === -1) {
        return;
    }

    if (!(direction === DIRECTION.Down && activeSubMenuItemIndex < subMenuItemsCount - 1 || 
          direction === DIRECTION.Up && activeSubMenuItemIndex > 0)) {
        return;
    }

    if (isTransitioningVertically) {
        return;
    }

    // Start transitioning
    isTransitioningVertically = true;

    changeActiveSubMenuItemIndex(direction);
    updateActiveSubMenuItemStyle();

    // Get selected menu item's children (sub menu items)
    const subMenuItems = Array.from(activeMenuItem.subMenuItemContainer.children);
    const moveAmount = window.menuPositionManager?.getNavigationAmounts()?.vertical || getMovementAmounts().vertical;
    const offsetAmount = getMovementAmounts().verticalOffset;
    
    subMenuItems.forEach((selectionItem, index) => {
        const currentTranslateY = getTranslateY(selectionItem);
        let applyOffsetIndex;
        
        if (direction === DIRECTION.Down) {
            applyOffsetIndex = activeSubMenuItemIndex;
        } else if (direction === DIRECTION.Up) {
            applyOffsetIndex = activeSubMenuItemIndex - 1;
        }
        
        const applyOffset = index === applyOffsetIndex;
        let transformAmount = applyOffset ?
            currentTranslateY + ((moveAmount + offsetAmount) * direction)
            : currentTranslateY + (moveAmount * direction);
        
        selectionItem.style.transform = `translateY(${transformAmount}px)`;
    });

    // Wait for the transition to complete
    await waitForAllTransitions(subMenuItems);

    // End transitioning
    isTransitioningVertically = false;
}

/**
 * Get translateX value from element
 */
function getTranslateX(element) {
    const style = window.getComputedStyle(element);
    const matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m41;
}

/**
 * Get translateY value from element
 */
function getTranslateY(element) {
    const style = window.getComputedStyle(element);
    const matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m42;
}

function changeActiveMenuItemIndex(direction) {
    if (direction === 1 && activeMenuItemIndex < menuItemsData.length - 1) {
        activeMenuItemIndex++;
    } else if (direction === -1 && activeMenuItemIndex > 0) {
        activeMenuItemIndex--;
    }
}

function changeActiveSubMenuItemIndex(direction) {
    const activeMenuItem = menuItemsData.find(item => item.menuItemIndex === activeMenuItemIndex);

    if (direction === DIRECTION.Down) {
        activeMenuItem.activeSubMenuItemIndex++;
    } else if (direction === DIRECTION.Up) {
        activeMenuItem.activeSubMenuItemIndex--;
    }
}

function updateStyleActiveMenuItem() {
    const menuItems = document.querySelectorAll('.menu-item');

    // Remove active class from all menu items
    menuItems.forEach(menuItem => {
        menuItem.classList.remove('active-menu-item');
    });

    // Add active class to the active menu item
    menuItems[activeMenuItemIndex].classList.add('active-menu-item');
}

function updateActiveSubMenuItemStyle() {
    const activeMenuItem = getActiveMenuItem();
    
    if (activeMenuItem.subMenuItemCount === -1) {
        return;
    }

    const subMenuItems = Array.from(activeMenuItem.subMenuItemContainer.children);

    // Remove active class from all sub menu items
    subMenuItems.forEach(subMenuItem => {
        subMenuItem.classList.remove('active-sub-menu-item');
    });

    // Add active class to the active sub menu item
    subMenuItems[activeMenuItem.activeSubMenuItemIndex].classList.add('active-sub-menu-item');
}

function getActiveMenuItem() {
    return menuItemsData.find(item => item.menuItemIndex === activeMenuItemIndex);
}

/**
 * Trigger action on currently active sub-menu item (for keyboard shortcuts)
 */
function triggerActiveSubMenuItem() {
    const activeMenuItem = getActiveMenuItem();

    // Check if there are sub-menu items
    if (activeMenuItem.subMenuItemCount === -1) {
        console.log('No sub-menu items to trigger');
        return;
    }

    // Get the active sub-menu item element
    const subMenuItems = Array.from(activeMenuItem.subMenuItemContainer.children);
    const activeSubMenuItem = subMenuItems[activeMenuItem.activeSubMenuItemIndex];

    // Check if this is a blog item
    if (activeSubMenuItem.hasAttribute('data-blog-index')) {
        const blogIndex = parseInt(activeSubMenuItem.dataset.blogIndex);
        window.blogSystem.openBlogLink(blogIndex);
    } else {
        // Regular sub-menu item - use menu system handler
        if (window.menuSystem) {
            window.menuSystem.handleSubMenuAction(activeSubMenuItem);
        }
    }
}

/**
 * Wait for all transitions to complete
 */
function waitForAllTransitions(elements) {
    return new Promise((resolve) => {
        let completedTransitions = 0;
        const totalTransitions = elements.length;

        if (totalTransitions === 0) {
            resolve();
            return;
        }

        const onTransitionEnd = () => {
            completedTransitions++;
            if (completedTransitions === totalTransitions) {
                elements.forEach((el) => el.removeEventListener('transitionend', onTransitionEnd));
                resolve();
            }
        };

        elements.forEach((element) => {
            element.addEventListener('transitionend', onTransitionEnd);
        });
    });
}

/**
 * Setup active menu item at startup
 */
function setupActiveMenuItem() {
    const menuItems = document.querySelectorAll('.menu-item');
    if (menuItems[activeMenuItemIndex]) {
        menuItems[activeMenuItemIndex].classList.add('active-menu-item');
    }
}

/**
 * Apply horizontal offset for mobile menu positioning
 */
function applyMobileMenuOffset() {
    if (window.innerWidth <= 768) {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach((menuItem) => {
            const currentTransform = getTranslateX(menuItem);
            // Move menu 100px to the right (positive value moves right)
            menuItem.style.transform = `translateX(${currentTransform + 100}px)`;
        });
        console.log('Applied mobile menu offset: +100px');
    }
}

/**
 * Setup active sub menu items at startup
 */
function setupActiveSubMenuItems() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((menuItem) => {
        const subMenuItemContainer = menuItem.querySelector('.sub-menu-item-container');
        
        if (!subMenuItemContainer || subMenuItemContainer.children.length === 0) {
            return;
        }
        
        const firstSubMenuItem = subMenuItemContainer.children[0];
        firstSubMenuItem.classList.add('active-sub-menu-item');
    });
}

// Initialize comprehensive menu positioning system
let menuPositionManager;
let menuControlPanel;

function initializeMenuPositioning() {
    // Create position manager
    menuPositionManager = new MenuPositionManager();
    
    // Create control panel (hidden by default)
    menuControlPanel = new MenuControlPanel(menuPositionManager);
    
    // Make globally accessible for control panel
    window.menuPositionManager = menuPositionManager;
    window.menuControlPanel = menuControlPanel;
    
    console.log('Menu positioning system initialized');
}

// Initialize background gradients with configuration
function initializeBackground() {
    // Wait for DOM and config to be fully loaded
    setTimeout(() => {
        try {
            const config = window.xmbConfig;
            
            // Get colors from configuration or use defaults
            const primaryColors = config?.get('visual.primaryColors') || ['#000000', '#1a3b1a', '#2d5a27', '#0f1f0f'];
            const secondaryColors = config?.get('visual.secondaryColors') || ['#0f1f0f', '#1a3b1a', '#2d5a27', '#4a7c59'];
            
            // Get animation settings from configuration
            const gradientSpeed = config?.get('visual.gradientSpeed') || 0.3;
            const gradientDistortion = config?.get('visual.gradientDistortion') || 0.8;
            const gradientSwirl = config?.get('visual.gradientSwirl') || 0.1;
            const gradientOpacity = config?.get('visual.gradientOpacity') || 1.0;
            const wireframeSpeed = config?.get('visual.wireframeSpeed') || 0.2;
            const wireframeOpacity = config?.get('visual.wireframeOpacity') || 0.4;
            
            // Primary gradient layer (slower movement, base layer)
            const primaryGradient = new MeshGradientRenderer('background-primary', {
                colors: primaryColors,
                speed: gradientSpeed,
                distortion: gradientDistortion,
                swirl: gradientSwirl,
                opacity: gradientOpacity
            });

            // Wireframe gradient layer (faster movement, overlay)
            const wireframeGradient = new MeshGradientRenderer('background-wireframe', {
                colors: secondaryColors,
                speed: wireframeSpeed,
                distortion: gradientDistortion * 0.75,
                swirl: gradientSwirl * 1.5,
                opacity: wireframeOpacity
            });

            // Ensure menu stays on top after background initialization
            const menuContainer = document.querySelector('.menu-container');
            if (menuContainer) {
                menuContainer.style.zIndex = '9999';
            }
            
            const mainContainer = document.querySelector('.main-container');
            if (mainContainer) {
                mainContainer.style.zIndex = '9998';
                mainContainer.style.position = 'relative';
            }

            console.log('Background gradients initialized with configuration');
        } catch (error) {
            console.error('Failed to initialize background gradients:', error);
        }
    }, 200);
}

// Initialize menu system
async function initializeMenuSystem() {
    try {
        console.log('Initializing dynamic menu system...');
        
        if (window.menuSystem) {
            const success = await window.menuSystem.initialize();
            if (success) {
                menuSystemReady = true;
                console.log('Dynamic menu system ready');
                
                // Remove loading indicator
                const loadingDiv = document.querySelector('.menu-loading');
                if (loadingDiv) {
                    loadingDiv.remove();
                }
                
                // Rebuild menu data after dynamic generation
                buildMenuItemsData();
                setupActiveMenuItem();
                setupActiveSubMenuItems();
                applyMobileMenuOffset();
                addEventListeners();
                
                // Now initialize blog system after menu is ready
                await initializeBlogSystem();
                
                checkSystemReady();
            } else {
                // Menu failed but continue with blog system
                menuSystemReady = true;
                await initializeBlogSystem();
                checkSystemReady();
            }
        }
    } catch (error) {
        console.error('Failed to initialize menu system:', error);
        // Fallback: remove loading and use empty menu
        const loadingDiv = document.querySelector('.menu-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        menuSystemReady = true;
        await initializeBlogSystem();
        checkSystemReady();
    }
}

// Initialize blog system
async function initializeBlogSystem() {
    try {
        console.log('Initializing blog system...');
        
        if (window.blogSystem && window.blogSystem.enabled) {
            const success = await window.blogSystem.initialize();
            if (success) {
                blogSystemReady = true;
                console.log('Blog system ready');
                
                // Rebuild menu data after blog posts are loaded
                buildMenuItemsData();
                setupActiveSubMenuItems();
                addEventListeners(); // Re-attach listeners for new blog items
                
                checkSystemReady();
            }
        } else {
            console.log('Blog system disabled or not available');
            blogSystemReady = true; // Consider it "ready" even if disabled
            checkSystemReady();
        }
    } catch (error) {
        console.error('Failed to initialize blog system:', error);
        blogSystemReady = true; // Continue without blog system
        checkSystemReady();
    }
}

function checkSystemReady() {
    if (menuSystemReady && blogSystemReady && !systemInitialized) {
        systemInitialized = true;
        console.log('🎮 XMBFolio v4 with dynamic configuration initialized successfully');
        
        // Final setup after all systems are ready
        buildMenuItemsData();
        setupActiveMenuItem();
        setupActiveSubMenuItems();
        applyMobileMenuOffset();
        addEventListeners();
    }
}

// Main initialization sequence
function initializeXMBFolio() {
    console.log('🚀 Initializing XMBFolio v4...');
    
    // Wait for config to be loaded
    setTimeout(() => {
        if (window.xmbConfig) {
            console.log('Configuration loaded:', window.xmbConfig.get('siteTitle') || 'XMBFolio');
            
            // Initialize all systems
            initializeMenuPositioning();
            initializeBackground();
            initializeMenuSystem(); // This now handles blog system too
        } else {
            console.warn('Configuration not found, using defaults');
            // Initialize with defaults
            initializeMenuPositioning();
            initializeBackground();
            initializeMenuSystem(); // This handles both menu and blog with defaults
        }
    }, 100);
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeXMBFolio);
} else {
    initializeXMBFolio();
}