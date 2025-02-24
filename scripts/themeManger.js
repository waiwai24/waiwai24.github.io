document.addEventListener('DOMContentLoaded', function () {
    if (config.isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkMode').checked = true;
    }

    // 设置主题切换按钮的位置
    const themeMode = document.querySelector('.themeMode');
    themeMode.style.position = 'fixed';
    themeMode.style.top = '1rem';
    themeMode.style.right = '1rem';
    themeMode.style.zIndex = '1000';
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