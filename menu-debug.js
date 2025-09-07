/**
 * MenuDebugOverlay - Visual debugging helpers for menu positioning
 * Shows boundaries, grid, and position information
 */

class MenuDebugOverlay {
    constructor(positionManager) {
        this.manager = positionManager;
        this.overlay = null;
        this.isActive = false;
    }
    
    /**
     * Enable debug overlay
     */
    enable() {
        if (this.overlay) {
            this.overlay.style.display = 'block';
            this.isActive = true;
            this.updateOverlay();
            return;
        }
        
        this.createOverlay();
        this.isActive = true;
        console.log('Debug overlay enabled');
    }
    
    /**
     * Disable debug overlay
     */
    disable() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        this.isActive = false;
        console.log('Debug overlay disabled');
    }
    
    /**
     * Toggle debug overlay
     */
    toggle() {
        if (this.isActive) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    /**
     * Create the debug overlay
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'menu-debug-overlay';
        
        // Style the overlay
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: ${this.manager.config.zIndex.debug};
            font-family: monospace;
            font-size: 12px;
        `;
        
        document.body.appendChild(this.overlay);
        this.updateOverlay();
        
        // Update on window resize
        window.addEventListener('resize', () => {
            if (this.isActive) {
                this.updateOverlay();
            }
        });
    }
    
    /**
     * Update overlay content
     */
    updateOverlay() {
        if (!this.overlay) return;
        
        const config = this.manager.config;
        const environment = this.manager.currentEnvironment;
        const position = this.manager.currentPosition;
        const viewport = environment.viewport;
        
        let overlayHTML = '';
        
        // Show boundaries if enabled
        if (config.debug.showBoundaries) {
            overlayHTML += this.createBoundariesHTML(viewport, config.boundaries);
        }
        
        // Show center crosshairs if enabled
        if (config.debug.showCenter) {
            overlayHTML += this.createCenterCrosshairs(viewport);
        }
        
        // Show grid if enabled
        if (config.debug.showGrid) {
            overlayHTML += this.createGridHTML(viewport);
        }
        
        // Show position info
        overlayHTML += this.createInfoPanel(environment, position);
        
        // Show menu outline
        overlayHTML += this.createMenuOutline(position, environment);
        
        this.overlay.innerHTML = overlayHTML;
    }
    
    /**
     * Create boundaries visualization
     */
    createBoundariesHTML(viewport, boundaries) {
        const topBound = (boundaries.top / 100) * viewport.height;
        const bottomBound = viewport.height - (boundaries.bottom / 100) * viewport.height;
        const leftBound = (boundaries.left / 100) * viewport.width;
        const rightBound = viewport.width - (boundaries.right / 100) * viewport.width;
        
        return `
            <!-- Top boundary -->
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: ${topBound}px;
                background: rgba(255, 0, 0, 0.1);
                border-bottom: 1px dashed #ff0000;
            "></div>
            
            <!-- Bottom boundary -->
            <div style="
                position: absolute;
                top: ${bottomBound}px;
                left: 0;
                width: 100%;
                height: ${viewport.height - bottomBound}px;
                background: rgba(255, 0, 0, 0.1);
                border-top: 1px dashed #ff0000;
            "></div>
            
            <!-- Left boundary -->
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: ${leftBound}px;
                height: 100%;
                background: rgba(255, 0, 0, 0.1);
                border-right: 1px dashed #ff0000;
            "></div>
            
            <!-- Right boundary -->
            <div style="
                position: absolute;
                top: 0;
                left: ${rightBound}px;
                width: ${viewport.width - rightBound}px;
                height: 100%;
                background: rgba(255, 0, 0, 0.1);
                border-left: 1px dashed #ff0000;
            "></div>
        `;
    }
    
    /**
     * Create center crosshairs
     */
    createCenterCrosshairs(viewport) {
        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;
        
        return `
            <!-- Horizontal center line -->
            <div style="
                position: absolute;
                top: ${centerY}px;
                left: 0;
                width: 100%;
                height: 1px;
                background: rgba(0, 255, 0, 0.5);
            "></div>
            
            <!-- Vertical center line -->
            <div style="
                position: absolute;
                top: 0;
                left: ${centerX}px;
                width: 1px;
                height: 100%;
                background: rgba(0, 255, 0, 0.5);
            "></div>
        `;
    }
    
    /**
     * Create grid overlay
     */
    createGridHTML(viewport) {
        const gridSize = 50; // 50px grid
        let gridHTML = '';
        
        // Vertical lines
        for (let x = 0; x < viewport.width; x += gridSize) {
            gridHTML += `
                <div style="
                    position: absolute;
                    top: 0;
                    left: ${x}px;
                    width: 1px;
                    height: 100%;
                    background: rgba(100, 100, 100, 0.2);
                "></div>
            `;
        }
        
        // Horizontal lines
        for (let y = 0; y < viewport.height; y += gridSize) {
            gridHTML += `
                <div style="
                    position: absolute;
                    top: ${y}px;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: rgba(100, 100, 100, 0.2);
                "></div>
            `;
        }
        
        return gridHTML;
    }
    
    /**
     * Create info panel
     */
    createInfoPanel(environment, position) {
        const preset = this.manager.getPresetForEnvironment(environment);
        const navigationAmounts = this.manager.getNavigationAmounts();
        
        return `
            <div style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 4px;
                font-size: 11px;
                line-height: 1.4;
                max-width: 250px;
            ">
                <strong>Debug Info</strong><br>
                <strong>Environment:</strong><br>
                Device: ${environment.device}<br>
                Browser: ${environment.browser}<br>
                Viewport: ${environment.viewport.width}×${environment.viewport.height}<br>
                Orientation: ${environment.orientation}<br><br>
                
                <strong>Position:</strong><br>
                Top: ${Math.round(position.top)}px<br>
                Right: ${Math.round(position.right)}px<br>
                Scale: ${position.scale.toFixed(2)}<br><br>
                
                <strong>Navigation:</strong><br>
                Horizontal: ${navigationAmounts.horizontal}px<br>
                Vertical: ${navigationAmounts.vertical}px<br><br>
                
                <strong>Preset:</strong><br>
                Top: ${preset.top}<br>
                Right: ${preset.right}<br>
                Scale: ${preset.scale}<br><br>
                
                <div style="color: #4a7c59;">
                    Press Ctrl+Shift+M for controls<br>
                    Press Ctrl+Shift+D to toggle debug
                </div>
            </div>
        `;
    }
    
    /**
     * Create menu outline visualization
     */
    createMenuOutline(position, environment) {
        const menuDimensions = this.manager.config.menuDimensions[environment.platform] || 
                             this.manager.config.menuDimensions.desktop;
        
        // Estimate menu size (4 items horizontally)
        const menuWidth = menuDimensions.itemWidth * 4 * position.scale;
        const menuHeight = menuDimensions.itemHeight * position.scale;
        
        return `
            <div style="
                position: absolute;
                top: ${position.top}px;
                right: ${position.right}px;
                width: ${menuWidth}px;
                height: ${menuHeight}px;
                border: 2px solid #00ff00;
                border-radius: 4px;
                background: rgba(0, 255, 0, 0.1);
                transform-origin: right center;
            ">
                <div style="
                    position: absolute;
                    top: -20px;
                    right: 0;
                    background: rgba(0, 255, 0, 0.8);
                    color: black;
                    padding: 2px 6px;
                    font-size: 10px;
                    border-radius: 2px;
                ">
                    Menu Area (${Math.round(menuWidth)}×${Math.round(menuHeight)})
                </div>
            </div>
        `;
    }
}

// Enhanced MenuPositionManager with debug capability
if (window.MenuPositionManager) {
    const originalEnableDebugMode = window.MenuPositionManager.prototype.enableDebugMode;
    const originalDisableDebugMode = window.MenuPositionManager.prototype.disableDebugMode;
    
    window.MenuPositionManager.prototype.enableDebugMode = function() {
        originalEnableDebugMode.call(this);
        
        if (!this.debugOverlay) {
            this.debugOverlay = new MenuDebugOverlay(this);
        }
        this.debugOverlay.enable();
    };
    
    window.MenuPositionManager.prototype.disableDebugMode = function() {
        originalDisableDebugMode.call(this);
        
        if (this.debugOverlay) {
            this.debugOverlay.disable();
        }
    };
}

// Global keyboard shortcut for debug toggle
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (window.menuPositionManager) {
            if (window.menuPositionManager.debugMode) {
                window.menuPositionManager.disableDebugMode();
            } else {
                window.menuPositionManager.enableDebugMode();
            }
        }
    }
});

// Export for module systems or make globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuDebugOverlay;
} else {
    window.MenuDebugOverlay = MenuDebugOverlay;
}