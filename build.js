#!/usr/bin/env node

/**
 * XMBFolio Build Script
 * Generates configuration from environment variables for static deployment
 */

const fs = require('fs');
const path = require('path');

// Load environment variables if .env file exists
if (fs.existsSync('.env')) {
    require('dotenv').config();
}

const args = process.argv.slice(2);
const isValidateOnly = args.includes('--validate-only');
const isDev = args.includes('--dev');

console.log('🚀 XMBFolio Build Script');
console.log('========================');

// Environment variables to configuration mapping
const envMapping = {
    // Site Information
    'SITE_TITLE': 'siteTitle',
    'USERNAME': 'username', 
    'BIO_URL': 'bioUrl',
    
    // Social Links
    'GITHUB_USERNAME': 'github.username',
    'GITHUB_REPO': 'github.repo',
    'TWITTER_HANDLE': 'twitter.handle',
    'TWITTER_URL': 'twitter.url',
    'FARCASTER_USERNAME': 'farcaster.username',
    'FARCASTER_URL': 'farcaster.url',
    
    // Blog System
    'ENABLE_BLOG': 'blog.enabled',
    'BLOG_GITHUB_REPO': 'blog.githubRepo',
    'BLOG_PATH': 'blog.githubPath',
    
    // Menu System
    'MENU_GITHUB_REPO': 'menu.githubRepo',
    'MENU_PATH': 'menu.menuPath',
    'MENU_FILE': 'menu.menuFile',
    
    // Visual Configuration
    'PRIMARY_COLORS': 'visual.primaryColors',
    'SECONDARY_COLORS': 'visual.secondaryColors',
    'GRADIENT_SPEED': 'visual.gradientSpeed',
    'GRADIENT_DISTORTION': 'visual.gradientDistortion',
    'GRADIENT_SWIRL': 'visual.gradientSwirl',
    'GRADIENT_OPACITY': 'visual.gradientOpacity',
    'WIREFRAME_SPEED': 'visual.wireframeSpeed',
    'WIREFRAME_OPACITY': 'visual.wireframeOpacity',
    
    // Debug
    'DEBUG_MODE': 'debug.enabled',
    'DEBUG_BOUNDARIES': 'debug.showBoundaries',
    'DEBUG_CENTER': 'debug.showCenter',
    'DEBUG_LOG_POSITIONS': 'debug.logPositionChanges'
};

function parseValue(value, key) {
    if (!value) return undefined;
    
    // Boolean values
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Number values
    if (key.includes('SPEED') || key.includes('DISTORTION') || 
        key.includes('SWIRL') || key.includes('OPACITY')) {
        const num = parseFloat(value);
        return isNaN(num) ? undefined : num;
    }
    
    // Color arrays
    if (key.includes('COLORS')) {
        return value.split(',').map(color => color.trim());
    }
    
    return value;
}

function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!current[key]) current[key] = {};
        return current[key];
    }, obj);
    target[lastKey] = value;
}

function generateConfig() {
    const config = {};
    const foundVars = [];
    
    console.log('📝 Processing environment variables...');
    
    Object.entries(envMapping).forEach(([envKey, configPath]) => {
        const value = parseValue(process.env[envKey], envKey);
        if (value !== undefined) {
            setNestedValue(config, configPath, value);
            foundVars.push(`${envKey} -> ${configPath}`);
        }
    });
    
    if (foundVars.length > 0) {
        console.log(`✅ Found ${foundVars.length} environment variables:`);
        foundVars.forEach(var_info => console.log(`   ${var_info}`));
    } else {
        console.log('ℹ️  No environment variables found, using defaults');
    }
    
    return config;
}

function validateConfig() {
    console.log('🔍 Validating configuration...');
    
    const warnings = [];
    const errors = [];
    
    // Check for .env file
    if (!fs.existsSync('.env') && !isDev) {
        warnings.push('.env file not found - using defaults');
    }
    
    // Check for required GitHub repo format
    const githubRepo = process.env.GITHUB_REPO || process.env.BLOG_GITHUB_REPO;
    if (githubRepo && !githubRepo.includes('/')) {
        errors.push('GITHUB_REPO must be in format "username/repo"');
    }
    
    // Check color format
    const primaryColors = process.env.PRIMARY_COLORS;
    if (primaryColors) {
        const colors = primaryColors.split(',');
        const invalidColors = colors.filter(color => !color.trim().match(/^#[0-9a-fA-F]{6}$/));
        if (invalidColors.length > 0) {
            errors.push(`Invalid hex colors in PRIMARY_COLORS: ${invalidColors.join(', ')}`);
        }
    }
    
    // Check numeric values
    const numericVars = ['GRADIENT_SPEED', 'GRADIENT_DISTORTION', 'GRADIENT_SWIRL', 'GRADIENT_OPACITY'];
    numericVars.forEach(varName => {
        const value = process.env[varName];
        if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0 || parseFloat(value) > 1)) {
            errors.push(`${varName} must be a number between 0 and 1`);
        }
    });
    
    // Display results
    if (warnings.length > 0) {
        console.log('⚠️  Warnings:');
        warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (errors.length > 0) {
        console.log('❌ Errors:');
        errors.forEach(error => console.log(`   ${error}`));
        return false;
    }
    
    console.log('✅ Configuration is valid');
    return true;
}

function writeConfigFile(config) {
    const configContent = `// Generated configuration file
// This file is auto-generated by build.js - do not edit manually
// Last generated: ${new Date().toISOString()}

window.XMB_ENV_CONFIG = ${JSON.stringify(config, null, 2)};

console.log('XMBFolio: Loaded environment configuration');
`;

    const outputFile = 'config.generated.js';
    fs.writeFileSync(outputFile, configContent);
    console.log(`📄 Generated ${outputFile}`);
    
    return outputFile;
}

function updateIndexHtml(configFile) {
    const indexPath = 'index.html';
    
    if (!fs.existsSync(indexPath)) {
        console.log('❌ index.html not found');
        return false;
    }
    
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Check if config script is already included
    if (content.includes('config.generated.js')) {
        console.log('ℹ️  index.html already includes generated config');
        return true;
    }
    
    // Add config script before config.js
    const configScriptTag = `        <script src="${configFile}"></script>`;
    
    if (content.includes('<script src="config.js">')) {
        content = content.replace(
            '<script src="config.js">',
            `${configScriptTag}\n        <script src="config.js">`
        );
    } else {
        // Add before mesh-gradient.js as fallback
        content = content.replace(
            '<script src="mesh-gradient.js">',
            `${configScriptTag}\n        <script src="mesh-gradient.js">`
        );
    }
    
    fs.writeFileSync(indexPath, content);
    console.log('📄 Updated index.html with config script');
    
    return true;
}

// Main execution
async function main() {
    try {
        // Validate configuration
        if (!validateConfig()) {
            process.exit(1);
        }
        
        if (isValidateOnly) {
            console.log('✅ Validation complete - configuration is valid');
            return;
        }
        
        // Generate configuration
        const config = generateConfig();
        
        // Write configuration file
        const configFile = writeConfigFile(config);
        
        // Update HTML to include generated config
        updateIndexHtml(configFile);
        
        console.log('✅ Build complete!');
        console.log('\nNext steps:');
        console.log('1. Run "npm run serve" to test locally');
        console.log('2. Deploy the entire directory to your hosting platform');
        console.log('3. Your site will use the generated configuration');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { generateConfig, validateConfig, writeConfigFile };