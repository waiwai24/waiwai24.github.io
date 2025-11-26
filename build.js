const fs = require('fs-extra');
const path = require('path');
const MarkdownIt = require('markdown-it');

const knowledgeTreePath = path.join(__dirname, '_data', 'notes-tree.json');
const outputDir = path.join(__dirname, 'articles');
const contentTemplatePath = path.join(__dirname, '_includes', 'article-template.html');

// Initialize markdown-it
const md = new MarkdownIt({
    html: true, // Enable HTML tags in source
    linkify: true, // Autoconvert URL-like text to links
    typographer: true // Enable some language-neutral replacement + quotes beautification
});

async function main() {
    try {
        await fs.emptyDir(outputDir);
        console.log('Output directory cleaned.');

        const knowledgeTree = await fs.readJson(knowledgeTreePath);
        console.log('Knowledge tree loaded.');

        const template = await fs.readFile(contentTemplatePath, 'utf-8');
        console.log('Article template loaded.');

        if (knowledgeTree.children && knowledgeTree.children.length > 0) {
            await processNodes(knowledgeTree.children, template);
        }

        console.log('✅ Static site generation complete!');

    } catch (error) {
        console.error('❌ Error during build process:', error);
        process.exit(1);
    }
}

async function processNodes(nodes, template) {
    for (const node of nodes) {
        if (node.type === 'directory' && node.children) {
            await processNodes(node.children, template);
        } else if (node.type === 'file' && node.name.endsWith('.md')) {
            await generateHtmlFromMarkdown(node, template);
        }
    }
}

async function generateHtmlFromMarkdown(node, template) {
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
        
        const titleMatch = mdContent.match(/^#\s+(.*)/);
        const title = titleMatch ? titleMatch : path.basename(node.name, '.md');

        const finalHtml = template
            .replace(/\{\{TITLE\}\}/g, title)
            .replace('{{CONTENT}}', contentHtml)
            .replace(/"\/assets\//g, `"${relativePath}assets/`);

        const outputFilePath = path.join(outputDir, node.path.replace(/\.md$/, '.html'));
        
        await fs.ensureDir(path.dirname(outputFilePath));
        
        await fs.writeFile(outputFilePath, finalHtml);
        console.log(`- Generated: ${outputFilePath.replace(__dirname, '')}`);

    } catch (error) {
        console.error(`- Error processing file ${node.path}:`, error);
    }
}

main();