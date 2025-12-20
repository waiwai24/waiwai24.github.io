const fs = require('fs-extra');
const path = require('path');
const MarkdownIt = require('markdown-it');

const knowledgeTreePath = path.join(__dirname, 'assets', 'data', 'notes-tree.json');
const outputDir = path.join(__dirname, 'articles');
const contentTemplatePath = path.join(__dirname, '_includes', 'article-template.html');
const sitemapPath = path.join(__dirname, 'sitemap.xml');

// Website base URL (change this to your actual domain)
const BASE_URL = 'https://waiwai24.github.io';

// Array to collect all generated article URLs
const generatedUrls = [];

// Initialize markdown-it
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

// Generate sidebar HTML from tree structure (matching notes.min.js structure)
function generateSidebarHtml(nodes, currentPath, relativePath, level = 0) {
    let html = '<ul>';

    for (const node of nodes) {
        if (node.type === 'directory' && node.children && node.children.length > 0) {
            // Check if current article is in this directory (for auto-expand)
            const isInPath = currentPath.startsWith(node.path);
            const openAttr = isInPath ? ' open' : '';

            html += '<li>';
            html += `<details class="folder-details"${openAttr}>`;
            html += `<summary class="folder-summary">`;
            html += `<svg class="icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
            html += `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
            html += `<span class="folder-name">${node.name}</span>`;
            html += `</summary>`;
            html += generateSidebarHtml(node.children, currentPath, relativePath, level + 1);
            html += `</details>`;
            html += '</li>';
        } else if (node.type === 'file' && node.name.endsWith('.md')) {
            const htmlPath = relativePath + 'articles/' + node.path.replace(/\.md$/, '.html');
            const isActive = node.path === currentPath;
            const activeClass = isActive ? ' active' : '';
            const displayName = node.name.replace(/\.md$/, '');

            html += '<li>';
            html += `<a href="${htmlPath}" class="file${activeClass}" data-path="${node.path}">`;
            html += `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
            html += `<span>${displayName}</span>`;
            html += `</a>`;
            html += '</li>';
        }
    }

    html += '</ul>';
    return html;
}

async function main() {
    try {
        await fs.emptyDir(outputDir);
        console.log('Output directory cleaned.');

        const knowledgeTree = await fs.readJson(knowledgeTreePath);
        console.log('Knowledge tree loaded.');

        const template = await fs.readFile(contentTemplatePath, 'utf-8');
        console.log('Article template loaded.');

        if (knowledgeTree.children && knowledgeTree.children.length > 0) {
            await processNodes(knowledgeTree.children, template, knowledgeTree);
        }

        // Generate sitemap.xml
        await generateSitemap();

        console.log('✅ Static site generation complete!');

    } catch (error) {
        console.error('❌ Error during build process:', error);
        process.exit(1);
    }
}

async function processNodes(nodes, template, fullTree) {
    for (const node of nodes) {
        if (node.type === 'directory' && node.children) {
            await processNodes(node.children, template, fullTree);
        } else if (node.type === 'file' && node.name.endsWith('.md')) {
            await generateHtmlFromMarkdown(node, template, fullTree);
        }
    }
}

async function generateHtmlFromMarkdown(node, template, fullTree) {
    try {
        const mdPath = path.join(__dirname, node.path);
        const mdContent = await fs.readFile(mdPath, 'utf-8');

        const depth = node.path.split('/').length - 1;
        const relativePath = '../'.repeat(depth);

        // Override the image rule for this specific file
        md.renderer.rules.image = (tokens, idx, options, env, self) => {
            const token = tokens[idx];
            const src = token.attrGet('src');
            const alt = self.renderInlineAsText(token.children, options, env);

            if (src && !/^(https?:\/\/|data:|\/)/.test(src)) {
                const markdownDir = path.dirname(node.path);
                const newSrc = path.join('/', markdownDir, src).replace(/\\/g, '/');
                return `<img src="${newSrc}" alt="${alt || path.basename(src)}">`;
            }
            return `<img src="${src}" alt="${alt || path.basename(src)}">`;
        };

        const contentHtml = md.render(mdContent);

        const titleMatch = mdContent.match(/^#\s+(.+)/m);
        const title = titleMatch ? titleMatch[1] : path.basename(node.name, '.md');

        // Generate sidebar HTML with current article highlighted
        const sidebarHtml = generateSidebarHtml(fullTree.children, node.path, relativePath);

        const finalHtml = template
            .replace(/\{\{TITLE\}\}/g, title)
            .replace('{{CONTENT}}', contentHtml)
            .replace(/\{\{SIDEBAR\}\}/g, sidebarHtml)
            .replace(/\{\{RELATIVE_PATH\}\}/g, relativePath);

        const outputFilePath = path.join(outputDir, node.path.replace(/\.md$/, '.html'));

        await fs.ensureDir(path.dirname(outputFilePath));

        await fs.writeFile(outputFilePath, finalHtml);
        console.log(`- Generated: ${outputFilePath.replace(__dirname, '')}`);

        // Collect URL for sitemap
        const articleUrl = '/articles/' + node.path.replace(/\.md$/, '.html');
        generatedUrls.push(articleUrl);

    } catch (error) {
        console.error(`- Error processing file ${node.path}:`, error);
    }
}

// Generate sitemap.xml
async function generateSitemap() {
    try {
        const currentDate = new Date().toISOString().split('T')[0];

        // Main pages with higher priority
        const mainPages = [
            { url: '/', priority: '1.0', changefreq: 'weekly' },
            { url: '/index.html', priority: '1.0', changefreq: 'weekly' },
            { url: '/notes.html', priority: '0.9', changefreq: 'daily' },
            { url: '/project.html', priority: '0.8', changefreq: 'monthly' },
            { url: '/tool.html', priority: '0.8', changefreq: 'monthly' }
        ];

        let sitemapContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemapContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add main pages
        for (const page of mainPages) {
            sitemapContent += '  <url>\n';
            sitemapContent += `    <loc>${BASE_URL}${page.url}</loc>\n`;
            sitemapContent += `    <lastmod>${currentDate}</lastmod>\n`;
            sitemapContent += `    <changefreq>${page.changefreq}</changefreq>\n`;
            sitemapContent += `    <priority>${page.priority}</priority>\n`;
            sitemapContent += '  </url>\n';
        }

        // Add article pages
        for (const articleUrl of generatedUrls) {
            sitemapContent += '  <url>\n';
            sitemapContent += `    <loc>${BASE_URL}${articleUrl}</loc>\n`;
            sitemapContent += `    <lastmod>${currentDate}</lastmod>\n`;
            sitemapContent += `    <changefreq>monthly</changefreq>\n`;
            sitemapContent += `    <priority>0.7</priority>\n`;
            sitemapContent += '  </url>\n';
        }

        sitemapContent += '</urlset>';

        await fs.writeFile(sitemapPath, sitemapContent);
        console.log(`✅ Sitemap generated: ${sitemapPath.replace(__dirname, '')}`);
        console.log(`   - Main pages: ${mainPages.length}`);
        console.log(`   - Article pages: ${generatedUrls.length}`);
        console.log(`   - Total URLs: ${mainPages.length + generatedUrls.length}`);

    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
    }
}

main();