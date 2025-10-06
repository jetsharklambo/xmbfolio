/**
 * Simple Blog System for XMB Portfolio
 * Reads .md files from blog/ folder and integrates with navigation
 */

class BlogSystem {
    constructor(config = window.xmbConfig) {
        this.config = config;
        this.posts = [];
        this.currentPost = null;
        
        // GitHub configuration for loading blog posts (now from config)
        this.githubRepo = this.config?.get('blog.githubRepo') || 'jetsharklambo/xmbfolio';
        this.githubPath = this.config?.get('blog.githubPath') || 'blog';
        this.githubApiUrl = this.config?.get('blog.githubApiUrl') || `https://api.github.com/repos/${this.githubRepo}/contents/${this.githubPath}`;
        this.enabled = this.config?.get('blog.enabled') !== false;
    }

    async initialize() {
        try {
            console.log('Initializing blog system...');
            await this.loadAllPosts();
            this.replaceBlogSubMenu();
            this.setupEventListeners();
            console.log(`Blog system initialized with ${this.posts.length} posts`);
        } catch (error) {
            console.error('Failed to initialize blog system:', error);
            this.setupFallbackMenu();
        }
    }

    async loadAllPosts() {
        console.log('Loading blog posts from GitHub...');
        
        try {
            // Fetch list of files from GitHub API
            const response = await fetch(this.githubApiUrl);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            
            const files = await response.json();
            console.log(`Found ${files.length} files in GitHub repo`);
            
            // Filter for markdown files
            const markdownFiles = files.filter(file => 
                file.type === 'file' && 
                (file.name.endsWith('.md') || file.name.endsWith('.markdown'))
            );
            
            console.log(`Found ${markdownFiles.length} markdown files`);
            
            // Load each markdown file
            const promises = markdownFiles.map(file => this.loadPost(file));
            const results = await Promise.allSettled(promises);
            
            this.posts = results
                .filter(result => result.status === 'fulfilled' && result.value !== null)
                .map(result => result.value)
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
            
            console.log(`Successfully loaded ${this.posts.length} blog posts from GitHub`);
            
        } catch (error) {
            console.error('Failed to load posts from GitHub:', error);
            this.posts = [];
        }
    }

