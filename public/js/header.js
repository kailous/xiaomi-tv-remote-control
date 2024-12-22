// public/js/header.js

fetch('header.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('header-container').innerHTML = html;

    // 获取本机 IP
    fetch('/api/local-ip')
      .then(res => res.json())
      .then(data => {
        setLocalIp(data.localIp || '未获取');
      })
      .catch(err => {
        console.error('获取本机 IP 失败:', err);
        setLocalIp('获取失败');
      });

    // 获取正在控制的电视设备名称
    const tvIp = getUrlParam('ip');
    if (tvIp) {
      fetch(`/api/get-device-name?ip=${tvIp}`)
        .then(res => res.json())
        .then(data => {
          if (data.deviceName) {
            setTvDeviceName(data.deviceName);
          } else {
            setTvDeviceName('获取失败');
          }
        })
        .catch(err => {
          console.error('获取设备名称失败:', err);
          setTvDeviceName('获取失败');
        });
    } else {
      setTvDeviceName('未连接');
    }
  })
  .catch(err => {
    console.error('加载 header 失败:', err);
  });