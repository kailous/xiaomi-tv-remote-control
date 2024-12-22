// routes/tv.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// 遥控按键接口： GET /tv/key?ip=192.168.1.120&keyName=home
router.get('/key', async (req, res) => {
  try {
    const { ip, keyName } = req.query;
    if (!ip || !keyName) {
      return res.json({ success: false, error: '参数不完整' });
    }
    // 构造目标URL
    // routes/tv.js
    const targetUrl = `http://${ip}:6095/controller?action=keyevent&keycode=${keyName}`;
    
    // 发请求给电视
    const resp = await axios.get(targetUrl, { timeout: 2000 });

    // 电视端若返回成功，可 resp.data 中查看具体字段
    // 这里只做简单演示
    if (resp.data && resp.data.status === 0) {
      res.json({ success: true, data: resp.data });
    } else {
      res.json({ success: false, error: '电视返回异常', data: resp.data });
    }
  } catch (error) {
    console.error('遥控按键出错:', error.message);
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;