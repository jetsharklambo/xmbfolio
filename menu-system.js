/**
 * Dynamic Menu System for XMBFolio
 * Loads menu structure from GitHub and builds dynamic menus
 */

class MenuSystem {
    constructor(config = window.xmbConfig) {
        this.config = config;
        this.menuStructure = null;
        this.menuContainer = null;
        this.fallbackStructure = this.getDefaultMenuStructure();
        
        console.log('MenuSystem initialized');
    }
    
    async initialize() {
        try {
            console.log('Loading dynamic menu structure...');
            
            // Get menu container
            this.menuContainer = document.querySelector('.menu-container');
            if (!this.menuContainer) {
                throw new Error('Menu container not found');
            }
            
            // Load menu structure
            await this.loadMenuStructure();
            
            // Build dynamic menu
            this.buildMenu();
            
            console.log('Dynamic menu system initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize menu system:', error);
            console.log('Using fallback menu structure');
            
            // Use fallback structure
            this.menuStructure = this.fallbackStructure;
            this.buildMenu();
            return false;
        }
    }
    
    async loadMenuStructure() {
        // Try GitHub API first (production/preferred source)
        try {
            const menuUrl = this.config.get('menu.menuUrl');
            console.log('Fetching menu structure from GitHub:', menuUrl);
            
            const response = await fetch(menuUrl);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            
            const fileData = await response.json();
            const content = atob(fileData.content);
            this.menuStructure = JSON.parse(content);
            
            // Process template variables
            this.processTemplateVariables();
            
            console.log('Menu structure loaded from GitHub successfully');
            return true;
            
        } catch (githubError) {
            console.error('Failed to load from GitHub:', githubError);
            console.log('Attempting to load menu from local file...');
            
            // Try local file as fallback (development convenience)
            try {
                const localResponse = await fetch('/menu-structure.json');
                console.log('Local fetch response:', localResponse.status, localResponse.statusText);
                
                if (localResponse.ok) {
                    this.menuStructure = await localResponse.json();
                    
                    // Process template variables
                    this.processTemplateVariables();
                    
                    console.log('Menu structure loaded from local file successfully');
                    return true;
                } else {
                    throw new Error(`Local file error: ${localResponse.status} ${localResponse.statusText}`);
                }
            } catch (localError) {
                console.error('Failed to load from local file:', localError);
                console.log('Will use fallback menu structure');
                // Don't throw here - let initialize() handle fallback
                return false;
            }
        }
    }
    
    processTemplateVariables() {
        const config = this.config.config;
        
        // Convert config to flat object for template replacement
        const templateVars = this.flattenConfig(config);
        
        // Process menu structure recursively
        this.menuStructure = this.replaceTemplateVariables(this.menuStructure, templateVars);
    }
    
