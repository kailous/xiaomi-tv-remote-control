// routes/tv.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * 遥控按键接口
 * GET /tv/key?ip=192.168.1.120&keyName=home
 * 
 * 示例:
 * http://192.168.1.120:6095/controller?action=keyevent&keycode=home
 */
router.get('/key', async (req, res) => {
  try {
    const { ip, keyName } = req.query;
    if (!ip || !keyName) {
      return res.json({ success: false, error: '参数不完整: 需要 ip 和 keyName' });
    }
    
    // 构造目标URL
    const targetUrl = `http://${ip}:6095/controller?action=keyevent&keycode=${keyName}`;

    // 发请求给电视
    const resp = await axios.get(targetUrl, { timeout: 2000 });

    // 电视端若返回成功，可 resp.data 中查看具体字段
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

/**
 * 获取已安装的应用列表
 * GET /tv/apps?ip=192.168.1.120
 * 
 * 示例接口(需根据不同电视版本微调):
 * http://192.168.1.120:6095/request?action=getInstalledAppList
 */
router.get('/apps', async (req, res) => {
    try {
      const { ip } = req.query;
      if (!ip) {
        return res.json({ success: false, error: '参数不完整: 需要 ip' });
      }
  
      // 根据实际测试确认此 URL 是否可行，否则需要换成其他，例如:
      // http://[IP]:6095/request?action=getInstalledAppList
      // 或者 http://[IP]:6095/controller?action=getInstalledApp
      const targetUrl = `http://${ip}:6095/controller?action=getinstalledapp&count=999&changeIcon=1`;
      console.log('请求URL:', targetUrl);
  
      const resp = await axios.get(targetUrl, { timeout: 3000 });
      // 返回结果示例:
      // {
      //   "status": 0,
      //   "msg": "success",
      //   "data": {
      //     "AppInfo": [
      //       {
      //         "PackageName": "com.mitv.alarmcenter",
      //         "IconURL": "http://xxx.xxx.xxx.xxx:6095/request?action=getResource&name=com.mitv.alarmcenter0.png",
      //         "AppName": "定时提醒",
      //         "Order": 1
      //       },
      //       ...
      //     ]
      //   }
      // }
  
      if (
        resp.data &&
        resp.data.status === 0 &&
        resp.data.data &&
        Array.isArray(resp.data.data.AppInfo)
      ) {
        // 将 AppInfo 映射成您想返回的字段
        const apps = resp.data.data.AppInfo.map(app => ({
          pkg: app.PackageName, // 或者直接 pkg: app.PackageName
          label: app.AppName,
          icon: app.IconURL
        }));
        res.json({ success: true, apps });
      } else {
        // 如果没有返回 AppInfo 数组
        res.json({ success: false, error: '电视未返回有效列表', raw: resp.data });
      }
    } catch (error) {
      console.error('获取App列表出错:', error.message);
      res.json({ success: false, error: error.message });
    }
  });

/**
 * 启动指定包名的应用
 * GET /tv/launch?ip=192.168.1.120&pkg=com.xiaomi.mitv.tvplayer
 * 
 * 示例接口(需根据不同电视版本微调):
 * http://192.168.1.120:6095/request?action=startApp&pkg=com.xiaomi.mitv.tvplayer
 */
router.get('/launch', async (req, res) => {
    try {
      const { ip, pkg } = req.query;
      if (!ip || !pkg) {
        return res.json({ success: false, error: '参数不完整: 需要 ip 和 pkg' });
      }
  
      // 修复后的启动应用接口
      const targetUrl = `http://${ip}:6095/controller?action=startapp&type=packagename&packagename=${pkg}`;
  
      const resp = await axios.get(targetUrl, { timeout: 3000 });
      // 正常返回:
      // {
      //   "status": 0,
      //   "msg": "success",
      //   "data": null
      // }
  
      if (resp.data && resp.data.status === 0) {
        res.json({ success: true, data: resp.data });
      } else {
        res.json({ success: false, error: '启动失败', raw: resp.data });
      }
    } catch (error) {
      console.error('启动App出错:', error.message);
      res.json({ success: false, error: error.message });
    }
  });

module.exports = router;