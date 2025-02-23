function handleTreeClick(event) {
    const target = event.target;

    // 点击切换按钮（文件夹展开/折叠）
    if (target.classList.contains('tree-toggle')) {
        const li = target.closest('li');
        if (li) {
            li.classList.toggle('expanded');
        }
        return;
    }

    // 点击文件项
    else {
        const articleItem = target.closest('.file-item');
        if (articleItem) {
            const li = articleItem.closest('li');
            if (li) {
                const path = getFullPath(li);
                loadArticle(normalizePath(path));
            }
        }
    }
}