    flattenConfig(obj, prefix = '') {
        const flattened = {};
        
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(flattened, this.flattenConfig(value, newKey));
            } else {
                flattened[newKey] = value;
            }
        });
        
        return flattened;
    }
    
    replaceTemplateVariables(obj, vars) {
        if (typeof obj === 'string') {
            // Replace template variables like {username} or {github.username}
            return obj.replace(/\\{([^}]+)\\}/g, (match, key) => {
                return vars[key] || match;
            });
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.replaceTemplateVariables(item, vars));
        }
        
        if (typeof obj === 'object' && obj !== null) {
            const result = {};
            Object.keys(obj).forEach(key => {
                result[key] = this.replaceTemplateVariables(obj[key], vars);
            });
            return result;
        }
        
        return obj;
    }
    
    buildMenu() {
        // Clear existing menu
        this.menuContainer.innerHTML = '';
        
        // Build each menu item
        this.menuStructure.menuItems.forEach((menuItem, index) => {
            const menuElement = this.createMenuElement(menuItem, index);
            this.menuContainer.appendChild(menuElement);
        });
        
        console.log(`Built ${this.menuStructure.menuItems.length} menu items`);
    }
    
    createMenuElement(menuItem, index) {
        const menuDiv = document.createElement('div');
        menuDiv.className = 'menu-item';
        menuDiv.dataset.menuId = menuItem.id;
        
        // Create menu header
        const header = this.createMenuHeader(menuItem);
        menuDiv.appendChild(header);
        
        // Create sub-menu container
        const subContainer = this.createSubMenuContainer(menuItem);
        menuDiv.appendChild(subContainer);
        
        return menuDiv;
    }
    
    createMenuHeader(menuItem) {
        const header = document.createElement('div');
        header.className = 'menu-item-header';
        
        // Create icon
        const icon = this.createIcon(menuItem.icon);
        header.appendChild(icon);
        
        // Create description
        const description = document.createElement('div');
        description.className = 'menu-item-description';
        description.textContent = menuItem.title;
        header.appendChild(description);
        
        return header;
    }
    
    createSubMenuContainer(menuItem) {
        const container = document.createElement('div');
        container.className = 'sub-menu-item-container';
        
        // Handle dynamic content (like blog posts)
        if (menuItem.dynamicContent === 'blog') {
            container.dataset.dynamicContent = 'blog';
            // Blog system will populate this later
            return container;
        }
        
        // Create static sub-items
        menuItem.subItems.forEach((subItem, index) => {
            const subElement = this.createSubMenuElement(subItem, index);
            container.appendChild(subElement);
        });
        
        return container;
    }
    
    createSubMenuElement(subItem, index) {
        const subDiv = document.createElement('div');
        subDiv.className = 'sub-menu-item';
        subDiv.dataset.action = subItem.action || 'external_link';
        subDiv.dataset.url = subItem.url;
        
        // Create sub-item icon
        const icon = this.createIcon(subItem.icon);
        icon.setAttribute('class', 'sub-menu-item-icon');
        subDiv.appendChild(icon);
        
        // Create sub-item header
        const header = document.createElement('div');
        header.className = 'sub-menu-item-header';
        header.textContent = subItem.name;
        subDiv.appendChild(header);
        
        return subDiv;
    }
    
    createIcon(iconName) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'menu-item-icon');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Get icon path from structure or use default
        const iconPath = this.menuStructure?.icons?.[iconName] || this.getDefaultIcon();
        path.setAttribute('d', iconPath);
        
        svg.appendChild(path);
        return svg;
    }
    
    getDefaultIcon() {
        return "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z";
    }
    
    getDefaultMenuStructure() {
        return {
            "menuItems": [
                {
                    "id": "contact",
                    "title": "Contact",
                    "icon": "user",
                    "subItems": [
                        {
                            "name": "GitHub",
                            "url": `https://github.com/${this.config?.get('github.username') || 'jetsharklambo'}`,
                            "icon": "github",
                            "action": "external_link"
                        }
                    ]
                },
                {
                    "id": "projects", 
                    "title": "Projects",
                    "icon": "folder",
                    "subItems": [
                        {
                            "name": "Loading...",
                            "url": "#",
                            "icon": "info",
                            "action": "none"
                        }
                    ]
                }
            ],
            "icons": {
                "user": "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z",
                "folder": "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
                "github": "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z",
                "info": "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17C12.56,17 13,16.56 13,16V12C13,11.44 12.56,11 12,11C11.44,11 11,11.44 11,12V16C11,16.56 11.44,17 12,17M12,9A1,1 0 0,0 13,8A1,1 0 0,0 12,7A1,1 0 0,0 11,8A1,1 0 0,0 12,9Z"
            }
        };
    }
    
    // Method to handle sub-menu actions
    handleSubMenuAction(element) {
        const action = element.dataset.action;
        const url = element.dataset.url;
        
        switch (action) {
            case 'external_link':
                if (url && url !== '#') {
                    window.open(url, '_blank');
                }
                break;
            case 'internal_link':
                if (url && url !== '#') {
                    window.location.href = url;
                }
                break;
            case 'none':
            default:
                // No action
                break;
        }
    }
    
    // Get menu structure for other systems (like the navigation)
    getMenuStructure() {
        return this.menuStructure;
    }
    
    // Reload menu structure (useful for development/debugging)
    async reload() {
        try {
            await this.loadMenuStructure();
            this.buildMenu();
            return true;
        } catch (error) {
            console.error('Failed to reload menu:', error);
            return false;
        }
    }
}

// Global menu system instance
window.menuSystem = new MenuSystem();