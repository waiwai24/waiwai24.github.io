document.addEventListener("DOMContentLoaded", function() {
    fetch('/_includes/header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;
                // After inserting the header, initialize its interactive components
                if (typeof setupNavToggle === 'function') {
                    setupNavToggle();
                }
                if (typeof setActiveLink === 'function') {
                    setActiveLink();
                }
            }
        })
        .catch(error => {
            console.error('Error fetching header:', error);
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = '<p style="color:red;">Error loading navigation bar.</p>';
            }
        });
});