function replaceImageSources(htmlContent, path) {
    // 创建一个临时的 DOM 元素来解析 HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 获取所有的图片元素
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
            // 替换为新的图片路径
            const newPath = getDirectoryPath(path);
            const newSrc = `https://raw.githubusercontent.com/${config.githubUser}/${config.repo}/main/${newPath}/${src}`;
            img.setAttribute('src', newSrc);

            // 为图片添加 data-lightbox 属性
            const link = document.createElement('a');
            link.setAttribute('href', newSrc);
            link.setAttribute('data-lightbox', 'image-gallery');
            img.parentNode.insertBefore(link, img);
            link.appendChild(img);
            img.style.cursor = 'zoom-in';
        }
    });

    // 返回修改后的 HTML
    return doc.body.innerHTML;
}

function getDirectoryPath(path) {
    // 获取最后一个 '/' 的索引
    const lastSlashIndex = path.lastIndexOf('/');

    // 如果路径中没有 '/'，返回空字符串
    if (lastSlashIndex === -1) {
        return '';
    }

    // 返回最后一个 '/' 前的所有字符
    return path.substring(0, lastSlashIndex);
}