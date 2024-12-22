// routes/tv.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * 配置电视的基础 URL
 * @param {string} ip - 电视的 IP 地址（包括端口）
 * @returns {string} 电视的基础 URL
 */
function getTvBaseUrl(ip) {
  return `http://${ip}`;
}

/**
 * 发送请求到电视的指定 API
 * @param {string} ip - 电视的 IP 地址（包括端口）
 * @param {string} action - 动作名称
 * @param {object} params - 其他参数
 * @returns {object} 电视的响应
 */
async function sendRequest(ip, action, params = {}) {
  const baseUrl = getTvBaseUrl(ip);
  const url = new URL('/controller', baseUrl);
  url.searchParams.append('action', action);

  // 根据不同的动作，调整请求参数
  if (action === 'getinstalledapp') {
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
  } else if (action === 'startapp') {
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
  } else if (action === 'keyevent') {
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
  }

  try {
    const response = await axios.get(url.toString(), { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error(`请求电视 ${action} 失败:`, error.message);
    return { status: 1, msg: '请求失败', data: null };
  }
}

/**
 * 获取电视基础信息
 * API: http://xxx.xxx.xxx.xxx:6095/request?action=isalive
 * @param {string} ip - 电视的 IP 地址（包括端口）
 * @returns {object} 电视的基础信息
 */
async function getDeviceInfo(ip) {
  const baseUrl = getTvBaseUrl(ip);
  const url = `${baseUrl}/request?action=isalive`;

  try {
    const response = await axios.get(url, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('获取电视基础信息失败:', error.message);
    return { status: 1, msg: '请求失败', data: null };
  }
}

/**
 * 获取电视设备名称
 * @param {string} ip - 电视的 IP 地址（包括端口）
 * @returns {string} 设备名称
 */
async function getDeviceName(ip) {
  const info = await getDeviceInfo(ip);
  if (info.status === 0 && info.data && info.data.devicename) {
    return info.data.devicename;
  }
  return '未知设备';
}

// 处理按键事件
router.get('/tv/key', async (req, res) => {
  const { ip, keycode } = req.query;
  if (!ip || !keycode) {
    return res.json({ status: 1, msg: '缺少参数 ip 或 keycode', data: {} });
  }

  const validKeycodes = [
    'power', 'up', 'down', 'left', 'right',
    'enter', 'home', 'back', 'menu',
    'volumeup', 'volumedown'
  ];

  if (!validKeycodes.includes(keycode)) {
    return res.json({ status: 1, msg: '无效的 keycode', data: {} });
  }

  try {
    const result = await sendRequest(ip, 'keyevent', { keycode });
    res.json(result);
  } catch (err) {
    console.error('处理按键事件失败:', err);
    res.json({ status: 1, msg: '内部服务器错误', data: {} });
  }
});

// 获取应用列表
router.get('/tv/apps', async (req, res) => {
  const { ip, count = 999, changeIcon = 1 } = req.query;
  if (!ip) {
    return res.json({ status: 1, msg: '缺少参数 ip', data: null });
  }

  try {
    const result = await sendRequest(ip, 'getinstalledapp', { count, changeIcon });
    res.json(result);
  } catch (err) {
    console.error('获取应用列表失败:', err);
    res.json({ status: 1, msg: '内部服务器错误', data: null });
  }
});

// 启动应用
router.get('/tv/launch', async (req, res) => {
  const { ip, packagename } = req.query;
  if (!ip || !packagename) {
    return res.json({ status: 1, msg: '缺少参数 ip 或 packagename', data: null });
  }

  try {
    const result = await sendRequest(ip, 'startapp', { type: 'packagename', packagename });
    res.json(result);
  } catch (err) {
    console.error('启动应用失败:', err);
    res.json({ status: 1, msg: '内部服务器错误', data: null });
  }
});

// 获取设备名称
router.get('/api/get-device-name', async (req, res) => {
  const { ip } = req.query;
  if (!ip) {
    return res.json({ deviceName: '未知设备' });
  }

  try {
    const deviceName = await getDeviceName(ip);
    res.json({ deviceName });
  } catch (err) {
    console.error('获取设备名称失败:', err);
    res.json({ deviceName: '未知设备' });
  }
});

module.exports = router;