    async loadPost(fileData) {
        try {
            console.log(`Loading blog post: ${fileData.name}`);
            
            // Fetch the raw file content from GitHub
            const response = await fetch(fileData.download_url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch ${fileData.name}: ${response.status} ${response.statusText}`);
            }
            
            const content = await response.text();
            const { frontmatter, body } = this.parseFrontmatter(content);
            
            console.log(`Successfully loaded: ${fileData.name}`);
            return {
                filename: fileData.name,
                title: frontmatter.title || 'Untitled Post',
                date: frontmatter.date || '2024-01-01',
                excerpt: frontmatter.excerpt || '',
                content: body,
                githubUrl: fileData.html_url // Store GitHub URL for reference
            };
        } catch (error) {
            console.error(`Failed to load ${fileData.name}:`, error.message);
            return null;
        }
    }

    parseFrontmatter(content) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        
        if (!match) {
            return { frontmatter: {}, body: content };
        }

        const frontmatterText = match[1];
        const body = match[2];
        const frontmatter = {};

        // Parse YAML-like frontmatter
        frontmatterText.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                frontmatter[key] = value;
            }
        });

        return { frontmatter, body };
    }

    replaceBlogSubMenu() {
        const logMenuItem = this.findLogMenuItem();
        if (!logMenuItem) {
            console.warn('Log menu item not found - menu may not be ready yet');
            // Store posts for later when menu system is ready
            window.pendingBlogPosts = this.posts;
            return;
        }

        const subMenuContainer = logMenuItem.querySelector('.sub-menu-item-container');
        if (!subMenuContainer) {
            console.error('Sub-menu container not found in Log menu item');
            return;
        }

        // Clear existing sub-menu items
        subMenuContainer.innerHTML = '';

        // Add blog posts as sub-menu items
        this.posts.forEach((post, index) => {
            const subMenuItem = this.createBlogSubMenuItem(post, index);
            subMenuContainer.appendChild(subMenuItem);
        });

        console.log(`Replaced Log sub-menu with ${this.posts.length} blog posts`);
    }

    findLogMenuItem() {
        const menuItems = document.querySelectorAll('.menu-item');
        for (const menuItem of menuItems) {
            const description = menuItem.querySelector('.menu-item-description');
            if (description && description.textContent.trim() === 'Log') {
                return menuItem;
            }
        }
        return null;
    }

    createBlogSubMenuItem(post, index) {
        console.log(`Creating blog sub-menu item: ${post.title} with index ${index}`);
        const subMenuItem = document.createElement('div');
        subMenuItem.className = 'sub-menu-item';
        subMenuItem.dataset.blogIndex = index;

        const formattedDate = this.formatDate(post.date);
        const excerpt = post.excerpt || '';

        subMenuItem.innerHTML = `
            <svg class="sub-menu-item-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.5,17H7.5L7.5,16L10.5,16V8H9L9,7H13.5V8H12V16H13.5V17Z" />
            </svg>
            <div class="sub-menu-item-content">
                <div class="sub-menu-item-header">${post.title}</div>
                <div class="sub-menu-item-date">${formattedDate}</div>
                <div class="sub-menu-item-excerpt">${excerpt}</div>
            </div>
        `;

        console.log('Created blog item with data-blog-index:', subMenuItem.dataset.blogIndex);
        return subMenuItem;
    }

    setupEventListeners() {
        console.log('Setting up blog event listeners...');
        
        // Remove existing blog click listener if it exists
        if (this.blogClickHandler) {
            document.removeEventListener('click', this.blogClickHandler, true);
        }
        
        // Create new blog click handler with higher priority
        this.blogClickHandler = (e) => {
            const subMenuItem = e.target.closest('.sub-menu-item[data-blog-index]');
            if (subMenuItem) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Blog click detected! Opening:', subMenuItem.querySelector('.sub-menu-item-header').textContent);
                const blogIndex = parseInt(subMenuItem.dataset.blogIndex);
                this.openBlogLink(blogIndex);
            }
        };
        
        // Listen for clicks on blog sub-menu items with capture priority
        document.addEventListener('click', this.blogClickHandler, true);

        // Listen for modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('blog-modal') || e.target.classList.contains('blog-modal-close')) {
                this.closeBlogPost();
            }
        });

        // Listen for escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentPost !== null) {
                this.closeBlogPost();
            }
        });
    }

    openBlogLink(index) {
        if (index < 0 || index >= this.posts.length) {
            console.error('Invalid blog post index:', index);
            return;
        }

        const post = this.posts[index];
        console.log(`Opening blog post: ${post.title} at ${post.githubUrl}`);
        
        // Extract first heading from markdown content and generate anchor
        const firstHeadingAnchor = this.extractFirstHeadingAnchor(post.content);
        const urlWithAnchor = firstHeadingAnchor ? `${post.githubUrl}${firstHeadingAnchor}` : post.githubUrl;
        
        // Open the GitHub markdown file in a new tab with anchor to first heading
        window.open(urlWithAnchor, '_blank');
    }

    openBlogPost(index) {
        if (index < 0 || index >= this.posts.length) {
            console.error('Invalid blog post index:', index);
            return;
        }

        const post = this.posts[index];
        this.currentPost = index;

        // Create modal if it doesn't exist
        let modal = document.getElementById('blog-modal');
        if (!modal) {
            modal = this.createBlogModal();
            document.body.appendChild(modal);
        }

        // Update modal content
        const title = modal.querySelector('.blog-modal-title');
        const date = modal.querySelector('.blog-modal-date');
        const content = modal.querySelector('.blog-modal-content');

        title.textContent = post.title;
        date.textContent = this.formatDate(post.date);
        content.innerHTML = this.markdownToHTML(post.content);

        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeBlogPost() {
        const modal = document.getElementById('blog-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'hidden'; // Keep overflow hidden (XMB style)
        }
        this.currentPost = null;
    }

    createBlogModal() {
        const modal = document.createElement('div');
        modal.id = 'blog-modal';
        modal.className = 'blog-modal';
        
        modal.innerHTML = `
            <div class="blog-modal-content-wrapper">
                <div class="blog-modal-header">
                    <h1 class="blog-modal-title"></h1>
                    <span class="blog-modal-date"></span>
                    <button class="blog-modal-close">&times;</button>
                </div>
                <div class="blog-modal-content"></div>
            </div>
        `;

        return modal;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Simple markdown to HTML converter (basic implementation)
    markdownToHTML(markdown) {
        return markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            // Wrap in paragraphs
            .replace(/^(.)/gm, '<p>$1')
            .replace(/$(.)/gm, '$1</p>')
            // Clean up extra paragraph tags
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<h[1-6]>)/g, '$1')
            .replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    }

    extractFirstHeadingAnchor(markdownContent) {
        // Find the first heading (# or ## or ###) in the markdown content
        const headingRegex = /^#+\s+(.+)$/m;
        const match = markdownContent.match(headingRegex);
        
        if (!match) {
            return null;
        }
        
        const headingText = match[1];
        
        // Generate GitHub-style anchor slug
        // Convert to lowercase, replace spaces with hyphens, preserve multiple hyphens
        const anchor = headingText
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        return `#${anchor}`;
    }

    setupFallbackMenu() {
        console.log('Setting up fallback menu for blog system');
        // Keep original Activity/Archive items if blog loading fails
    }
}

// Global blog system instance
window.blogSystem = new BlogSystem();