const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, '0101');
const outputJsonPath = path.join(__dirname, 'knowledge-tree.json');

function directoryTree(dir) {
    const baseName = path.basename(dir);
    // Skip directories starting with a dot
    if (baseName.startsWith('.')) {
        return null;
    }

    try {
        const stats = fs.statSync(dir);
        const item = {
            path: path.relative(__dirname, dir).replace(/\\/g, '/'),
            name: baseName
        };

        if (stats.isDirectory()) {
            item.type = 'directory';
            const children = fs.readdirSync(dir)
                .map(child => directoryTree(path.join(dir, child)))
                .filter(child => child !== null);

            // Sort: directories first, then natural sort for names
            children.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'directory' ? -1 : 1;
                }
                return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
            });
            
            item.children = children;
        } else if (stats.isFile()) {
            if (path.extname(dir).toLowerCase() !== '.md') {
                return null;
            }
            item.type = 'file';
        } else {
            return null;
        }
        return item;
    } catch (error) {
        console.warn(`[Warning] Skipping path due to error: ${dir}. Details: ${error.message}`);
        return null;
    }
}

if (!fs.existsSync(dirPath)) {
    console.error(`Error: The directory '0101' does not exist in the root folder.`);
    console.log(`Please create the '0101' directory and add your markdown notes.`);
    fs.writeFileSync(outputJsonPath, JSON.stringify({ name: '0101', type: 'directory', children: [] }, null, 2));
    process.exit(1);
}

const tree = directoryTree(dirPath);

if (tree) {
    fs.writeFileSync(outputJsonPath, JSON.stringify(tree, null, 2));
    console.log(`Successfully generated knowledge-tree.json.`);
} else {
    console.error('Failed to generate directory tree. The root "0101" directory might be inaccessible.');
}