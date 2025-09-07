# XMBFolio v4 🎮

A stunning, fully customizable portfolio website inspired by Sony PlayStation 3's iconic XrossMediaBar (XMB) interface. Built with dynamic configuration, WebGL shaders, responsive design, and an integrated blog system.

## ✨ Features

- **🎯 Authentic XMB Navigation** - Faithful recreation of PS3's horizontal/vertical menu system
- **🔧 Dynamic Configuration** - Fully customizable through environment variables and JSON files
- **🎛️ Unlimited Menu Items** - Add/remove menu sections and items without touching code
- **🌊 Configurable WebGL Backgrounds** - Customizable colors, animations, and effects
- **📝 Integrated Blog System** - Markdown-powered blog posts that load dynamically from GitHub
- **📱 Cross-Platform Responsive** - Optimized for desktop, mobile, and tablet with touch support
- **⌨️ Multiple Input Methods** - Keyboard arrows, touch gestures, and mouse navigation
- **🚀 Zero-Code Customization** - Change everything through configuration files

## 🚀 Quick Start

### Option 1: Use with Defaults (Fastest)
```bash
# Clone and navigate
git clone https://github.com/jetsharklambo/xmbfolio.git
cd xmbfolio/v4

# Serve locally (required for dynamic loading)
python3 -m http.server 8000
# OR
npx serve .

# Open http://localhost:8000
```

### Option 2: Customize Everything
```bash
# Clone and navigate
git clone https://github.com/jetsharklambo/xmbfolio.git
cd xmbfolio/v4

# Copy configuration template
cp .env.example .env

# Edit .env with your information (see Configuration section below)
nano .env

# Install build dependencies (optional)
npm install

# Build with your configuration
npm run build

# Serve the customized site
npm run serve
```

## 📁 Project Structure

```
v4/
├── index.html                    # Main entry point
├── config.js                     # Configuration system
├── main.js                       # Core navigation logic 
├── menu-system.js                # Dynamic menu loader
├── blog-system.js                # GitHub API blog integration
├── mesh-gradient.js              # WebGL shader backgrounds
├── menu-config.js                # Menu positioning config
├── menu-position-manager.js      # Cross-platform positioning system
├── menu-control-panel.js         # Debug controls and user interface
├── menu-debug.js                 # Debug overlay and visualization
├── style.css                     # Responsive styling
├── menu-structure.json           # Dynamic menu configuration
├── .env.example                  # Configuration template
├── build.js                      # Build script for environment variables
├── package.json                  # NPM scripts and dependencies
├── SETUP.md                      # Detailed setup guide
└── blog/                         # Markdown blog posts (loaded via GitHub API)
    ├── 2024-12-01-vibecode-journey.md
    └── 2024-12-15-saltfree-story.md
```

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Personal Information
SITE_TITLE="Your Name"
USERNAME="yourhandle"
BIO_URL="https://yourwebsite.com"

# Social Links
GITHUB_USERNAME="yourusername"
TWITTER_HANDLE="yourhandle"
FARCASTER_USERNAME="yourhandle"

# Visual Customization
PRIMARY_COLORS="#000000,#1a3b1a,#2d5a27,#0f1f0f"
SECONDARY_COLORS="#0f1f0f,#1a3b1a,#2d5a27,#4a7c59"
GRADIENT_SPEED="0.3"
GRADIENT_DISTORTION="0.8"

