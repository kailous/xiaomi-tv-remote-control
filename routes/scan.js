// routes/scan.js
const express = require('express');
const router = express.Router();
const os = require('os');
const axios = require('axios');

/**
 * 获取本机 IP 地址
 * @returns {string} 本机 IP 地址
 */
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (let name of Object.keys(interfaces)) {
    for (let iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '未获取到本机IP';
}

/**
 * 扫描指定子网内的设备，检查哪些设备响应 /request?action=isalive
 * @param {string} subnet - 子网地址，例如 '192.168.0.'
 * @param {number} timeout - 每个请求的超时时间（毫秒）
 * @returns {Array} 发现的设备列表
 */
async function scanDevices(subnet, timeout = 300) {
  const promises = [];
  const devices = [];

  for (let i = 1; i <= 254; i++) {
    const ip = `${subnet}${i}:6095`;
    const url = `http://${subnet}${i}:6095/request?action=isalive`;

    const promise = axios.get(url, { timeout })
      .then(response => {
        if (response.data && response.data.status === 0) {
          devices.push({
            devicename: response.data.data.devicename,
            ip: `${subnet}${i}:6095`
          });
        }
      })
      .catch(() => { /* 忽略错误和超时 */ });

    promises.push(promise);
  }

  await Promise.all(promises);
  return devices;
}

// 处理扫描请求
router.get('/scan', async (req, res) => {
  try {
    const localIp = getLocalIp();
    if (localIp === '未获取到本机IP') {
      return res.json({ success: false, error: '未能获取本机IP地址' });
    }

    const subnet = localIp.substring(0, localIp.lastIndexOf('.')) + '.';
    console.log(`开始扫描子网: ${subnet}0/24`);

    const devices = await scanDevices(subnet);

    if (devices.length > 0) {
      res.json({ success: true, devices });
    } else {
      res.json({ success: false, error: '未发现任何小米电视设备' });
    }
  } catch (err) {
    console.error('扫描失败:', err);
    res.json({ success: false, error: '扫描过程中发生错误' });
  }
});

// 获取本机 IP
router.get('/api/local-ip', (req, res) => {
  const localIp = getLocalIp();
  res.json({ localIp });
});

module.exports = router;