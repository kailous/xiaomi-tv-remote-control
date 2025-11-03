// public/js/scan.js

window.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scanBtn');
  const scanForm = document.getElementById('scanForm');
  const deviceList = document.getElementById('deviceList');
  const subnetInput = document.getElementById('subnetInput');
  const portInput = document.getElementById('portInput');
  const rangeStartInput = document.getElementById('rangeStartInput');
  const rangeEndInput = document.getElementById('rangeEndInput');
  const manualSubnetAlert = document.getElementById('manualSubnetAlert');
  const scanRangeInfo = document.getElementById('scanRangeInfo');

  const STORAGE_KEY = 'miTvScanPreferences';

  const toggleManualAlert = (visible) => {
    if (!manualSubnetAlert) return;
    manualSubnetAlert.classList.toggle('d-none', !visible);
  };

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const prefs = JSON.parse(stored);
      if (prefs && typeof prefs === 'object') {
        if (subnetInput && !subnetInput.value && prefs.subnet) {
          subnetInput.value = prefs.subnet;
        }
        if (rangeStartInput && prefs.rangeStart) {
          rangeStartInput.value = prefs.rangeStart;
        }
        if (rangeEndInput && prefs.rangeEnd) {
          rangeEndInput.value = prefs.rangeEnd;
        }
        if (portInput && prefs.port) {
          portInput.value = prefs.port;
        }
      }
    } catch (error) {
      console.warn('读取扫描偏好失败:', error);
    }
  };

  const savePreferences = (prefs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.warn('保存扫描偏好失败:', error);
    }
  };

  const setButtonLoading = (loading) => {
    if (!scanBtn) return;
    scanBtn.disabled = loading;
    if (loading) {
      scanBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>扫描中...';
    } else {
      scanBtn.innerHTML = '开始扫描';
    }
  };

  const showLoading = (message = '扫描中，请稍候...') => {
    if (!deviceList) return;
    deviceList.innerHTML = `<div class="loading-state mt-4 text-center">${message}</div>`;
  };

  const showEmpty = (message) => {
    if (!deviceList) return;
    deviceList.innerHTML = `<div class="empty-state mt-4">${message}</div>`;
  };

  const showError = (message) => {
    if (!deviceList) return;
    deviceList.innerHTML = `<div class="alert alert-danger mt-4" role="alert">${message}</div>`;
  };

  const updateRangeInfo = (meta) => {
    if (!scanRangeInfo || !meta || !meta.subnet) return;
    const subnet = meta.subnet.endsWith('.') ? meta.subnet.slice(0, -1) : meta.subnet;
    const start = Number(meta.rangeStart ?? 1);
    const end = Number(meta.rangeEnd ?? 254);
    const port = Number(meta.port ?? 6095);
    scanRangeInfo.textContent = `扫描范围：${subnet}.${start} - ${subnet}.${end}（端口 ${port}）`;
  };

  const renderDevices = (devices) => {
    if (!deviceList) return;
    deviceList.innerHTML = '';
    devices.forEach(device => {
      const host = device.host || (device.ip ? device.ip.split(':')[0] : '');
      const port = device.port || (device.ip ? device.ip.split(':')[1] : '');
      const link = document.createElement('a');
      link.className = 'list-group-item list-group-item-action d-flex align-items-center justify-content-between gap-3 py-3';
      link.href = host ? `remote.html?ip=${encodeURIComponent(host)}` : '#';
      link.innerHTML = `
        <div class="device-meta">
          <span class="device-name">${device.devicename || '未知设备'}</span>
          <span class="device-ip">IP：${host ? `${host}${port ? `:${port}` : ''}` : '未知'}</span>
        </div>
        <span class="badge bg-primary-subtle text-primary-emphasis">控制</span>
      `;

      if (!host) {
        link.classList.add('disabled');
        link.setAttribute('aria-disabled', 'true');
      }

      deviceList.appendChild(link);
    });
  };

  const normalizeSubnet = (value) => {
    const cleaned = value.trim().replace(/\.$/, '');
    const match = cleaned.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!match) return null;
    const segments = match.slice(1, 4).map(Number);
    if (segments.some(num => Number.isNaN(num) || num < 0 || num > 255)) return null;
    const base = segments.join('.');
    return { base, withDot: `${base}.` };
  };

  const readRangeValue = (input, fallback) => {
    if (!input) return fallback;
    const num = Number.parseInt(input.value, 10);
    if (Number.isInteger(num) && num >= 1 && num <= 254) {
      return num;
    }
    return fallback;
  };

  const readPortValue = (input) => {
    if (!input) return 6095;
    const num = Number.parseInt(input.value, 10);
    if (Number.isInteger(num) && num >= 1 && num <= 65535) {
      return num;
    }
    return 6095;
  };

  const readScanParams = () => {
    const subnetRaw = subnetInput?.value?.trim() || '';
    const normalized = normalizeSubnet(subnetRaw);
    if (!normalized) {
      showError('请先填写正确的内网网段，例如 192.168.1');
      subnetInput?.focus();
      return null;
    }

    let rangeStart = readRangeValue(rangeStartInput, 1);
    let rangeEnd = readRangeValue(rangeEndInput, 254);

    if (rangeStart > rangeEnd) {
      const temp = rangeStart;
      rangeStart = rangeEnd;
      rangeEnd = temp;
      if (rangeStartInput && rangeEndInput) {
        rangeStartInput.value = rangeStart;
        rangeEndInput.value = rangeEnd;
      }
    }

    const port = readPortValue(portInput);

    return {
      subnetBase: normalized.base,
      subnetWithDot: normalized.withDot,
      rangeStart,
      rangeEnd,
      port
    };
  };

  const startScan = async () => {
    const params = readScanParams();
    if (!params) return;

    setButtonLoading(true);
    showLoading();

    try {
      const searchParams = new URLSearchParams();
      searchParams.set('subnet', params.subnetWithDot);
      searchParams.set('start', params.rangeStart);
      searchParams.set('end', params.rangeEnd);
      searchParams.set('port', params.port);

      const response = await fetch(`/scan?${searchParams.toString()}`);
      const data = await response.json();

      if (data.meta) {
        updateRangeInfo(data.meta);
      }

      if (data.meta?.needsSubnet) {
        toggleManualAlert(true);
      }

      if (data.success && Array.isArray(data.devices) && data.devices.length > 0) {
        renderDevices(data.devices);
      } else {
        showEmpty(data.error || '暂未发现可用的小米电视设备。');
      }

      savePreferences({
        subnet: params.subnetBase,
        rangeStart: params.rangeStart,
        rangeEnd: params.rangeEnd,
        port: params.port
      });
    } catch (error) {
      console.error('扫描出错:', error);
      showError(`扫描出错：${error.message || error}`);
    } finally {
      setButtonLoading(false);
    }
  };

  if (scanBtn) {
    scanBtn.addEventListener('click', startScan);
  }

  if (scanForm) {
    scanForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!scanBtn?.disabled) {
        startScan();
      }
    });
  }

  document.addEventListener('local-ip-info', (event) => {
    const info = event.detail;
    if (!info) return;
    toggleManualAlert(Boolean(info.shouldPromptManual));
    if (subnetInput && !subnetInput.value && info.suggestedSubnet) {
      subnetInput.value = info.suggestedSubnet;
    }
  });

  loadPreferences();

  if (window.__localIpInfo) {
    const info = window.__localIpInfo;
    toggleManualAlert(Boolean(info.shouldPromptManual));
    if (subnetInput && !subnetInput.value && info.suggestedSubnet) {
      subnetInput.value = info.suggestedSubnet;
    }
  }

  showEmpty('填写内网网段后点击“开始扫描”，即可尝试发现局域网内的电视设备。');
});