# Blog System
ENABLE_BLOG="true"
BLOG_GITHUB_REPO="yourusername/yourrepo"
```

### Dynamic Menu (menu-structure.json)
The menu structure is completely customizable. Edit `menu-structure.json` to:
- Add unlimited menu sections
- Customize social links
- Add project portfolios
- Create custom categories

Example menu item:
```json
{
  "id": "projects",
  "title": "My Projects",
  "icon": "folder", 
  "description": "What I've Built",
  "subItems": [
    {
      "name": "Cool App",
      "url": "https://mycoolapp.com",
      "icon": "rocket",
      "action": "external_link"
    }
  ]
}
```

## 🔧 Setup Methods

### Method 1: Local Development (Immediate)
1. **File is served locally** - `menu-structure.json` loads from the same directory
2. **No GitHub needed** - Works immediately for testing and development
3. **Perfect for customization** - Edit files and see changes instantly

### Method 2: Production with GitHub (Advanced)
1. **Push to GitHub** - Commit `menu-structure.json` to your repository
2. **Dynamic loading** - Menu loads from GitHub API automatically
3. **Live updates** - Change menu by editing GitHub files (no redeploy needed)

### Method 3: Static Build (Deployment)
1. **Environment variables** - Set all config in hosting platform
2. **Build process** - Run `npm run build` to generate configuration
3. **Deploy anywhere** - Works on Vercel, Netlify, GitHub Pages, etc.

## 🎛️ Menu System Explained

### How It Works
1. **On page load** - Menu system checks for `menu-structure.json`
2. **Try local first** - Loads from same directory if available
3. **Fallback to GitHub** - Uses GitHub API if local file not found
4. **Fallback to defaults** - Uses hardcoded menu if both fail
5. **Template variables** - Replaces `{username}`, `{github.username}`, etc.

### Adding Custom Menu Items
Edit `menu-structure.json` to add unlimited:
- **Social platforms** (Twitter, LinkedIn, Instagram, etc.)
- **Project portfolios** (GitHub repos, live sites, app stores)
- **Custom sections** (Services, Resume, Gallery, etc.)
- **External links** (Blog, YouTube, Podcast, etc.)

### Template Variables Available
- `{username}` - Your display name
- `{siteTitle}` - Site title from config
- `{github.username}` - GitHub username
- `{twitter.url}` - Full Twitter URL
- `{farcaster.url}` - Full Farcaster URL
- `{bioUrl}` - Personal website URL

## 🎮 Navigation

### Desktop
- **Arrow Keys**: Navigate through menus
- **Mouse**: Click on menu items to navigate
- **Hover**: Visual feedback on interactive elements

### Mobile
- **Touch**: Tap menu items to navigate
- **Swipe Gestures**: 
  - Horizontal swipes: Navigate main menu
  - Vertical swipes: Navigate sub-menus

## 📝 Blog System

The integrated blog system uses the **GitHub API** to automatically discover and load Markdown files from the repository's `blog/` folder. Blog posts appear dynamically in the Log menu section.

### How It Works

1. **Automatic Discovery**: The system fetches all `.md` files from the GitHub repository
2. **GitHub API Integration**: Uses `https://api.github.com/repos/jetsharklambo/xmbfolio/contents/blog`
3. **Dynamic Loading**: Blog posts are loaded and parsed automatically on page load
4. **GitHub Links**: Clicking a blog post opens the GitHub page with an anchor to the first heading

### Creating Blog Posts

1. **Create a new `.md` file** in the `blog/` folder
2. **Add frontmatter** with required fields:

```markdown
---
title: "Your Post Title"
date: "2024-01-15"
excerpt: "Brief description of your post"
---

# Your Post Content

Write your blog content in Markdown format...
```

3. **Commit to GitHub** - The post will automatically appear in the menu (no code changes needed!)

### Blog Features

- **GitHub API Integration**: Automatic discovery of new blog posts
- **Smart Link Generation**: Links to GitHub with anchors to first headings
- **Frontmatter Parsing**: Automatic title, date, and excerpt extraction  
- **Zero Configuration**: No manual file registration required
- **GitHub Rendering**: Posts display with GitHub's native Markdown renderer
- **Configurable**: Enable/disable via `ENABLE_BLOG` environment variable

## 🚨 Troubleshooting

### Menu Not Appearing
**Problem**: You see "Loading..." but no menu items appear.

**Solutions**:
1. **For local development**: Make sure you're serving with a web server (not opening `file://` directly)
   ```bash
   python3 -m http.server 8000  # Required for local file loading
   ```

2. **Check browser console** for error messages:
   - Right-click → Inspect → Console
   - Look for network errors or JavaScript errors

3. **Verify menu-structure.json** is valid:
   ```bash
   # Check if file exists and is valid JSON
   cat menu-structure.json | python3 -m json.tool
   ```

### GitHub API Issues
**Problem**: Menu loads but blog posts don't appear, or API errors in console.

**Solutions**:
1. **Rate limiting**: GitHub API has limits. Wait a few minutes and try again.
2. **Repository URL**: Ensure `BLOG_GITHUB_REPO` is correct in your config.
3. **File paths**: Verify blog posts are in the correct folder path.
4. **Repository privacy**: Ensure repository is public for API access.

### Configuration Not Working
**Problem**: Changed `.env` but nothing happens.

**Solutions**:
1. **Run build process**:
   ```bash
   npm run build  # Generates config from .env
   ```
2. **Clear browser cache**: Configuration is cached by browsers.
3. **Check generated files**: Look for `config.generated.js` after build.

### Colors Not Changing
**Problem**: Modified color values but background stays the same.

**Solutions**:
1. **Hex format**: Ensure colors are 6-digit hex values like `#000000`
2. **Comma separation**: Multiple colors should be comma-separated
3. **Build process**: Run `npm run build` to apply changes
4. **Hard refresh**: Clear cache with Ctrl+F5 (or Cmd+Shift+R on Mac)

## 🏗️ Deployment

### Vercel (Recommended)
1. **Connect repository** to Vercel
2. **Add environment variables** in Vercel dashboard  
3. **Deploy** - automatically builds and serves

