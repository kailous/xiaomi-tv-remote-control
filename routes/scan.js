// routes/scan.js
const express = require('express');
const router = express.Router();
const net = require('net');
const axios = require('axios');
const ipLib = require('ip');

router.get('/', async (req, res) => {
  try {
    // 1. 获取本机 IP
    const myIp = ipLib.address(); // 本机 IP, 比如 "192.168.1.101"
    
    // 2. 根据实际情况截取网段 (如 192.168.1.x)
    const ipParts = myIp.split('.');
    ipParts[3] = '';
    const prefix = ipParts.join('.');
    const start = 1;
    const end = 254;

    const openHosts = [];
    let completed = 0;

    // 暂存最终结果
    const devices = [];

    for (let i = start; i <= end; i++) {
      const testIp = prefix + i;
      checkPort(testIp, 6095, async (isOpen) => {
        completed++;
        if (isOpen) {
          // 若端口开放，再调用 isalive 接口获取信息
          const info = await getDeviceInfo(testIp);
          if (info) {
            // info 返回非空就说明是小米电视
            devices.push(info);
          } else {
            // 如果不符合/接口不通，也可决定是否保留 testIp
            // openHosts.push(testIp);
          }
        }

        // 当全部扫描结束后，返回结果
        if (completed === (end - start + 1)) {
          // 若您仍想保留仅端口开放的列表，可 openHosts.push(testIp) 上面写好
          // 这里只返回 devices 即可
          res.json({
            localIp: myIp,
            devices: devices
          });
        }
      });
    }
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: '扫描失败' });
  }
});

/**
 * checkPort: 检查某 IP 的指定端口是否开放
 */
function checkPort(host, port, callback) {
  const socket = new net.Socket();
  socket.setTimeout(500);

  socket.on('connect', () => {
    socket.destroy();
    callback(true);
  });

  socket.on('timeout', () => {
    socket.destroy();
    callback(false);
  });

  socket.on('error', () => {
    socket.destroy();
    callback(false);
  });

  socket.connect(port, host);
}

/**
 * getDeviceInfo: 调用 http://host:6095/request?action=isalive
 *                若成功，则返回电视信息对象；否则返回 null
 */
async function getDeviceInfo(host) {
  try {
    const url = `http://${host}:6095/request?action=isalive`;
    const resp = await axios.get(url, { timeout: 1000 });
    if (resp.data && resp.data.status === 0 && resp.data.data) {
      // 这里可根据返回的字段进行提取
      return {
        ip: host,
        devicename: resp.data.data.devicename,
        build: resp.data.data.build,
        version: resp.data.data.version,
        // ...other fields as needed
      };
    } else {
      return null;
    }
  } catch (e) {
    // console.error('getDeviceInfo error:', e.message);
    return null;
  }
}

module.exports = router;