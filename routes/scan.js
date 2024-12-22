    // routes/scan.js
const express = require('express');
const router = express.Router();
const net = require('net');
const ipLib = require('ip');

router.get('/', async (req, res) => {
  try {
    // 1. 获取本机 IP 和子网信息
    const myIp = ipLib.address(); // 本机 IP，如 "192.168.1.101"
    // 如果需要计算子网，可使用 ipLib.subnet(myIp, '255.255.255.0');

    // 2. 假设网关在同网段 "192.168.1.x"
    //   截取前三段作为前缀
    const ipParts = myIp.split('.');
    ipParts[3] = ''; // 去掉最后一段，为了后面拼接
    const prefix = ipParts.join('.');

    // 3. 扫描 192.168.1.1 ~ 192.168.1.254
    const start = 1;
    const end = 254;

    const openHosts = [];
    let completed = 0;

    for (let i = start; i <= end; i++) {
      const testIp = prefix + i;

      checkPort(testIp, 6095, (isOpen) => {
        completed++;
        if (isOpen) {
          // 如果端口开启，则记录下来
          openHosts.push(testIp);
        }

        // 当所有 IP 检查完毕后返回结果
        if (completed === (end - start + 1)) {
          res.json({
            localIp: myIp,
            openHosts
          });
        }
      });
    }
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: '扫描失败' });
  }
});

// 封装一个端口检测函数
function checkPort(host, port, callback) {
  const socket = new net.Socket();
  socket.setTimeout(500); // 超时 500 ms

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

module.exports = router;