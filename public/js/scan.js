// public/js/scan.js

window.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scanBtn');
  const deviceList = document.getElementById('deviceList');

  scanBtn.addEventListener('click', async () => {
    deviceList.innerHTML = '扫描中...';
    try {
      const response = await fetch('/scan');
      const data = await response.json();

      if (data.success && data.devices && data.devices.length > 0) {
        deviceList.innerHTML = '';
        data.devices.forEach(dev => {
          const li = document.createElement('li');
          li.innerHTML = `
            <a href="remote.html?ip=${dev.ip.split(':')[0]}" target="_blank">
              <strong>${dev.devicename || '未知设备'}</strong>
              <br>IP: ${dev.ip}
            </a>
            <hr>
          `;
          deviceList.appendChild(li);
        });
      } else {
        deviceList.innerHTML = '暂无扫描到可用小米电视。';
      }
    } catch (err) {
      deviceList.innerHTML = '扫描出错: ' + err;
      console.error('扫描出错:', err);
    }
  });
});