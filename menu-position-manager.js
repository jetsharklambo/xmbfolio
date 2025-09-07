/**
 * MenuPositionManager - Comprehensive menu positioning system
 * Handles detection, calculation, and application of menu positions
 */

class MenuPositionManager {
    constructor(config = MenuConfig) {
        this.config = config;
        this.currentPosition = { top: 0, right: 0, scale: 1 };
        this.currentEnvironment = null;
        this.userOverrides = {};
        this.debugMode = false;
        
        // Bind methods to preserve 'this' context
        this.handleResize = this.debounce(this.handleResize.bind(this), 100);
        this.handleOrientationChange = this.debounce(this.handleOrientationChange.bind(this), 200);
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the position manager
     */
    init() {
        this.loadUserPreferences();
        this.setupEventListeners();
        this.detectEnvironment();
        this.calculateAndApplyPosition(true); // Apply immediately on init
        
        if (this.config.debug.enabled) {
            this.enableDebugMode();
        }
    }
    
    /**
     * Detect current environment (device, browser, viewport)
     */
    detectEnvironment() {
        this.currentEnvironment = {
            viewport: this.getViewportSize(),
            device: this.detectDevice(),
            browser: this.detectBrowser(),
            orientation: this.getOrientation(),
            platform: this.detectPlatform()
        };
        
        if (this.debugMode) {
            console.log('Environment detected:', this.currentEnvironment);
        }
        
        return this.currentEnvironment;
    }
    
    /**
     * Get viewport dimensions
     */
    getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        };
    }
    
    /**
     * Detect device type based on viewport width
     */
    detectDevice() {
        const width = window.innerWidth;
        const breakpoints = this.config.breakpoints;
        
        if (width <= breakpoints.mobile) return 'mobile';
        if (width <= breakpoints.tablet) return 'tablet';
        if (width <= breakpoints.desktop) return 'desktop';
        return 'wide';
    }
    
    /**
     * Detect browser type
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor;
        
        if (/Chrome/.test(userAgent) && /Google Inc/.test(vendor)) {
            return 'chrome';
        } else if (/Safari/.test(userAgent) && /Apple Computer/.test(vendor)) {
            return 'safari';
        } else if (/Firefox/.test(userAgent)) {
            return 'firefox';
        } else if (/Edg/.test(userAgent)) {
            return 'edge';
        } else if (/Opera|OPR/.test(userAgent)) {
            return 'opera';
        }
        
        return 'default';
    }
    
    /**
     * Detect device orientation
     */
    getOrientation() {
        if (screen.orientation) {
            return screen.orientation.angle === 0 || screen.orientation.angle === 180 
                ? 'portrait' : 'landscape';
        }
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
    
    /**
     * Determine platform key for configuration lookup
     */
    detectPlatform() {
        const device = this.currentEnvironment?.device || this.detectDevice();
        return device;
    }
    
    /**
     * Get positioning preset for current environment
     */
    getPresetForEnvironment(environment = this.currentEnvironment) {
        const platformKey = environment.platform;
        const browserKey = environment.browser;
        
        const platformConfig = this.config.platforms[platformKey];
        if (!platformConfig) {
            console.warn(`No platform config found for: ${platformKey}`);
            return this.config.platforms.desktop.default;
        }
        
        // Try browser-specific config first, fall back to default
        return platformConfig[browserKey] || platformConfig.default || this.config.platforms.desktop.default;
    }
    
    /**
     * Parse position value (percentage string or pixel number)
     */
    parsePosition(value, referenceSize) {
        if (typeof value === 'string' && value.includes('%')) {
            const percentage = parseFloat(value.replace('%', ''));
            return (percentage / 100) * referenceSize;
        }
        return parseFloat(value) || 0;
    }
    
    /**
     * Calculate optimal position based on current environment
     */
    calculatePosition(environment = this.currentEnvironment) {
        const preset = this.getPresetForEnvironment(environment);
        const viewport = environment.viewport;
        
        let position = {
            top: this.parsePosition(preset.top, viewport.height),
            right: this.parsePosition(preset.right, viewport.width),
            scale: preset.scale || 1.0
        };
        
        // Apply user overrides if any
        if (this.userOverrides.top !== undefined) {
            position.top = this.parsePosition(this.userOverrides.top, viewport.height);
        }
        if (this.userOverrides.right !== undefined) {
            position.right = this.parsePosition(this.userOverrides.right, viewport.width);
        }
        if (this.userOverrides.scale !== undefined) {
            position.scale = this.userOverrides.scale;
        }
        
        // Constrain to boundaries
        position = this.constrainToBounds(position, environment);
        
        return position;
    }
    
    /**
     * Constrain position to viewport boundaries
     */
    constrainToBounds(position, environment) {
        const viewport = environment.viewport;
        const bounds = this.config.boundaries;
        const menuDimensions = this.config.menuDimensions[environment.platform] || 
                             this.config.menuDimensions.desktop;
        
        // Calculate menu size with scale
        const menuWidth = menuDimensions.itemWidth * 4 * position.scale; // Assuming 4 menu items
        const menuHeight = menuDimensions.itemHeight * position.scale;
        
        // Minimum distances from edges
        const minTop = (bounds.top / 100) * viewport.height;
        const minRight = (bounds.right / 100) * viewport.width;
        const maxTop = viewport.height - menuHeight - (bounds.bottom / 100) * viewport.height;
        const maxRight = viewport.width - menuWidth - (bounds.left / 100) * viewport.width;
        
        return {
            top: Math.max(minTop, Math.min(maxTop, position.top)),
            right: Math.max(minRight, Math.min(maxRight, position.right)),
            scale: Math.max(0.5, Math.min(1.5, position.scale))
        };
    }
    
    /**
     * Apply position to menu element with optional transition
     */
    applyPosition(position = null, animate = true) {
        if (!position) {
            position = this.calculatePosition();
        }
        
        const menuContainer = document.querySelector('.menu-container');
        if (!menuContainer) {
            console.warn('Menu container not found');
            return;
        }
        
        // Set up transition if animated
        if (animate) {
            const duration = this.config.animation.transitionDuration;
            const easing = this.config.animation.easing;
            menuContainer.style.transition = `all ${duration}ms ${easing}`;
            
            // Remove transition after animation completes
            setTimeout(() => {
                menuContainer.style.transition = '';
            }, duration + 50);
        } else {
            menuContainer.style.transition = '';
        }
        
        // Apply positioning
        menuContainer.style.position = 'fixed';
        menuContainer.style.top = `${position.top}px`;
        menuContainer.style.right = `${position.right}px`;
        menuContainer.style.transform = `scale(${position.scale})`;
        menuContainer.style.transformOrigin = 'center';
        menuContainer.style.zIndex = this.config.zIndex.menu;
        
        // Update current position
        this.currentPosition = { ...position };
        
        if (this.config.debug.logPositionChanges) {
            console.log('Menu positioned:', position);
        }
        
        return position;
    }
    
    /**
     * Calculate and apply position in one call
     */
    calculateAndApplyPosition(instant = false) {
        this.detectEnvironment();
        const position = this.calculatePosition();
        return this.applyPosition(position, !instant);
    }
    
    /**
     * Get navigation amounts for current environment
     */
    getNavigationAmounts() {
        const preset = this.getPresetForEnvironment();
        return {
            horizontal: preset.horizontalMove || 170,
            vertical: preset.verticalMove || 120
        };
    }
    
    /**
     * Nudge menu position by offset amount
     */
    nudgePosition(axis, amount) {
        const currentPos = { ...this.currentPosition };
        
        if (axis === 'top') {
            currentPos.top += amount;
        } else if (axis === 'right') {
            currentPos.right += amount;
        }
        
        const constrainedPos = this.constrainToBounds(currentPos, this.currentEnvironment);
        this.applyPosition(constrainedPos);
        
        // Save as user override
        this.userOverrides.top = `${constrainedPos.top}px`;
        this.userOverrides.right = `${constrainedPos.right}px`;
        this.saveUserPreferences();
    }
    
    /**
     * Scale menu by factor
     */
    scaleMenu(factor) {
        const currentPos = { ...this.currentPosition };
        currentPos.scale *= factor;
        
        const constrainedPos = this.constrainToBounds(currentPos, this.currentEnvironment);
        this.applyPosition(constrainedPos);
        
        // Save as user override
        this.userOverrides.scale = constrainedPos.scale;
        this.saveUserPreferences();
    }
    
    /**
     * Apply preset position
     */
    applyPreset(presetName) {
        const preset = this.config.presets[presetName];
        if (!preset) {
            console.warn(`Preset not found: ${presetName}`);
            return;
        }
        
        const viewport = this.currentEnvironment.viewport;
        const position = {
            top: this.parsePosition(preset.top, viewport.height),
            right: this.parsePosition(preset.right, viewport.width),
            scale: preset.scale || 1.0
        };
        
        const constrainedPos = this.constrainToBounds(position, this.currentEnvironment);
        this.applyPosition(constrainedPos);
        
        // Save as user override
        this.userOverrides = {
            top: `${constrainedPos.top}px`,
            right: `${constrainedPos.right}px`,
            scale: constrainedPos.scale
        };
        this.saveUserPreferences();
    }
    
    /**
     * Reset to default position
     */
    resetToDefault() {
        this.userOverrides = {};
        this.saveUserPreferences();
        this.calculateAndApplyPosition();
    }
    
    /**
     * Event handlers
     */
    handleResize() {
        this.calculateAndApplyPosition();
    }
    
    handleOrientationChange() {
        // Wait a bit for orientation change to complete
        setTimeout(() => {
            this.calculateAndApplyPosition();
        }, 300);
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleOrientationChange);
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            window.removeEventListener('resize', this.handleResize);
            window.removeEventListener('orientationchange', this.handleOrientationChange);
        });
    }
    
    /**
     * Load user preferences from localStorage
     */
    loadUserPreferences() {
        try {
            const stored = localStorage.getItem(this.config.storageKeys.userPosition);
            if (stored) {
                this.userOverrides = JSON.parse(stored);
            }
            
            const debugStored = localStorage.getItem(this.config.storageKeys.debugMode);
            if (debugStored) {
                this.debugMode = JSON.parse(debugStored);
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }
    
    /**
     * Save user preferences to localStorage
     */
    saveUserPreferences() {
        try {
            localStorage.setItem(
                this.config.storageKeys.userPosition, 
                JSON.stringify(this.userOverrides)
            );
            localStorage.setItem(
                this.config.storageKeys.debugMode, 
                JSON.stringify(this.debugMode)
            );
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    }
    
    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;
        this.saveUserPreferences();
        // Debug UI will be implemented separately
        console.log('Debug mode enabled');
    }
    
    /**
     * Disable debug mode
     */
    disableDebugMode() {
        this.debugMode = false;
        this.saveUserPreferences();
        console.log('Debug mode disabled');
    }
    
    /**
     * Utility: Debounce function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Get current status for debugging
     */
    getStatus() {
        return {
            environment: this.currentEnvironment,
            position: this.currentPosition,
            userOverrides: this.userOverrides,
            preset: this.getPresetForEnvironment(),
            navigationAmounts: this.getNavigationAmounts()
        };
    }
}

// Export for module systems or make globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuPositionManager;
} else {
    window.MenuPositionManager = MenuPositionManager;
}