function renderTreeNode(parentEl, node, path = []) {
    const ul = document.createElement('ul');
    ul.className = 'tree-node';

    Object.entries(node).forEach(([name, item]) => {
        const li = document.createElement('li');
        const isDir = item.type === 'dir';

        // 节点主体
        const contentDiv = document.createElement('div');
        contentDiv.className = isDir ? 'tree-toggle' : 'article-item file-item';
        contentDiv.innerHTML = isDir ? `${name}/` : name; // 在目录名后添加斜杠

        // 子节点容器
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'children-container';

        li.appendChild(contentDiv);
        if (isDir && Object.keys(item.children).length > 0) {
            renderTreeNode(childrenContainer, item.children, [...path, name]);
            li.appendChild(childrenContainer);
        }

        ul.appendChild(li);
    });

    parentEl.appendChild(ul);
}