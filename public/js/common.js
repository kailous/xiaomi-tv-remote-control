// public/js/common.js

/**
 * 获取 URL 参数
 * @param {string} param - 参数名
 * @returns {string|null} 参数值
 */
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  /**
   * 更新导航链接，附加 IP 参数
   * @param {string} ip - 电视 IP
   */
  function updateNavLinks(ip) {
    if (ip) {
      document.getElementById('nav-scan').href = `scan.html?ip=${ip}`;
      document.getElementById('nav-remote').href = `remote.html?ip=${ip}`;
      document.getElementById('nav-apps').href = `apps.html?ip=${ip}`;
    }
  }
  
  /**
   * 设置本机 IP
   * @param {string} ip - 本机 IP
   */
  function setLocalIp(ip) {
    const localIpElem = document.getElementById('localIp');
    if (localIpElem) {
      localIpElem.innerText = ip;
    }
  }
  
  /**
   * 设置正在控制的设备名称
   * @param {string} deviceName - 设备名称
   */
  function setTvDeviceName(deviceName) {
    const tvDeviceNameElem = document.getElementById('tvDeviceName');
    if (tvDeviceNameElem) {
      tvDeviceNameElem.innerText = deviceName;
    }
  }