// app.js
const express = require('express');
const path = require('path');

const app = express();

// 如果需要解析 POST 请求体，可以引入 body-parser
// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// 静态资源：将 public 文件夹对外开放
app.use(express.static(path.join(__dirname, 'public')));

// 引入扫描路由
const scanRouter = require('./routes/scan');
app.use('/scan', scanRouter);
// 引入遥控器
const tvRouter = require('./routes/tv');
app.use('/tv', tvRouter);

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});