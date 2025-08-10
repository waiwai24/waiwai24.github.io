document.addEventListener('DOMContentLoaded', () => {
    const fileTreeContainer = document.getElementById('file-tree');
    const contentDisplay = document.getElementById('content-display');
    const converter = new showdown.Converter({ tables: true, strikethrough: true, tasklists: true, noHeaderId: true, ghCompatibleHeaderId: true, simplifiedAutoLink: true });

    const placeholder = contentDisplay.innerHTML;

    /**
     * Asynchronously copies text to the clipboard.
     * Handles modern API and a fallback for insecure contexts like 'file://'.
     * @param {string} text The text to copy.
     * @returns {Promise<void>} A promise that resolves on success and rejects on failure.
     */
    function copyToClipboard(text) {
        // Use modern Clipboard API in secure contexts (https, localhost)
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        // Fallback for insecure contexts
        return new Promise((resolve, reject) => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            // Prevent scrolling to bottom of page in MS Edge.
            textArea.style.position = 'fixed';
            textArea.style.top = '-9999px';
            textArea.style.left = '-9999px';

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                // document.execCommand is deprecated but necessary for the fallback.
                const successful = document.execCommand('copy');
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('Copy command was unsuccessful.'));
                }
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(textArea);
            }
        });
    }

    fetch('knowledge-tree.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');
            return response.json();
        })
        .then(data => {
            if (data && data.children) {
                fileTreeContainer.innerHTML = '';
                fileTreeContainer.appendChild(createTree(data.children));
            } else {
                showError('Invalid or empty knowledge-tree.json');
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing knowledge tree:', error);
            showError('无法加载笔记列表，请确认 `knowledge-tree.json` 文件存在且格式正确。');
        });

    function createTree(nodes) {
        const ul = document.createElement('ul');
        nodes.forEach(node => {
            const li = document.createElement('li');
            if (node.type === 'directory') {
                const details = document.createElement('details');
                details.className = 'folder-details';
                details.open = false;

                const summary = document.createElement('summary');
                summary.className = 'folder-summary';
                summary.innerHTML = `<svg class="icon" viewBox="0 0 1024 1024" width="16" height="16"><path d="M384 192v640l512-320-512-320z" fill="currentColor"></path></svg><span class="folder-name">${node.name}</span>`;
                
                const subUl = createTree(node.children);
                
                details.appendChild(summary);
                details.appendChild(subUl);
                li.appendChild(details);
            } else if (node.type === 'file' && node.name.endsWith('.md')) {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'file';
                fileDiv.textContent = node.name.replace('.md', '');
                fileDiv.dataset.path = node.path;
                
                fileDiv.addEventListener('click', (e) => {
                    document.querySelectorAll('.file.active').forEach(activeEl => {
                        activeEl.classList.remove('active');
                    });
                    e.currentTarget.classList.add('active');
                    
                    const mdPath = node.path;
                    const basePath = mdPath.substring(0, mdPath.lastIndexOf('/') + 1);

                    fetch(mdPath)
                        .then(response => {
                            if (!response.ok) throw new Error(`Failed to load ${node.name}`);
                            return response.text();
                        })
                        .then(text => {
                            const html = converter.makeHtml(text);
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = html;

                            tempDiv.querySelectorAll('img').forEach(img => {
                                const src = img.getAttribute('src');
                                if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
                                    img.src = basePath + src;
                                }
                            });

                            tempDiv.querySelectorAll('pre').forEach(pre => {
                                const code = pre.querySelector('code');
                                if (code) {
                                    const copyBtn = document.createElement('button');
                                    copyBtn.className = 'copy-btn';
                                    copyBtn.textContent = 'Copy';
                                    copyBtn.addEventListener('click', () => {
                                        copyToClipboard(code.innerText).then(() => {
                                            copyBtn.textContent = 'Copied!';
                                            copyBtn.classList.add('copied');
                                            setTimeout(() => {
                                                copyBtn.textContent = 'Copy';
                                                copyBtn.classList.remove('copied');
                                            }, 2000);
                                        }).catch(err => {
                                            console.error('Failed to copy text: ', err);
                                            alert('复制失败！由于浏览器的安全限制，无法自动复制。请手动选择文本并复制。');
                                            copyBtn.textContent = 'Error';
                                            setTimeout(() => {
                                                copyBtn.textContent = 'Copy';
                                            }, 2000);
                                        });
                                    });
                                    pre.appendChild(copyBtn);
                                }
                            });

                            contentDisplay.innerHTML = tempDiv.innerHTML;
                        })
                        .catch(err => {
                            console.error('Error fetching file content:', err);
                            showError(`无法加载文件: ${node.name}`);
                        });
                });
                li.appendChild(fileDiv);
            }
            ul.appendChild(li);
        });
        return ul;
    }

    function showError(message) {
        contentDisplay.innerHTML = `<div class="placeholder">${message}</div>`;
    }
});