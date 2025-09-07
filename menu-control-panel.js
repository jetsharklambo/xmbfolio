/**
 * MenuControlPanel - User interface for menu positioning controls
 * Provides an overlay panel for adjusting menu position
 */

class MenuControlPanel {
    constructor(positionManager) {
        this.manager = positionManager;
        this.isVisible = false;
        this.panel = null;
        this.floatingButton = null;
        this.isMobile = this.detectMobile();
        
        // Create keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Create floating button for mobile
        if (this.isMobile) {
            this.createFloatingButton();
        }
    }
    
    /**
     * Detect if device is mobile/touch enabled
     */
    detectMobile() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;
    }
    
    /**
     * Create floating settings button for mobile
     */
    createFloatingButton() {
        this.floatingButton = document.createElement('div');
        this.floatingButton.className = 'floating-settings-btn';
        this.floatingButton.innerHTML = '⚙️';
        
        // Style the floating button
        this.floatingButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(45, 90, 39, 0.9);
            border: 2px solid #4a7c59;
            border-radius: 50%;
            color: white;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation;
        `;
        
        // Add touch interactions with single/double tap detection
        let isDragging = false;
        let startX, startY;
        let hasMoved = false;
        let tapCount = 0;
        let tapTimer = null;
        const doubleTapDelay = 300; // ms
        
        // Touch start with capture phase to prevent interference
        this.floatingButton.addEventListener('touchstart', (e) => {
            console.log('Touch start on floating button');
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = false;
            hasMoved = false;
        }, { capture: true, passive: false });
        
        // Touch move with capture phase
        this.floatingButton.addEventListener('touchmove', (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            // Check if it's a significant movement
            if (Math.abs(currentX - startX) > 5 || Math.abs(currentY - startY) > 5) {
                hasMoved = true;
                
                if (Math.abs(currentX - startX) > 15 || Math.abs(currentY - startY) > 15) {
                    isDragging = true;
                    
                    // Move the button
                    this.floatingButton.style.left = currentX - 25 + 'px';
                    this.floatingButton.style.top = currentY - 25 + 'px';
                    this.floatingButton.style.right = 'auto';
                    this.floatingButton.style.bottom = 'auto';
                }
            }
        }, { capture: true, passive: false });
        
        // Touch end - handle single/double tap with capture phase
        this.floatingButton.addEventListener('touchend', (e) => {
            console.log('Touch end on floating button, isDragging:', isDragging, 'hasMoved:', hasMoved);
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
            
            if (isDragging) {
                // Constrain to viewport after drag
                this.constrainButtonPosition();
                this.resetTouchState();
                return;
            }
            
            if (!hasMoved) {
                // This is a tap
                tapCount++;
                console.log('Tap detected, count:', tapCount);
                
                if (tapCount === 1) {
                    // Start timer for potential double tap
                    tapTimer = setTimeout(() => {
                        // Single tap - toggle control panel
                        console.log('Single tap confirmed - toggling control panel');
                        this.toggle();
                        // Haptic feedback
                        if (navigator.vibrate) navigator.vibrate(30);
                        this.resetTouchState();
                    }, doubleTapDelay);
                } else if (tapCount === 2) {
                    // Double tap - toggle debug mode
                    console.log('Double tap detected - toggling debug mode');
                    clearTimeout(tapTimer);
                    this.manager.debugMode ? this.manager.disableDebugMode() : this.manager.enableDebugMode();
                    this.floatingButton.style.background = this.manager.debugMode ? 'rgba(255, 100, 100, 0.9)' : 'rgba(45, 90, 39, 0.9)';
                    // Stronger haptic feedback for debug toggle
                    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                    this.resetTouchState();
                }
            } else {
                this.resetTouchState();
            }
        }, { capture: true, passive: false });
        
        // Helper function to reset touch state
        const resetTouchState = () => {
            isDragging = false;
            hasMoved = false;
            tapCount = 0;
            if (tapTimer) {
                clearTimeout(tapTimer);
                tapTimer = null;
            }
        };
        
        this.resetTouchState = resetTouchState;
        
        // Fallback click event for desktop
        this.floatingButton.addEventListener('click', (e) => {
            console.log('Click event on floating button');
            e.stopPropagation();
            e.preventDefault();
            
            // Desktop - single click opens panel
            this.toggle();
        });
        
        // Right click for debug mode (desktop)
        this.floatingButton.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.manager.debugMode ? this.manager.disableDebugMode() : this.manager.enableDebugMode();
            this.floatingButton.style.background = this.manager.debugMode ? 'rgba(255, 100, 100, 0.9)' : 'rgba(45, 90, 39, 0.9)';
        });
        
        document.body.appendChild(this.floatingButton);
    }
    
    /**
     * Constrain floating button to viewport
     */
    constrainButtonPosition() {
        const rect = this.floatingButton.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        let x = rect.left;
        let y = rect.top;
        
        // Constrain to viewport
        x = Math.max(10, Math.min(x, viewport.width - 60));
        y = Math.max(10, Math.min(y, viewport.height - 60));
        
        this.floatingButton.style.left = x + 'px';
        this.floatingButton.style.top = y + 'px';
    }
    
    /**
     * Create and show the control panel
     */
    show() {
        if (this.panel) {
            this.panel.style.display = 'block';
            this.isVisible = true;
            return;
        }
        
        this.panel = this.createPanel();
        document.body.appendChild(this.panel);
        this.isVisible = true;
        
        // Auto-hide after inactivity
        this.setupAutoHide();
    }
    
    /**
     * Hide the control panel
     */
    hide() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
        this.isVisible = false;
    }
    
    /**
     * Toggle panel visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * Create the control panel HTML
     */
    createPanel() {
        const panel = document.createElement('div');
        panel.className = 'menu-control-panel';
        panel.innerHTML = `
            <div class="control-panel-header">
                <h3>Menu Position Controls</h3>
                <button class="close-btn" onclick="window.menuControlPanel.hide()">×</button>
            </div>
            
            <div class="control-section">
                <h4>Fine Adjustment</h4>
                <div class="nudge-controls">
                    <button class="nudge-btn" data-axis="top" data-amount="-10">↑ Up</button>
                    <div class="horizontal-controls">
                        <button class="nudge-btn" data-axis="right" data-amount="10">← Left</button>
                        <button class="nudge-btn" data-axis="right" data-amount="-10">Right →</button>
                    </div>
                    <button class="nudge-btn" data-axis="top" data-amount="10">↓ Down</button>
                </div>
            </div>
            
            <div class="control-section">
                <h4>Scale</h4>
                <div class="scale-controls">
                    <button class="scale-btn" data-factor="0.9">Smaller</button>
                    <button class="scale-btn" data-factor="1.0" data-absolute="true">Reset</button>
                    <button class="scale-btn" data-factor="1.1">Larger</button>
                </div>
            </div>
            
            <div class="control-section">
                <h4>Presets</h4>
                <div class="preset-controls">
                    <button class="preset-btn" data-preset="topLeft">Top Left</button>
                    <button class="preset-btn" data-preset="topCenter">Top Center</button>
                    <button class="preset-btn" data-preset="topRight">Top Right</button>
                    <button class="preset-btn" data-preset="centerLeft">Center Left</button>
                    <button class="preset-btn" data-preset="center">Center</button>
                    <button class="preset-btn" data-preset="centerRight">Center Right</button>
                    <button class="preset-btn" data-preset="bottomLeft">Bottom Left</button>
                    <button class="preset-btn" data-preset="bottomCenter">Bottom Center</button>
                    <button class="preset-btn" data-preset="bottomRight">Bottom Right</button>
                </div>
            </div>
            
            <div class="control-section">
                <h4>Actions</h4>
                <div class="action-controls">
                    <button class="action-btn" onclick="window.menuControlPanel.resetToDefault()">Reset to Default</button>
                    <button class="action-btn" onclick="window.menuControlPanel.toggleDebugMode()">Toggle Debug</button>
                    <button class="action-btn" onclick="window.menuControlPanel.exportSettings()">Export Settings</button>
                </div>
            </div>
            
            <div class="control-section">
                <h4>Current Status</h4>
                <div class="status-display">
                    <div id="position-info"></div>
                    <div id="environment-info"></div>
                </div>
            </div>
        `;
        
        this.stylePanel(panel);
        this.setupEventListeners(panel);
        this.updateStatusDisplay(panel);
        
        return panel;
    }
    
    /**
     * Style the control panel
     */
    stylePanel(panel) {
        const isMobile = this.isMobile;
        
        panel.style.cssText = `
            position: fixed;
            ${isMobile ? 'top: 10px; left: 10px; right: 10px; width: auto;' : 'top: 20px; left: 20px; width: 300px;'}
            max-height: ${isMobile ? '90vh' : '80vh'};
            background: rgba(17, 17, 17, 0.95);
            border: 2px solid #2d5a27;
            border-radius: 8px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: ${isMobile ? '14px' : '12px'};
            z-index: ${this.manager.config.zIndex.controls};
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            overflow-y: auto;
            pointer-events: auto;
        `;
        
        // Add internal styles
        const style = document.createElement('style');
        style.textContent = `
            .control-panel-header {
                background: #1a3b1a;
                padding: 10px 15px;
                border-bottom: 1px solid #2d5a27;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .control-panel-header h3 {
                margin: 0;
                font-size: 14px;
                color: white;
            }
            
            .close-btn {
                background: transparent;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                pointer-events: auto;
            }
            
            .control-section {
                padding: 15px;
                border-bottom: 1px solid #333;
                pointer-events: auto;
            }
            
            .control-section h4 {
                margin: 0 0 10px 0;
                font-size: 12px;
                color: #4a7c59;
            }
            
            .nudge-controls {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .horizontal-controls {
                display: flex;
                gap: 10px;
            }
            
            .nudge-btn, .scale-btn, .preset-btn, .action-btn {
                background: #2d5a27;
                border: 1px solid #4a7c59;
                color: white;
                padding: ${isMobile ? '12px 16px' : '6px 12px'};
                font-size: ${isMobile ? '14px' : '11px'};
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
                pointer-events: auto;
                touch-action: manipulation;
                min-height: ${isMobile ? '44px' : 'auto'};
            }
            
            .nudge-btn:hover, .scale-btn:hover, .preset-btn:hover, .action-btn:hover {
                background: #4a7c59;
            }
            
            .scale-controls, .action-controls {
                display: flex;
                gap: 8px;
                justify-content: space-between;
            }
            
            .preset-controls {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 6px;
            }
            
            .preset-btn {
                padding: 4px 8px;
                font-size: 10px;
            }
            
            .status-display {
                font-size: 10px;
                color: #ccc;
                line-height: 1.4;
            }
            
            #position-info, #environment-info {
                margin-bottom: 8px;
            }
        `;
        
        if (!document.getElementById('menu-control-panel-styles')) {
            style.id = 'menu-control-panel-styles';
            document.head.appendChild(style);
        }
    }
    
    /**
     * Set up event listeners for the panel
     */
    setupEventListeners(panel) {
        // Nudge controls
        panel.querySelectorAll('.nudge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const axis = e.target.dataset.axis;
                const amount = parseInt(e.target.dataset.amount);
                this.manager.nudgePosition(axis, amount);
                this.updateStatusDisplay(panel);
            });
        });
        
        // Scale controls
        panel.querySelectorAll('.scale-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const factor = parseFloat(e.target.dataset.factor);
                const isAbsolute = e.target.dataset.absolute === 'true';
                
                if (isAbsolute) {
                    // Reset scale to 1.0
                    const currentPos = { ...this.manager.currentPosition };
                    currentPos.scale = 1.0;
                    this.manager.applyPosition(currentPos);
                    this.manager.userOverrides.scale = 1.0;
                    this.manager.saveUserPreferences();
                } else {
                    this.manager.scaleMenu(factor);
                }
                this.updateStatusDisplay(panel);
            });
        });
        
        // Preset controls
        panel.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.manager.applyPreset(preset);
                this.updateStatusDisplay(panel);
            });
        });
        
        // Prevent panel clicks from affecting menu
        panel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    /**
     * Update the status display
     */
    updateStatusDisplay(panel) {
        const positionInfo = panel.querySelector('#position-info');
        const environmentInfo = panel.querySelector('#environment-info');
        
        if (positionInfo && environmentInfo) {
            const status = this.manager.getStatus();
            
            positionInfo.innerHTML = `
                <strong>Position:</strong><br>
                Top: ${Math.round(status.position.top)}px<br>
                Right: ${Math.round(status.position.right)}px<br>
                Scale: ${status.position.scale.toFixed(2)}
            `;
            
            environmentInfo.innerHTML = `
                <strong>Environment:</strong><br>
                Device: ${status.environment.device}<br>
                Browser: ${status.environment.browser}<br>
                Size: ${status.environment.viewport.width}×${status.environment.viewport.height}
            `;
        }
    }
    
    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + M to toggle panel
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                this.toggle();
                return;
            }
            
            // Only process other shortcuts if panel is visible
            if (!this.isVisible) return;
            
            const nudgeAmount = e.shiftKey ? 20 : 5; // Larger movements with Shift
            
            switch (e.key) {
                case 'ArrowUp':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.manager.nudgePosition('top', -nudgeAmount);
                        this.updateStatusDisplay(this.panel);
                    }
                    break;
                case 'ArrowDown':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.manager.nudgePosition('top', nudgeAmount);
                        this.updateStatusDisplay(this.panel);
                    }
                    break;
                case 'ArrowLeft':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.manager.nudgePosition('right', nudgeAmount);
                        this.updateStatusDisplay(this.panel);
                    }
                    break;
                case 'ArrowRight':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.manager.nudgePosition('right', -nudgeAmount);
                        this.updateStatusDisplay(this.panel);
                    }
                    break;
                case 'Escape':
                    this.hide();
                    break;
            }
        });
    }
    
    /**
     * Set up auto-hide functionality
     */
    setupAutoHide() {
        let hideTimeout;
        
        const resetHideTimer = () => {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                if (this.isVisible) {
                    this.hide();
                }
            }, 30000); // Hide after 30 seconds of inactivity
        };
        
        // Reset timer on panel interaction
        if (this.panel) {
            this.panel.addEventListener('mousemove', resetHideTimer);
            this.panel.addEventListener('click', resetHideTimer);
        }
        
        resetHideTimer();
    }
    
    /**
     * Helper methods for action buttons
     */
    resetToDefault() {
        this.manager.resetToDefault();
        this.updateStatusDisplay(this.panel);
    }
    
    toggleDebugMode() {
        if (this.manager.debugMode) {
            this.manager.disableDebugMode();
        } else {
            this.manager.enableDebugMode();
        }
    }
    
    exportSettings() {
        const settings = {
            userOverrides: this.manager.userOverrides,
            environment: this.manager.currentEnvironment,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], 
                             { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'xmb-menu-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Export for module systems or make globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuControlPanel;
} else {
    window.MenuControlPanel = MenuControlPanel;
}