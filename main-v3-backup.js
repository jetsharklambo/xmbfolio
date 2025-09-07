// PS3 XMB Menu Navigation Logic - Simplified for Mobile Testing

const DIRECTION = {
    Left: -1,
    Right: 1,
    Up: 1,
    Down: -1
};

const HORIZONTAL_MOVEMENT_AMOUNT = 170;
const VERTICAL_MOVEMENT_AMOUNT = 120;
const VERTICAL_MOVEMENT_OFFSET = 250;
const NO_SUB_MENU_ITEM_COUNT = -1;

let isTransitioningHorizontally = false;
let isTransitioningVertically = false;
let activeMenuItemIndex = 1;
const menuItemsData = [];

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
 * Builds menu items data. 
 * It is used to keep track of menu items and sub menu items
 */
function buildMenuItemsData() {
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach((menuItem, index) => {
        const subMenuItemContainer = menuItem.querySelector('.sub-menu-item-container');
        let subMenuItemCount = subMenuItemContainer ?
            subMenuItemContainer.children.length
            : NO_SUB_MENU_ITEM_COUNT;

        const menuItemIndex = index;
        const activeSubMenuItemIndex = 0;

        menuItemsData.push({
            subMenuItemCount,
            menuItemIndex,
            activeSubMenuItemIndex,
            subMenuItemContainer,
        });
    });
}

/**
 * Adds event listener for keyboard and touch interactions
 */
function addEventListeners() {
    // Keyboard navigation
    document.body.addEventListener('keydown', async (event) => {
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
    });

    // Touch navigation for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        // Check if touch is on floating settings button
        const target = e.target.closest('.floating-settings-btn');
        if (target) {
            return; // Let the button handle its own touch events
        }
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', async (e) => {
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
    });

    // Mouse navigation
    addMouseEventListeners();
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
 * Add mouse event listeners for sub-menu items
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
                        // Item is already selected, perform action
                        performSubMenuAction(subMenuItem);
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
        console.log('Cannot move horizontally');
        return;
    }

    if (isTransitioningHorizontally) {
        console.log('Already transitioning horizontally');
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

    // Get movement amount from position manager
    const navigationAmounts = menuPositionManager.getNavigationAmounts();
    const moveAmount = navigationAmounts.horizontal;

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
    if (activeMenuItem.subMenuItemCount === NO_SUB_MENU_ITEM_COUNT) {
        console.log('No sub menu items');
        return;
    }

    if (!(direction === DIRECTION.Down && activeSubMenuItemIndex < subMenuItemsCount - 1 || 
          direction === DIRECTION.Up && activeSubMenuItemIndex > 0)) {
        console.log('Cannot move vertically');
        return;
    }

    if (isTransitioningVertically) {
        console.log('Already transitioning vertically');
        return;
    }

    // Start transitioning
    isTransitioningVertically = true;

    changeActiveSubMenuItemIndex(direction);
    updateActiveSubMenuItemStyle();

    // Get selected menu item's children (sub menu items)
    const subMenuItems = Array.from(activeMenuItem.subMenuItemContainer.children);
    const navigationAmounts = menuPositionManager.getNavigationAmounts();
    const moveAmount = navigationAmounts.vertical;
    const offsetAmount = isMobile() ? 200 : VERTICAL_MOVEMENT_OFFSET;
    
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
    
    if (activeMenuItem.subMenuItemCount === NO_SUB_MENU_ITEM_COUNT) {
        console.log('No sub menu items');
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
 * Perform action when sub-menu item is clicked while already selected
 */
function performSubMenuAction(subMenuItem) {
    const itemText = subMenuItem.querySelector('.sub-menu-item-header').textContent.trim();
    
    switch (itemText) {
        case 'GitHub':
            window.open('https://github.com/jetsharklambo', '_blank');
            break;
        case 'Farcaster':
            window.open('https://farcaster.xyz/jetsharklambo', '_blank');
            break;
        case 'Twitter':
            window.open('https://x.com/0xJetsharkLambo', '_blank');
            break;
        case 'Saltfree':
            window.open('http://saltfree.vercel.app/', '_blank');
            break;
        case 'XMBFolio':
            window.open('https://github.com/jetsharklambo/xmbfolio', '_blank');
            break;
        case 'Bio':
            window.open('https://maximo.is/', '_blank');
            break;
        case 'Activity':
            alert('Activity log coming soon!');
            break;
        case 'Archive':
            alert('Archive section coming soon!');
            break;
        default:
            console.log(`No action defined for: ${itemText}`);
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
    menuItems[activeMenuItemIndex].classList.add('active-menu-item');
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

// Initialize the menu system
buildMenuItemsData();
addEventListeners();
setupActiveMenuItem();
setupActiveSubMenuItems();
applyMobileMenuOffset();

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

// Initialize positioning system
initializeMenuPositioning();

// Initialize background gradients
function initializeBackground() {
    // Wait for DOM to be fully loaded
    setTimeout(() => {
        try {
            // Primary gradient layer (slower movement, base layer)
            const primaryGradient = new MeshGradientRenderer('background-primary', {
                colors: ['#000000', '#1a3b1a', '#2d5a27', '#0f1f0f'],
                speed: 0.3,
                distortion: 0.8,
                swirl: 0.1,
                opacity: 1.0
            });

            // Wireframe gradient layer (faster movement, overlay)
            const wireframeGradient = new MeshGradientRenderer('background-wireframe', {
                colors: ['#0f1f0f', '#1a3b1a', '#2d5a27', '#4a7c59'],
                speed: 0.2,
                distortion: 0.6,
                swirl: 0.15,
                opacity: 0.4
            });

            // Ensure menu stays on top after background initialization (z-index only)
            const menuContainer = document.querySelector('.menu-container');
            if (menuContainer) {
                // Only adjust z-index - positioning is handled by positionMenu()
                menuContainer.style.zIndex = '9999';
            }
            
            const mainContainer = document.querySelector('.main-container');
            if (mainContainer) {
                mainContainer.style.zIndex = '9998';
                // Keep main container as relative for proper stacking context
                mainContainer.style.position = 'relative';
            }

            console.log('Background gradients initialized successfully');
        } catch (error) {
            console.error('Failed to initialize background gradients:', error);
        }
    }, 200);
}

initializeBackground();

// Initialize blog system
function initializeBlogSystem() {
    console.log('Attempting to initialize blog system...');
    console.log('BlogSystem class available:', typeof BlogSystem !== 'undefined');
    console.log('window.blogSystem exists:', !!window.blogSystem);
    
    if (typeof BlogSystem !== 'undefined' && window.blogSystem) {
        console.log('Starting blog system initialization...');
        window.blogSystem.initialize().then(() => {
            console.log('Blog system initialized successfully');
            // Clear existing menu data and rebuild completely
            menuItemsData.length = 0;
            buildMenuItemsData();
            // Reset active sub-menu items for all menu items
            setupActiveSubMenuItems();
            // Apply mobile menu offset after rebuild
            applyMobileMenuOffset();
            // Reattach ALL mouse listeners (main menu and sub-menu items)
            addMouseEventListeners();
        }).catch(error => {
            console.error('Failed to initialize blog system:', error);
        });
    } else {
        console.warn('BlogSystem not found, skipping blog initialization');
        console.log('BlogSystem type:', typeof BlogSystem);
        console.log('window.blogSystem:', window.blogSystem);
    }
}

// Initialize blog system after a short delay to ensure all other systems are ready
setTimeout(() => {
    initializeBlogSystem();
}, 500);

console.log('PS3 XMB Menu with MeshGradient background initialized');