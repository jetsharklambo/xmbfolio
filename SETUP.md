# XMBFolio v4 Setup Guide

Welcome to XMBFolio v4! This guide will help you set up and customize your own PlayStation 3 XMB-inspired portfolio website with dynamic configuration.

## 🚀 Quick Start

### 1. Clone or Download
```bash
git clone https://github.com/jetsharklambo/xmbfolio.git
cd xmbfolio/v4
```

### 2. Basic Setup (No Customization)
```bash
# Serve the site locally
python3 -m http.server 8000
# OR
npx serve .

# Open http://localhost:8000
```

That's it! The site will work with default settings.

### 3. Custom Configuration Setup
```bash
# Copy environment template
cp .env.example .env

# Install Node.js dependencies (optional, for build process)
npm install

# Edit .env with your information
# Then build with your custom config
npm run build

# Serve the customized site
npm run serve
```

## 📝 Customization Options

### Personal Information
```env
SITE_TITLE="Your Name"
USERNAME="yourhandle"
BIO_URL="https://yourwebsite.com"
```

### Social Links
```env
GITHUB_USERNAME="yourusername"
TWITTER_HANDLE="yourhandle" 
FARCASTER_USERNAME="yourhandle"
```

### Blog System
```env
ENABLE_BLOG="true"
BLOG_GITHUB_REPO="yourusername/yourrepo"
BLOG_PATH="blog"
```

### Visual Customization
```env
# Colors (comma-separated hex values)
PRIMARY_COLORS="#000000,#1a3b1a,#2d5a27,#0f1f0f"
SECONDARY_COLORS="#0f1f0f,#1a3b1a,#2d5a27,#4a7c59"

# Animation settings (0.0 to 1.0)
GRADIENT_SPEED="0.3"
GRADIENT_DISTORTION="0.8"
GRADIENT_SWIRL="0.1"
```

## 🎛️ Dynamic Menu Configuration

### How It Works
XMBFolio v4 loads your menu structure from `menu-structure.json` in your GitHub repository. This means you can:
- Add unlimited menu items
- Create custom menu sections
- Add/remove social links
- Change everything without touching code

### Menu Structure Format
```json
{
  "menuItems": [
    {
      "id": "contact",
      "title": "{username}",
      "icon": "user",
      "description": "Contact & Social Links",
      "subItems": [
        {
          "name": "GitHub",
          "url": "https://github.com/{github.username}",
          "icon": "github",
          "action": "external_link"
        }
      ]
    }
  ]
}
```

### Template Variables
Use these in your `menu-structure.json`:
- `{username}` - Your display name
- `{github.username}` - Your GitHub username  
- `{bioUrl}` - Your bio website URL
- `{twitter.url}` - Your Twitter URL
- `{farcaster.url}` - Your Farcaster URL

### Adding Custom Menu Items

**Example: Add a "Services" menu**
```json
{
  "id": "services",
  "title": "Services", 
  "icon": "briefcase",
  "description": "What I Offer",
  "subItems": [
    {
      "name": "Web Development",
      "url": "https://yoursite.com/web-dev",
      "icon": "code",
      "action": "external_link"
    },
    {
      "name": "Consulting",
      "url": "https://yoursite.com/consulting", 
      "icon": "chat",
      "action": "external_link"
    }
  ]
}
```

### Custom Icons
Add custom SVG paths to the `icons` section:
```json
"icons": {
  "briefcase": "M14,6V4H10V6H4A2,2 0 0,0 2,8V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V8A2,2 0 0,0 20,6H14Z",
  "code": "M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z"
}
```

## 📝 Blog System

### Automatic Blog Posts
The blog system automatically discovers `.md` files in your GitHub repository. Just:

1. Create a `.md` file in your `blog/` folder
2. Add frontmatter with title, date, and excerpt
3. Commit to GitHub
4. Your post appears instantly in the Log menu!

### Blog Post Format
```markdown
---
title: "Your Post Title"
date: "2024-12-07"
excerpt: "Brief description of your post"
---

# Your Post Content

Write your blog content in Markdown format...
```

