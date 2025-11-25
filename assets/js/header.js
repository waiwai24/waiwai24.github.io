document.addEventListener("DOMContentLoaded", function() {
    setActiveLink();
    setupNavToggle();
    
    // Font loading detection
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
            document.documentElement.classList.add('fonts-loaded');
        });
    } else {
        // Fallback for browsers without Font Loading API
        setTimeout(function() {
            document.documentElement.classList.add('fonts-loaded');
        }, 100);
    }
});

function setActiveLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

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
                // We don't set display to 'none' immediately to allow the transition to finish
            }
        });
    }
}