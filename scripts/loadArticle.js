async function loadArticle(path) {
    try {
        // 1. 加载 Markdown 文件
        const response = await fetch(`https://raw.githubusercontent.com/${config.githubUser}/${config.repo}/main/${path}`);
        if (!response.ok) throw new Error('文章加载失败');
        const mdContent = await response.text();

        // 2. 解析 Markdown 为 HTML
        const htmlContent = marked.parse(mdContent);

        // 3. 提取并替换图片路径
        const modifiedHtmlContent = replaceImageSources(htmlContent, path);
        
        // 4. 设置内容
        document.getElementById('article-content').innerHTML = `
            <div class="markdown-body">${modifiedHtmlContent}</div>
        `;        
        highlightCodeBlocks();

        // 5. 自动滚动到内容
        window.requestAnimationFrame(() => {
            const articleContent = document.getElementById('article-content');
            if (articleContent) {
                window.scrollTo({
                    top: articleContent.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    } catch (error) {
        console.error('加载文章内容失败:', error);
        document.getElementById('article-content').innerHTML = '<p>无法加载文章内容</p>';
    }
}