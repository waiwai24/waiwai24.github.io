# 个人笔记站点

本仓库是我的个人网站，使用 Node.js 脚本将 Markdown 文件自动生成为静态 HTML 页面。

## 自动化流程

GitHub Actions 工作流会自动完成以下任务：

1.  **同步笔记**: 从 [waiwai24/0101](https://github.com/waiwai24/0101) 克隆最新笔记。
2.  **生成目录树**: 执行 `assets/js/generate-tree.js` 创建笔记的 JSON 目录结构。
3.  **构建网站**: 执行 `build.js` 将 Markdown 文件转换为 HTML。
4.  **提交更改**: 将更新的笔记、目录树和生成的 HTML 文件推送回本仓库。

## 本地构建

1.  `git clone https://github.com/waiwai24/waiwai24.github.io.git`
2.  `cd waiwai24.github.io`
3.  `npm install`
4.  `node assets/js/generate-tree.js`
5.  `node build.js`

生成的文件位于 `articles/` 目录。