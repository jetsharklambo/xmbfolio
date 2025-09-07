/**
 * Comprehensive Menu Positioning Configuration
 * Single source of truth for all menu positioning values
 */

const MenuConfig = {
    // Viewport breakpoints for responsive design
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        wide: 1440
    },
    
    // Platform-specific positioning presets
    // Values can be percentages (string) or pixels (number)
    platforms: {
        mobile: {
            ios: { 
                top: '30%', 
                right: '32%', 
                scale: 0.85,
                horizontalMove: 100,
                verticalMove: 90
            },
            android: { 
                top: '32%', 
                right: '32%', 
                scale: 0.85,
                horizontalMove: 100,
                verticalMove: 90
            },
            default: { 
                top: '31%', 
                right: '32%', 
                scale: 0.85,
                horizontalMove: 100,
                verticalMove: 90
            }
        },
        tablet: {
            safari: { 
                top: '35%', 
                right: '15%', 
                scale: 0.95,
                horizontalMove: 140,
                verticalMove: 110
            },
            default: { 
                top: '40%', 
                right: '20%', 
                scale: 1.0,
                horizontalMove: 140,
                verticalMove: 110
            }
        },
        desktop: {
            safari: { 
                top: '35%', 
                right: '25%', 
                scale: 1.0,
                horizontalMove: 170,
                verticalMove: 120
            },
            chrome: { 
                top: '45%', 
                right: '25%', 
                scale: 1.0,
                horizontalMove: 170,
                verticalMove: 120
            },
            firefox: { 
                top: '43%', 
                right: '25%', 
                scale: 1.0,
                horizontalMove: 170,
                verticalMove: 120
            },
            edge: { 
                top: '45%', 
                right: '25%', 
                scale: 1.0,
                horizontalMove: 170,
                verticalMove: 120
            },
            default: { 
                top: '45%', 
                right: '25%', 
                scale: 1.0,
                horizontalMove: 170,
                verticalMove: 120
            }
        },
        wide: {
            default: { 
                top: '45%', 
                right: '30%', 
                scale: 1.0,
                horizontalMove: 170,
                verticalMove: 120
            }
        }
    },
    
    // Menu dimensions for boundary calculations
    menuDimensions: {
        mobile: {
            itemWidth: 120,
            itemHeight: 500,
            subItemWidth: 300,
            subItemHeight: 100
        },
        tablet: {
            itemWidth: 150,
            itemHeight: 550,
            subItemWidth: 350,
            subItemHeight: 110
        },
        desktop: {
            itemWidth: 170,
            itemHeight: 600,
            subItemWidth: 400,
            subItemHeight: 120
        }
    },
    
    // Animation and transition settings
    animation: {
        transitionDuration: 300, // milliseconds
        easing: 'ease-in-out',
        navigationEasing: 'ease-in',
        snapBackDuration: 400
    },
    
    // Boundary constraints (percentage of viewport)
    boundaries: {
        top: 5,      // minimum 5% from top
        bottom: 5,   // minimum 5% from bottom
        left: 5,     // minimum 5% from left
        right: 5     // minimum 5% from right
    },
    
    // Debug mode settings
    debug: {
        enabled: false,
        showBoundaries: true,
        showCenter: true,
        showGrid: false,
        logPositionChanges: true
    },
    
    // Z-index management
    zIndex: {
        background: -12,
        backgroundOverlay: -11,
        menu: 1000,
        subMenu: 1001,
        modal: 2000,
        debug: 3000,
        controls: 3001
    },
    
    // User preference keys for localStorage
    storageKeys: {
        userPosition: 'xmb_menu_user_position',
        debugMode: 'xmb_menu_debug_mode',
        customPresets: 'xmb_menu_custom_presets'
    },
    
    // Preset positions for quick access
    presets: {
        topLeft: { top: '10%', right: '75%', scale: 1.0 },
        topCenter: { top: '10%', right: '45%', scale: 1.0 },
        topRight: { top: '10%', right: '10%', scale: 1.0 },
        centerLeft: { top: '45%', right: '75%', scale: 1.0 },
        center: { top: '45%', right: '45%', scale: 1.0 },
        centerRight: { top: '45%', right: '10%', scale: 1.0 },
        bottomLeft: { top: '80%', right: '75%', scale: 1.0 },
        bottomCenter: { top: '80%', right: '45%', scale: 1.0 },
        bottomRight: { top: '80%', right: '10%', scale: 1.0 }
    }
};

// Export for module systems or make globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuConfig;
} else {
    window.MenuConfig = MenuConfig;
}