// routes/scan.js
const express = require('express');
const router = express.Router();
const os = require('os');
const axios = require('axios');
const ipUtils = require('ip');

const DEFAULT_PORT = 6095;

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
 * 获取请求方 IP 地址
 * @param {express.Request} req
 * @returns {string}
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    const ip = forwarded.split(',')[0].trim();
    if (ip) return normalizeAddress(ip);
  }
  return normalizeAddress(
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    ''
  );
}

/**
 * 是否为私有 IPv4
 * @param {string} ip
 * @returns {boolean}
 */
function isPrivateIpv4(ip) {
  return Boolean(ip && ipUtils.isPrivate(ip));
}

/**
 * 标准化请求头中的 IP 地址
 * @param {string} address
 * @returns {string}
 */
function normalizeAddress(address) {
  if (!address) return '';
  if (address.startsWith('::ffff:')) {
    return address.substring(7);
  }
  if (address === '::1') return '127.0.0.1';
  return address;
}

/**
 * 解析用户输入的子网
 * @param {string} input
 * @returns {string|null} 标准化后的子网（以 . 结尾）
 */
function parseSubnetInput(input) {
  if (!input || typeof input !== 'string') return null;
  const match = input.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.?$/);
  if (!match) return null;
  const segments = match.slice(1, 4).map(Number);
  if (segments.some(num => Number.isNaN(num) || num < 0 || num > 255)) return null;
  return `${segments.join('.')}.`;
}

/**
 * 解析 IP 扫描范围
 * @param {string|number} value
 * @param {number} fallback
 * @returns {number}
 */
function parseRangeBound(value, fallback) {
  const num = Number.parseInt(value, 10);
  if (Number.isInteger(num) && num >= 1 && num <= 254) {
    return num;
  }
  return fallback;
}

/**
 * 解析端口
 * @param {string|number} value
 * @returns {number}
 */
function parsePort(value) {
  const num = Number.parseInt(value, 10);
  if (Number.isInteger(num) && num >= 1 && num <= 65535) {
    return num;
  }
  return DEFAULT_PORT;
}

/**
 * 扫描指定子网内的设备，检查哪些设备响应 /request?action=isalive
 * @param {string} subnet - 子网地址，例如 '192.168.0.'
 * @param {object} options - 扫描配置
 * @param {number} options.start - 起始 IP 尾号
 * @param {number} options.end - 结束 IP 尾号
 * @param {number} options.port - 请求端口
 * @param {number} options.timeout - 超时时间（毫秒）
 * @param {number} timeout - 每个请求的超时时间（毫秒）
 * @returns {Array} 发现的设备列表
 */
async function scanDevices(subnet, { start = 1, end = 254, port = DEFAULT_PORT, timeout = 300 } = {}) {
  const promises = [];
  const devices = [];

  for (let i = start; i <= end; i++) {
    const host = `${subnet}${i}`;
    const ipWithPort = `${host}:${port}`;
    const url = `http://${ipWithPort}/request?action=isalive`;

    const promise = axios.get(url, { timeout })
      .then(response => {
        if (response.data && response.data.status === 0) {
          devices.push({
            devicename: response.data.data.devicename,
            ip: ipWithPort,
            host,
            port
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
    const { subnet: subnetInput, start: startInput, end: endInput, port: portInput } = req.query;

    let subnet = parseSubnetInput(subnetInput);
    let rangeStart = parseRangeBound(startInput, 1);
    let rangeEnd = parseRangeBound(endInput, 254);
    const port = parsePort(portInput);

    if (rangeStart > rangeEnd) {
      const tmp = rangeStart;
      rangeStart = rangeEnd;
      rangeEnd = tmp;
    }

    if (!subnet) {
      const localIp = getLocalIp();
      if (!localIp || localIp === '未获取到本机IP' || !isPrivateIpv4(localIp)) {
        return res.json({
          success: false,
          error: '未能自动识别内网网段，请手动输入类似 192.168.1 的前三段地址后再尝试。',
          meta: { needsSubnet: true }
        });
      }
      subnet = localIp.substring(0, localIp.lastIndexOf('.') + 1);
    }

    console.log(`开始扫描子网: ${subnet}${rangeStart}-${subnet}${rangeEnd} (端口 ${port})`);

    const devices = await scanDevices(subnet, { start: rangeStart, end: rangeEnd, port });
    const meta = { subnet, rangeStart, rangeEnd, port };

    if (devices.length > 0) {
      res.json({ success: true, devices, meta });
    } else {
      res.json({ success: false, error: '未发现任何小米电视设备', devices: [], meta });
    }
  } catch (err) {
    console.error('扫描失败:', err);
    res.json({ success: false, error: '扫描过程中发生错误' });
  }
});

// 获取本机 IP
router.get('/api/local-ip', (req, res) => {
  const serverIp = normalizeAddress(getLocalIp());
  const clientIp = getClientIp(req);

  const serverIpIsPrivate = isPrivateIpv4(serverIp);
  const clientIpIsPrivate = isPrivateIpv4(clientIp);

  const suggestedSubnet = serverIpIsPrivate
    ? serverIp.split('.').slice(0, 3).join('.')
    : '';

  const shouldPromptManual = !serverIpIsPrivate || !clientIpIsPrivate;
  let displayIp = serverIp || '未获取';
  let tip;

  if (!serverIpIsPrivate) {
    displayIp = '需手动输入';
    tip = '检测到服务运行在公网/云服务器，请在扫描页填写实际所在局域网的前三段地址（例如 192.168.1）。';
  } else if (!clientIpIsPrivate) {
    tip = `当前访问 IP ${clientIp || '未知'} 为公网地址，如需控制局域网电视，请在扫描页手动填写内网网段（例如 192.168.1）。`;
  } else {
    tip = `已自动识别到服务端内网 IP ${serverIp}，如需扫描其它网段可手动修改。`;
  }

  if (clientIp && !clientIpIsPrivate && serverIp) {
    tip += ` （服务端 IP：${serverIp}）`;
  }

  res.json({
    localIp: displayIp,
    serverIp,
    clientIp,
    serverIpIsPrivate,
    clientIpIsPrivate,
    shouldPromptManual,
    tip,
    suggestedSubnet
  });
});

module.exports = router;
