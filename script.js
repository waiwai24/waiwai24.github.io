//variable
const darkMode = document.getElementById('darkMode');
//event listener
darkMode.addEventListener('change', () => {
    //change the theme of website
    document.body.classList.toggle('dark');
    //save to localStorage the theme mode
    if (document.body.classList.contains('dark')) {
        localStorage.setItem('darkMode', 'true');
        console.log('dark');
    } else {
        localStorage.setItem('darkMode', 'false');
        console.log('light');
    }
});

// 在页面加载时检查 localStorage 中的主题模式
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
        darkMode.checked = true;
    } else {
        document.body.classList.remove('dark');
        darkMode.checked = false;
    }
});