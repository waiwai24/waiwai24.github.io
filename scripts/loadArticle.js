async function loadArticle(path) {
    try {
        // 加载 Markdown 文件
        const response = await fetch(`https://raw.githubusercontent.com/${config.githubUser}/${config.repo}/main/${path}`);
        if (!response.ok) throw new Error('文章加载失败');
        const mdContent = await response.text();

        // 解析 Markdown 为 HTML
        const htmlContent = marked.parse(mdContent);

        // 提取并替换图片路径
        const modifiedHtmlContent = replaceImageSources(htmlContent, path);
        
        // 将 HTML 内容插入文章容器
        const articleContent = document.getElementById('article-content');
        articleContent.innerHTML = `
            <div class="markdown-body">${modifiedHtmlContent}</div>
        `;

        // 清空目录容器
        const toc = document.getElementById('toc');
        toc.innerHTML = '';

        // 为标题添加唯一的 ID
        const headers = articleContent.querySelectorAll('h1, h2, h3');
        headers.forEach((header, index) => {
            header.id = `header-${index}`;
        });

        // 生成目录
        generateTOCTree(headers);

        // 高亮代码块
        highlightCodeBlocks();

        // 自动滚动到内容
        window.requestAnimationFrame(() => {
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