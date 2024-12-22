// public/js/apps.js

window.addEventListener('DOMContentLoaded', () => {
  // 1. 获取 URL 参数里的 IP
  const urlParams = new URLSearchParams(window.location.search);
  const tvIp = urlParams.get('ip'); // 例如 "192.168.0.102"
  const tvIpSpan = document.getElementById('tvIp');
  tvIpSpan.innerText = tvIp || '无';

  const loadAppsBtn = document.getElementById('loadAppsBtn');
  const appList = document.getElementById('appList');

  // 2. 点击按钮时，刷新列表
  loadAppsBtn.addEventListener('click', () => {
    loadApps();
  });

  // 3. 定义全局函数 loadApps()
  //    （如果想在 nav.html 加载完后自动执行，可在 apps.html 中调用它）
  window.loadApps = async function loadApps() {
    if (!tvIp) {
      alert('IP 不存在，无法获取应用列表');
      return;
    }
    try {
      appList.innerHTML = '加载中...';
      const response = await fetch(`/tv/apps?ip=${tvIp}`);
      const data = await response.json();
      if (data.success) {
        renderApps(data.apps);
      } else {
        appList.innerHTML = `获取失败: ${data.error || '未知错误'}`;
        console.error(data.raw);
      }
    } catch (err) {
      appList.innerHTML = '网络错误: ' + err;
    }
  };

  // 4. 渲染应用列表
  function renderApps(apps) {
    if (!apps || apps.length === 0) {
      appList.innerHTML = '暂无应用或列表为空';
      return;
    }
    appList.innerHTML = '';
    apps.forEach(app => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${app.icon}" alt="图标" style="width:40px;height:40px;vertical-align:middle;" />
        <strong>${app.label || '[无应用名]'}</strong>
        <button class="launchBtn">启动</button>
      `;
      const button = li.querySelector('.launchBtn');
      // 注意：若后端只返回 icon/label，您需要保留 pkg 才能启动
      button.addEventListener('click', () => launchApp(app.pkg));
      appList.appendChild(li);
    });
  }

  // 5. 启动指定应用
  async function launchApp(pkg) {
    if (!tvIp) {
      alert('IP 不存在，无法启动');
      return;
    }
    if (!pkg) {
      alert('后端未返回 pkg 字段，无法启动');
      return;
    }
    try {
      const response = await fetch(`/tv/launch?ip=${tvIp}&pkg=${pkg}`);
      const data = await response.json();
      if (data.success) {
        alert(`已请求启动 [${pkg}]`);
      } else {
        alert(`启动失败: ${data.error}`);
        console.error(data.raw);
      }
    } catch (err) {
      console.error('网络错误:', err);
    }
  }
});