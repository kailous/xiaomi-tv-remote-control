// public/js/scan.js

window.addEventListener('DOMContentLoaded', () => {
    // 当页面加载完毕后再绑定事件
    const scanBtn = document.getElementById('scanBtn');
    const deviceList = document.getElementById('deviceList');
    const localIpSpan = document.getElementById('localIp');
  
    scanBtn.addEventListener('click', async () => {
      deviceList.innerHTML = '扫描中...';
      try {
        const response = await fetch('/scan');
        const data = await response.json();
  
        localIpSpan.innerText = data.localIp || '无';
  
        if (data.devices && data.devices.length > 0) {
          deviceList.innerHTML = '';
          data.devices.forEach(dev => {
            const li = document.createElement('li');
            li.innerHTML = `
              <strong>${dev.devicename || '未知设备'}</strong>
              <br>IP: ${dev.ip}
              <a href="remote.html?ip=${dev.ip}" target="_blank">打开遥控器</a>
              <hr>
            `;
            deviceList.appendChild(li);
          });
        } else {
          deviceList.innerHTML = '暂无扫描到可用小米电视。';
        }
      } catch (err) {
        deviceList.innerHTML = '扫描出错: ' + err;
        console.error(err);
      }
    });
  });
  