### Netlify
1. **Connect repository** to Netlify
2. **Set build command**: `npm run build`
3. **Add environment variables** in site settings
4. **Deploy** - builds automatically on push

### GitHub Pages
1. **Create `.github/workflows/deploy.yml`**:
   ```yaml
   name: Deploy
   on: push
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
   ```
2. **Add secrets** for environment variables
3. **Enable GitHub Pages** from Actions

### Static Hosting
For any static host (Firebase, AWS S3, etc.):
1. **Build locally**: `npm run build`
2. **Upload entire v4 folder** to hosting
3. **Ensure web server** serves `index.html` for root requests

### GitHub Configuration

The blog system is configured to work with this repository by default. To use with your own repository:

```javascript
// In blog-system.js, update these values:
this.githubRepo = 'yourusername/yourrepository';
this.githubPath = 'blog'; // or your preferred folder name
```

## 🎨 Customization

### Colors

Modify the gradient colors in `main.js`:

```javascript
// Primary gradient layer
const primaryGradient = new MeshGradientRenderer('background-primary', {
    colors: ['#000000', '#1a3b1a', '#2d5a27', '#0f1f0f'], // Customize these
    speed: 0.3,
    distortion: 0.8,
    opacity: 1.0
});
```

### Menu Items

Edit the menu structure in `index.html`:

```html
<div class="menu-item">
    <div class="menu-item-header">
        <svg class="menu-item-icon" viewBox="0 0 24 24">
            <!-- Your custom SVG icon -->
        </svg>
        <div class="menu-item-description">Your Menu Item</div>
    </div>
    <!-- Sub-menu items -->
</div>
```

### Positioning

Adjust menu positioning for different browsers in `main.js`:

```javascript
// Mobile positioning
let rightPercent = isMobileDevice ? 0.0 : 0.25;
let horizontalOffset = isMobileDevice ? 0 : 0;
```

## 🌐 Browser Support

- **WebGL Required**: Modern browsers with WebGL support
- **Tested Browsers**: 
  - Chrome/Chromium (Desktop & Mobile)
  - Safari (Desktop & Mobile) - with specific positioning adjustments
  - Firefox (Desktop & Mobile)
  - Edge (Desktop & Mobile)

## 📱 Mobile Optimizations

- **Touch-first Design**: Optimized touch targets and gestures
- **Performance**: Reduced animations and optimized rendering
- **Responsive Layout**: Adaptive sizing for different screen sizes
- **Safari Compatibility**: Special positioning adjustments for Safari mobile

## 🛠️ Technical Details

### Core Technologies
- **Vanilla JavaScript** - No external dependencies
- **WebGL/WebGL2** - Hardware-accelerated background rendering
- **GitHub API** - Dynamic blog post loading
- **CSS3 Transforms** - Smooth menu animations
- **Frontmatter Parsing** - Custom YAML-like parser
- **Responsive CSS** - Mobile-first design approach

### Performance Features
- **Hardware Acceleration** - WebGL rendering for smooth animations
- **Comprehensive Positioning System** - Platform-specific configurations with debug controls
- **Efficient API Usage** - Cached GitHub requests with smart loading
- **Mobile Optimization** - Touch-optimized interface with floating debug controls
- **Cross-Browser Compatibility** - Browser-specific positioning adjustments

### Advanced Features
- **Debug Control Panel** - Real-time menu positioning with visual feedback
- **Environment Detection** - Automatic device, browser, and viewport detection
- **User Preferences** - LocalStorage persistence for custom positioning
- **Touch Gesture Support** - Native touch events with conflict resolution
- **GitHub Link Anchors** - Smart heading detection for direct navigation

## 📋 Development Notes

- **Positioning System**: Comprehensive cross-platform menu positioning with debug controls
- **GitHub Integration**: Blog system fetches posts dynamically via GitHub API
- **WebGL Backgrounds**: Dual-layer mesh gradient rendering for visual depth
- **Mobile Optimization**: Touch-first design with floating debug controls
- **Browser Detection**: Automatic environment detection with platform-specific configurations

## 🎯 Version History

- **v3** (Current) - Full-featured XMB with blog system and WebGL backgrounds
- **v2** - Simplified XMB implementation with gradient backgrounds  
- **v1** - Initial XMB recreation with basic navigation

## 🙏 Credits & Acknowledgments

This project builds upon the excellent work of:

- **Menu System**: Inspired by and adapted from [ps3-xmb-menu](https://github.com/mustafaHTP/ps3-xmb-menu) by [mustafaHTP](https://github.com/mustafaHTP)
- **WebGL Background**: Based on mesh gradient shaders from [Paper Design Shaders](https://github.com/paper-design/shaders)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Created with ❤️ as a tribute to the iconic PlayStation 3 XrossMediaBar interface**