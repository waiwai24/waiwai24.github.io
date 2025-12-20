/**
 * article-page.js - JavaScript for standalone article pages
 * Handles sidebar, search, navigation, and code copy functionality
 */

document.addEventListener("DOMContentLoaded", function() {
    // Initialize header
    setActiveLink();
    setupNavToggle();

    // Font loading
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
            document.documentElement.classList.add('fonts-loaded');
        });
    } else {
        setTimeout(function() {
            document.documentElement.classList.add('fonts-loaded');
        }, 100);
    }

    // Initialize sidebar functionality
    const fileTreeContainer = document.getElementById('file-tree');
    const searchBox = document.getElementById('search-box');
    const expandAllBtn = document.getElementById('expand-all-btn');
    const collapseAllBtn = document.getElementById('collapse-all-btn');

    // Sidebar search
    if (searchBox && fileTreeContainer) {
        searchBox.addEventListener('input', () => {
            const searchTerm = searchBox.value.toLowerCase();
            const files = fileTreeContainer.querySelectorAll('.file');
            const folders = fileTreeContainer.querySelectorAll('.folder');

            files.forEach(file => {
                const fileName = file.textContent.toLowerCase();
                const fileVisible = fileName.includes(searchTerm);
                file.style.display = fileVisible ? '' : 'none';
            });

            folders.forEach(folder => {
                const folderName = folder.querySelector('.folder-name')?.textContent.toLowerCase() || '';
                const folderVisible = folderName.includes(searchTerm);
                const childFiles = folder.querySelectorAll('.file');
                let hasVisibleChild = false;
                childFiles.forEach(child => {
                    if (child.style.display !== 'none') {
                        hasVisibleChild = true;
                    }
                });

                if (folderVisible || hasVisibleChild) {
                    folder.style.display = '';
                    if (searchTerm && hasVisibleChild) {
                        folder.open = true;
                    }
                } else {
                    folder.style.display = 'none';
                }
            });
        });
    }

    // Expand/Collapse all
    if (expandAllBtn && fileTreeContainer) {
        expandAllBtn.addEventListener('click', () => {
            const details = fileTreeContainer.querySelectorAll('details');
            details.forEach(detail => detail.open = true);
        });
    }

    if (collapseAllBtn && fileTreeContainer) {
        collapseAllBtn.addEventListener('click', () => {
            const details = fileTreeContainer.querySelectorAll('details');
            details.forEach(detail => detail.open = false);
        });
    }

    // Initialize code copy buttons
    initCodeCopyButtons();

    // Scroll active article into view
    scrollActiveIntoView();

    // Initialize sidebar toggle and draggable button
    initSidebarToggle();
    initDraggableButton();

    // Fix mobile scrolling
    fixMobileScrolling();
    window.addEventListener('resize', fixMobileScrolling);
});

// Set active navigation link
function setActiveLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    // For article pages, Notes should be active
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === 'notes.html') {
            link.classList.add('active');
        }
    });
}

// Setup navigation toggle for mobile
function setupNavToggle() {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isExpanded = mainNav.classList.toggle('is-active');
            navToggle.classList.toggle('is-active');
            navToggle.setAttribute('aria-expanded', isExpanded);
            if (isExpanded) {
                mainNav.style.display = 'flex';
                mainNav.style.maxHeight = mainNav.scrollHeight + 'px';
            } else {
                mainNav.style.maxHeight = '0';
            }
        });
    }
}

// Scroll active article into view in sidebar
function scrollActiveIntoView() {
    const fileTree = document.getElementById('file-tree');
    if (!fileTree) return;
    const active = fileTree.querySelector('.file.active');
    if (active) {
        setTimeout(() => {
            active.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 100);
    }
}

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
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

// Initialize code copy buttons
function initCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('#content-display pre');
    codeBlocks.forEach(block => {
        if (block.querySelector('.copy-btn')) {
            return;
        }

        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.textContent = 'Copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');
        block.appendChild(button);

        button.addEventListener('click', () => {
            const code = block.querySelector('code');
            if (code) {
                copyToClipboard(code.textContent).then(() => {
                    button.textContent = 'Copied!';
                    button.classList.add('copied');
                    setTimeout(() => {
                        button.textContent = 'Copy';
                        button.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    button.textContent = 'Error';
                });
            }
        });
    });
}

// Fix mobile scrolling
function fixMobileScrolling() {
    if (window.innerWidth <= 900) {
        const mainWrapper = document.querySelector('.main-content-wrapper');
        if (mainWrapper) {
            mainWrapper.style.overflow = 'visible';
            mainWrapper.style.minHeight = 'auto';
        }

        const content = document.getElementById('content-display');
        if (content) {
            content.style.overflowY = 'auto';
            content.style.webkitOverflowScrolling = 'touch';
            content.style.maxHeight = window.innerHeight - 120 + 'px';
        }
    }
}

// Sidebar toggle functionality
function initSidebarToggle() {
    const toggle = document.getElementById('sidebar-toggle');
    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    let overlay = null;

    if (!toggle || !sidebar) return;

    function createOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.setAttribute('role', 'presentation');
        overlay.addEventListener('click', closeSidebar);
        document.body.appendChild(overlay);
        window.getComputedStyle(overlay).opacity;
    }

    function removeOverlay() {
        if (overlay) {
            overlay.removeEventListener('click', closeSidebar);
            document.body.removeChild(overlay);
            overlay = null;
        }
    }

    function openSidebar() {
        if (!overlay) createOverlay();
        body.classList.add('sidebar-open');
        toggle.setAttribute('aria-expanded', 'true');
        sidebar.focus();
        sidebar.setAttribute('aria-hidden', 'false');
        scrollActiveIntoView();
    }

    function closeSidebar() {
        body.classList.remove('sidebar-open');
        toggle.setAttribute('aria-expanded', 'false');
        sidebar.setAttribute('aria-hidden', 'true');
        removeOverlay();
        document.body.style.overflow = '';
        toggle.focus();
    }

    window.toggleSidebar = function() {
        if (body.classList.contains('sidebar-open')) closeSidebar();
        else openSidebar();

        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            toggle.classList.add('is-active');
        } else {
            toggle.classList.remove('is-active');
        }
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('sidebar-open')) {
            closeSidebar();
        }
    });

    sidebar.setAttribute('aria-hidden', 'true');

    document.getElementById('content-display')?.addEventListener('click', () => {
        if (window.innerWidth <= 900 && body.classList.contains('sidebar-open')) {
            closeSidebar();
        }
    });
}

