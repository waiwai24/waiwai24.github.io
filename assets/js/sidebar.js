document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('sidebar-toggle');
  const body = document.body;
  const sidebar = document.querySelector('.sidebar');
  let overlay = null;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.setAttribute('role', 'presentation');
    overlay.addEventListener('click', closeSidebar);
    document.body.appendChild(overlay);
    // force reflow so transition runs
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
    // move focus to sidebar for keyboard users
    sidebar.focus();
    sidebar.setAttribute('aria-hidden', 'false');
    // ensure active item visible
    scrollActiveIntoView();
    adjustHeights();
  }

  function closeSidebar() {
    body.classList.remove('sidebar-open');
    toggle.setAttribute('aria-expanded', 'false');
    sidebar.setAttribute('aria-hidden', 'true');
    removeOverlay();
    // restore scrolling
    document.body.style.overflow = '';
    // return focus to toggle button
    toggle.focus();
  }

  function toggleSidebar() {
    if (body.classList.contains('sidebar-open')) closeSidebar();
    else openSidebar();
  }

  // keyboard support: ESC key closes sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('sidebar-open')) {
      closeSidebar();
    }
  });

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebar();
  });

  // adjust sidebar/content heights for better fit on mobile
  function adjustHeights() {
    const footer = document.querySelector('.footer');
    const footerHeight = footer ? footer.getBoundingClientRect().height : 0;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const available = Math.max(200, vh - footerHeight);
    if (sidebar) {
      sidebar.style.maxHeight = available + 'px';
    }
    const content = document.getElementById('content-display');
    if (content) {
      content.style.maxHeight = available + 'px';
      content.style.overflowY = 'auto';
    }
  }

  window.addEventListener('resize', () => {
    adjustHeights();
  });

  // ensure active file is scrolled into view in sidebar
  function scrollActiveIntoView() {
    const fileTree = document.getElementById('file-tree');
    if (!fileTree) return;
    const active = fileTree.querySelector('.file.active');
    if (active) {
      active.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  // observe class changes to detect when a file becomes active
  const observerTarget = document.getElementById('file-tree');
  if (observerTarget) {
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') continue;
        // any subtree change -> try to find active
        scrollActiveIntoView();
      }
    });
    mo.observe(observerTarget, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  // Initialize heights on load
  adjustHeights();
  sidebar.setAttribute('aria-hidden', 'true');

  // close sidebar when navigating content (helpful on mobile)
  document.getElementById('content-display')?.addEventListener('click', () => {
    if (window.innerWidth <= 900 && body.classList.contains('sidebar-open')) {
      closeSidebar();
    }
  });

  // Trap focus within sidebar when open (keyboard users can Tab through items)
  // and restore focus to toggle when closed
  document.addEventListener('focusin', (e) => {
    if (body.classList.contains('sidebar-open') && sidebar && !sidebar.contains(e.target) && e.target !== toggle) {
      // if focus goes outside sidebar (except toggle), return to sidebar
      const focusableInSidebar = sidebar.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), details'
      );
      if (focusableInSidebar.length) {
        focusableInSidebar[0].focus();
      }
    }
  });

  // Allow folder items (details) to be navigated with Tab
  const folderDetails = sidebar.querySelectorAll('details');
  folderDetails.forEach(detail => {
    detail.setAttribute('tabindex', '0');
  });
});

