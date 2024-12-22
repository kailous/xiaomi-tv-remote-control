// app.js
const express = require('express');
const app = express();
const path = require('path');

// 引入路由
const scanRoutes = require('./routes/scan');
const tvRoutes = require('./routes/tv');

// 设置静态文件目录，并将默认的 index 文件设置为 scan.html
app.use(express.static(path.join(__dirname, 'public'), { index: 'scan.html' }));

// 使用路由
app.use('/', scanRoutes);
app.use('/', tvRoutes);

// 处理所有未匹配的路由，重定向到错误页面
app.use((req, res, next) => {
  res.redirect('/error.html?error=页面未找到');
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器正在运行在端口 ${PORT}`);
});