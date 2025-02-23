document.addEventListener('DOMContentLoaded', function () {
    if (config.isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkMode').checked = true;
    }
});

// 切换明暗模式
document.getElementById('darkMode').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode');
    config.isDarkMode = document.body.classList.contains('dark-mode');
    if (config.isDarkMode) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
});
