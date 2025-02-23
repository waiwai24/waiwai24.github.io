class TreeBuilder {
    constructor(files) {
        this.tree = {};
        files.forEach(file => this.addToTree(file.path.split('/')));
    }

    addToTree(pathParts) {
        let current = this.tree;
        pathParts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = index === pathParts.length - 1 ? 
                    { type: 'file', name: part } : 
                    { type: 'dir', children: {}, expanded: false, name: part };
            }
            current = current[part].children || {};
        });
    }

    getTree() {
        this.sortTree(this.tree);
        return this.tree;
    }

    sortTree(node) {
        const entries = Object.entries(node);
        entries.sort((a, b) => {
            const aIsDir = a[1].type === 'dir';
            const bIsDir = b[1].type === 'dir';
            if (aIsDir && bIsDir) {
                return a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' });
            } else if (aIsDir) {
                return -1;
            } else if (bIsDir) {
                return 1;
            } else {
                return a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' });
            }
        });

        entries.forEach(([key, value]) => {
            if (value.type === 'dir') {
                this.sortTree(value.children);
            }
        });

        Object.keys(node).forEach(key => delete node[key]);
        entries.forEach(([key, value]) => node[key] = value);
    }
}