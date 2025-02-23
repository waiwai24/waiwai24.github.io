function getFullPath(liElement) {
    const pathSegments = [];
    let current = liElement;

    // 向上遍历所有父级 li 元素
    while (current) {
        // 获取当前 li 的名称（文件夹或文件名）
        const name = current.querySelector('.tree-toggle')?.textContent?.trim() || current.querySelector('.file-item')?.textContent?.trim();
        if (name) {
            pathSegments.unshift(name); // 将名称按顺序添加到数组头部
        }
        // 向上找到父级 li 元素
        current = current.parentElement.closest('.tree-node li');
    }

    // 拼接路径并返回
    const path = pathSegments.join('/');
    console.log('生成的路径：', path);
    return path; // 假设文件名以 .md 结尾
}

function normalizePath(path) {
    let normalizedPath = '';
    let skipNext = false;

    for (let i = 0; i < path.length; i++) {
        if (path[i] === '/' && path[i + 1] === '/') {
            skipNext = true;
        } else {
            skipNext = false;
        }

        if (!skipNext) {
            normalizedPath += path[i];
        }
    }

    return normalizedPath;
}

function searchArticles(keyword) {
    const articles = document.querySelectorAll('.article-item');
    articles.forEach(article => {
        const title = article.textContent.toLowerCase();
        if (title.includes(keyword.toLowerCase())) {
            article.style.display = 'block';
        } else {
            article.style.display = 'none';
        }
    });
}