// Draggable sidebar toggle button for mobile
function initDraggableButton() {
    const button = document.getElementById('sidebar-toggle');
    if (!button) return;

    let isDragging = false;
    let startX, startY, initialX, initialY;
    let currentX = 16, currentY = 20;
    let dragThreshold = 5;
    let hasMoved = false;

    const boundaryIndicator = document.createElement('div');
    boundaryIndicator.className = 'drag-boundary';
    document.body.appendChild(boundaryIndicator);

    const savedPosition = localStorage.getItem('sidebar-toggle-position');
    if (savedPosition) {
        const position = JSON.parse(savedPosition);
        currentX = Math.max(10, Math.min(position.x, window.innerWidth - button.offsetWidth - 10));
        currentY = Math.max(10, Math.min(position.y, window.innerHeight - button.offsetHeight - 10));
        button.style.left = currentX + 'px';
        button.style.top = currentY + 'px';
    }

    function startDrag(e) {
        if (window.innerWidth > 900) return;

        const target = e.target.closest('.sidebar-toggle');
        if (!target) return;

        isDragging = true;
        hasMoved = false;
        button.classList.add('dragging');
        boundaryIndicator.classList.add('active');

        const touch = e.type.includes('touch') ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;

        initialX = button.offsetLeft;
        initialY = button.offsetTop;

        document.body.classList.add('dragging');

        e.preventDefault();
        e.stopPropagation();
    }

    function drag(e) {
        if (!isDragging) return;

        const touch = e.type.includes('touch') ? e.touches[0] : e;
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
            hasMoved = true;
        }

        if (!hasMoved) return;

        let newX = initialX + deltaX;
        let newY = initialY + deltaY;

        const buttonWidth = button.offsetWidth;
        const buttonHeight = button.offsetHeight;
        const maxX = window.innerWidth - buttonWidth - 10;
        const maxY = window.innerHeight - buttonHeight - 10;

        if (newX < 20) newX = 10;
        if (newX > maxX - 10) newX = maxX;
        if (newY < 20) newY = 10;
        if (newY > maxY - 10) newY = maxY;

        button.style.left = newX + 'px';
        button.style.top = newY + 'px';

        currentX = newX;
        currentY = newY;

        e.preventDefault();
    }

    function endDrag(e) {
        if (!isDragging) return;

        const wasDragged = hasMoved;

        isDragging = false;
        hasMoved = false;
        button.classList.remove('dragging');
        boundaryIndicator.classList.remove('active');
        document.body.classList.remove('dragging');

        if (!wasDragged) {
            if (typeof window.toggleSidebar === 'function') {
                window.toggleSidebar();
            }
        } else {
            localStorage.setItem('sidebar-toggle-position', JSON.stringify({
                x: currentX,
                y: currentY
            }));

            button.style.background = 'rgba(40, 167, 69, 0.9)';
            setTimeout(() => {
                button.style.background = 'rgba(255, 255, 255, 0.95)';
            }, 300);
        }

        e.preventDefault();
    }

    function handleResize() {
        if (window.innerWidth <= 900) {
            const maxX = window.innerWidth - button.offsetWidth - 10;
            const maxY = window.innerHeight - button.offsetHeight - 10;

            currentX = Math.max(10, Math.min(currentX, maxX));
            currentY = Math.max(10, Math.min(currentY, maxY));

            button.style.left = currentX + 'px';
            button.style.top = currentY + 'px';

            localStorage.setItem('sidebar-toggle-position', JSON.stringify({
                x: currentX,
                y: currentY
            }));
        }
    }

    button.addEventListener('mousedown', startDrag);
    button.addEventListener('touchstart', startDrag, { passive: false });

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    window.addEventListener('resize', handleResize);

    button.addEventListener('dblclick', function(e) {
        e.preventDefault();
        currentX = 16;
        currentY = 20;
        button.style.left = currentX + 'px';
        button.style.top = currentY + 'px';

        localStorage.removeItem('sidebar-toggle-position');

        button.style.background = 'rgba(255, 193, 7, 0.9)';
        setTimeout(() => {
            button.style.background = 'rgba(255, 255, 255, 0.95)';
        }, 300);
    });
}
