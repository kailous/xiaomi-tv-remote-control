// public/js/scan.js

window.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scanBtn');
  const deviceList = document.getElementById('deviceList');

  const setButtonLoading = (loading) => {
    scanBtn.disabled = loading;
    if (loading) {
      scanBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>扫描中...';
    } else {
      scanBtn.innerHTML = '开始扫描';
    }
  };

  const showLoading = (message = '扫描中，请稍候...') => {
    deviceList.innerHTML = `<div class="loading-state mt-4 text-center">${message}</div>`;
  };

  const showEmpty = (message) => {
    deviceList.innerHTML = `<div class="empty-state mt-4">${message}</div>`;
  };

  const showError = (message) => {
    deviceList.innerHTML = `<div class="alert alert-danger mt-4" role="alert">${message}</div>`;
  };

  const renderDevices = (devices) => {
    deviceList.innerHTML = '';
    devices.forEach(device => {
      const host = device.ip ? device.ip.split(':')[0] : '';
      const item = document.createElement('a');
      item.className = 'list-group-item list-group-item-action d-flex align-items-center justify-content-between gap-3 py-3';
      item.href = host ? `remote.html?ip=${encodeURIComponent(host)}` : '#';

      item.innerHTML = `
        <div class="device-meta">
          <span class="device-name">${device.devicename || '未知设备'}</span>
          <span class="device-ip">IP：${device.ip || '未知'}</span>
        </div>
        <span class="badge bg-primary-subtle text-primary-emphasis">控制</span>
      `;

      if (!host) {
        item.classList.add('disabled');
        item.setAttribute('aria-disabled', 'true');
      }

      deviceList.appendChild(item);
    });
  };

  const startScan = async () => {
    setButtonLoading(true);
    showLoading();

    try {
      const response = await fetch('/scan');
      const data = await response.json();

      if (data.success && Array.isArray(data.devices) && data.devices.length > 0) {
        renderDevices(data.devices);
      } else {
        showEmpty(data.error || '暂未发现可用的小米电视设备。');
      }
    } catch (error) {
      console.error('扫描出错:', error);
      showError(`扫描出错：${error.message || error}`);
    } finally {
      setButtonLoading(false);
    }
  };

  scanBtn.addEventListener('click', startScan);

  showEmpty('点击上方的“开始扫描”按钮，快速发现局域网内的电视设备。');
});