### Disable Blog System
Set `ENABLE_BLOG="false"` in your `.env` file.

## 🎨 Color Themes

### Predefined Themes

**Dark Green (Default)**
```env
PRIMARY_COLORS="#000000,#1a3b1a,#2d5a27,#0f1f0f"
SECONDARY_COLORS="#0f1f0f,#1a3b1a,#2d5a27,#4a7c59"
```

**Ocean Blue**
```env
PRIMARY_COLORS="#000033,#001a4d,#003366,#000d1a"
SECONDARY_COLORS="#000d1a,#001a4d,#003366,#4d79a4"
```

**Purple Haze**
```env
PRIMARY_COLORS="#1a0033,#2d004d,#400066,#0d001a"
SECONDARY_COLORS="#0d001a,#2d004d,#400066,#7a4d99"
```

**Cyberpunk**
```env
PRIMARY_COLORS="#0a0a0a,#1a0a1a,#2a1a2a,#0f0f0f"
SECONDARY_COLORS="#ff0080,#00ff80,#8000ff,#80ff00"
```

## 🏗️ Deployment

### Static Hosting (Recommended)

**Vercel**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

**Netlify**
1. Connect repository to Netlify
2. Add environment variables in site settings
3. Deploy automatically

**GitHub Pages**
1. Run `npm run build` locally
2. Commit the generated files
3. Enable GitHub Pages on your repository

### Environment Variables for Hosting

Most hosting platforms support environment variables. Add your customization variables to your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables  
- **Railway**: Variables tab
- **Render**: Environment section

## 🛠️ Development

### Local Development
```bash
# Serve with live reload
npm run dev

# Build for production
npm run build

# Validate configuration
npm run validate
```

### File Structure
```
v4/
├── config.js                    # Configuration system
├── menu-system.js              # Dynamic menu loader
├── menu-structure.json         # Menu configuration
├── blog-system.js              # Blog post loader
├── main.js                     # Navigation logic
├── mesh-gradient.js            # WebGL backgrounds
├── build.js                    # Build script
├── .env.example               # Configuration template
├── package.json               # NPM scripts
└── SETUP.md                   # This file
```

### Custom Development

**Add New Configuration Options**
1. Add to `config.js` - the central configuration reader
2. Add to `.env.example` - so users know it exists  
3. Add to `build.js` - so it gets processed during build
4. Use in your code: `window.xmbConfig.get('your.setting')`

**Modify Menu Behavior**
1. Edit `menu-system.js` for loading logic
2. Edit `main.js` for navigation behavior
3. Edit `menu-structure.json` for content

## 🔧 Troubleshooting

### Site Not Loading
- Check browser console for errors
- Ensure you're serving from a web server (not `file://`)
- Verify GitHub API isn't rate limited

### Menu Not Appearing  
- Check `menu-structure.json` is valid JSON
- Verify GitHub repository URL in config
- Check browser network tab for failed API requests

### Blog Posts Not Showing
- Ensure blog `.md` files have proper frontmatter
- Check GitHub API rate limits
- Verify `BLOG_GITHUB_REPO` setting

### Colors Not Changing
- Run `npm run build` after changing `.env`
- Check hex color format (must be 6 digits with #)
- Clear browser cache

## 💡 Tips

1. **Start Simple**: Use defaults first, then customize gradually
2. **Test Locally**: Always test changes with `npm run serve`
3. **Backup Config**: Keep your `.env` and `menu-structure.json` backed up
4. **Monitor API**: GitHub API has rate limits - cache locally when developing
5. **Mobile First**: Test on mobile devices - menu positioning is responsive

## 🆘 Support

- **Documentation**: Check all `.md` files in the repository
- **Examples**: See `.env.example` and `menu-structure.json`
- **Issues**: Report problems on the GitHub repository
- **Community**: Check GitHub Discussions for help

---

🎮 **Enjoy your new XMB-inspired portfolio!**