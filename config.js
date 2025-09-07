/**
 * XMBFolio Configuration System
 * Central configuration that reads from environment variables or uses defaults
 */

class XMBConfig {
    constructor() {
        // Load configuration from various sources
        this.config = this.loadConfig();
    }

    loadConfig() {
        // In a static environment, we'll load from a generated config file
        // or fall back to defaults
        const envConfig = window.XMB_ENV_CONFIG || {};
        
        return {
            // Site Information
            siteTitle: envConfig.SITE_TITLE || 'Your Name',
            username: envConfig.USERNAME || 'yourusername',
            bioUrl: envConfig.BIO_URL || 'https://yourwebsite.com/',
            
            // Social Links
            github: {
                username: envConfig.GITHUB_USERNAME || 'yourusername',
                repo: envConfig.GITHUB_REPO || 'yourusername/yourrepo'
            },
            twitter: {
                handle: envConfig.TWITTER_HANDLE || 'yourhandle',
                url: envConfig.TWITTER_URL || 'https://x.com/yourhandle'
            },
            farcaster: {
                username: envConfig.FARCASTER_USERNAME || 'yourusername',
                url: envConfig.FARCASTER_URL || 'https://farcaster.xyz/yourusername'
            },
            
            // Blog System
            blog: {
                enabled: envConfig.ENABLE_BLOG !== 'false', // Default to true
                githubRepo: envConfig.BLOG_GITHUB_REPO || envConfig.GITHUB_REPO || 'jetsharklambo/xmbfolio',
                githubPath: envConfig.BLOG_PATH || 'blog',
                get githubApiUrl() {
                    return `https://api.github.com/repos/${this.githubRepo}/contents/${this.githubPath}`;
                }
            },
            
            // Menu System
            menu: {
                githubRepo: envConfig.MENU_GITHUB_REPO || envConfig.GITHUB_REPO || 'yourusername/yourrepo',
                menuPath: envConfig.MENU_PATH || 'v4',
                menuFile: envConfig.MENU_FILE || 'menu-structure.json',
                get menuUrl() {
                    return `https://api.github.com/repos/${this.githubRepo}/contents/${this.menuPath}/${this.menuFile}`;
                }
            },
            
            // Visual Configuration
            visual: {
                primaryColors: this.parseColors(envConfig.PRIMARY_COLORS) || ['#000000', '#1a3b1a', '#2d5a27', '#0f1f0f'],
                secondaryColors: this.parseColors(envConfig.SECONDARY_COLORS) || ['#0f1f0f', '#1a3b1a', '#2d5a27', '#4a7c59'],
                gradientSpeed: parseFloat(envConfig.GRADIENT_SPEED) || 0.3,
                gradientDistortion: parseFloat(envConfig.GRADIENT_DISTORTION) || 0.8,
                gradientSwirl: parseFloat(envConfig.GRADIENT_SWIRL) || 0.1,
                gradientOpacity: parseFloat(envConfig.GRADIENT_OPACITY) || 1.0,
                wireframeSpeed: parseFloat(envConfig.WIREFRAME_SPEED) || 0.2,
                wireframeOpacity: parseFloat(envConfig.WIREFRAME_OPACITY) || 0.4
            },
            
            // Debug Configuration
            debug: {
                enabled: envConfig.DEBUG_MODE === 'true',
                showBoundaries: envConfig.DEBUG_BOUNDARIES !== 'false',
                showCenter: envConfig.DEBUG_CENTER !== 'false',
                logPositionChanges: envConfig.DEBUG_LOG_POSITIONS !== 'false'
            }
        };
    }
    
    parseColors(colorString) {
        if (!colorString) return null;
        return colorString.split(',').map(color => color.trim());
    }
    
    // Getter methods for easy access
    get(path) {
        return this.getNestedValue(this.config, path);
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }
    
    // Update configuration at runtime (for debug/testing)
    update(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => current[key], this.config);
        if (target) {
            target[lastKey] = value;
        }
    }
    
    // Export current configuration as JSON
    export() {
        return JSON.stringify(this.config, null, 2);
    }
}

// Create global configuration instance
window.xmbConfig = new XMBConfig();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XMBConfig;
}