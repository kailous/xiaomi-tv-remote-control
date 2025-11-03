const express = require('express');
const path = require('path');

const app = express();

// 引入路由
const scanRoutes = require('./routes/scan');
const tvRoutes = require('./routes/tv');

// 设置静态文件目录，并将默认的 index 文件设置为 scan.html
app.use(express.static(path.join(__dirname, 'public'), { index: 'scan.html' }));

// 使用路由
app.use('/', scanRoutes);
app.use('/', tvRoutes);

// 处理所有未匹配的路由，重定向到错误页面
app.use((req, res) => {
  res.redirect('/error.html?error=页面未找到');
});

// 导出 Express 应用
module.exports = app;
