// 初始化加载
async function init() {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${config.githubUser}/${config.repo}/git/trees/main?recursive=1`
        );
        const { tree } = await response.json();

        const filteredFiles = tree.filter(item => 
            item.type === 'blob' && 
            item.path.endsWith('.md') &&
            !item.path.includes('README')
        );

        // 对文件路径进行排序
        const sortedFiles = filteredFiles.sort((a, b) => {
            const aPath = a.path.toLowerCase();
            const bPath = b.path.toLowerCase();
            return aPath.localeCompare(bPath, 'en', { sensitivity: 'base' });
        });

        const builder = new TreeBuilder(sortedFiles);
        const fileTree = builder.getTree();

        renderTreeNode(document.getElementById('article-tree'), fileTree);

        // 添加全局点击监听
        document.getElementById('article-tree').addEventListener('click', handleTreeClick);
    } catch (error) {
        document.getElementById('article-tree').innerHTML = '<p>暂时无法加载文章列表，请稍后再试</p>';
        console.error('初始化失败:', error);
    }
}
window.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', function () {
    lightbox.option({
        resizeDuration: 200,
        wrapAround: true,
        alwaysShowNavOnTouchDevices: true,
        imageFadeDuration: 500,
        positionFromTop: 80
    });
});

// 在文章内容加载完成后对代码块进行高亮处理
function highlightCodeBlocks() {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}

// 生成目录
function generateTOCTree(headers) {
    if (headers.length === 0) return;

    const toc = document.getElementById('toc');
    const tocTree = document.createElement('ul');

    let currentLevel = 1;
    let currentList = tocTree;

    headers.forEach((header, index) => {
        const level = parseInt(header.tagName.substring(1));
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${header.id}`;
        link.textContent = header.textContent;
        link.id = `toc-link-${index}`; // 为每个目录项添加唯一的 ID
        listItem.appendChild(link);

        if (level > currentLevel) {
            const newList = document.createElement('ul');
            currentList.lastElementChild.appendChild(newList);
            currentList = newList;
        } else if (level < currentLevel) {
            currentList = currentList.parentElement;
        }

        currentList.appendChild(listItem);
        currentLevel = level;
    });

    toc.appendChild(tocTree);
}

document.addEventListener('DOMContentLoaded', generateTOCTree);

// 更新目录高亮
function updateTOCHighlight() {
    const headers = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3');
    const tocLinks = document.querySelectorAll('#toc a');

    let currentHeaderIndex = -1;

    headers.forEach((header, index) => {
        const rect = header.getBoundingClientRect();
        if (rect.top <= 100) {
            currentHeaderIndex = index;
        }
    });

    tocLinks.forEach((link, index) => {
        if (index === currentHeaderIndex) {
            link.style.fontWeight = 'bold';
        } else {
            link.style.fontWeight = 'normal';
        }
    });
}

window.addEventListener('scroll', updateTOCHighlight);