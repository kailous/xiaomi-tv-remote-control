// public/js/apps.js

window.addEventListener('DOMContentLoaded', () => {
  const loadAppsBtn = document.getElementById('loadAppsBtn');
  const appList = document.getElementById('appList');
  const tvIp = getUrlParam('ip');

  /**
   * 定义加载应用列表的函数
   */
  async function loadApps() {
    if (!tvIp) {
      alert('还没有连接电视哦，无法获取应用列表');
      window.location.href = 'scan.html'; // 重定向到首页
      return;
    }
    try {
      appList.innerHTML = '加载中...';
      const response = await fetch(`/tv/apps?ip=${tvIp}&count=999&changeIcon=1`);
      const data = await response.json();
      if (data.status === 0 && data.data && data.data.AppInfo) {
        renderApps(data.data.AppInfo);
      } else {
        appList.innerHTML = `获取失败: ${data.msg || '未知错误'}`;
        console.error('获取应用列表失败:', data);
      }
    } catch (err) {
      appList.innerHTML = '网络错误: ' + err;
      console.error('获取应用列表出错:', err);
    }
  }

  /**
   * 渲染应用列表
   * @param {Array} apps - 应用信息数组
   */
  function renderApps(apps) {
    if (!apps || apps.length === 0) {
      appList.innerHTML = '暂无应用或列表为空';
      return;
    }
    appList.innerHTML = '';
    apps.forEach(app => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${app.IconURL}" alt="图标" style="width:40px;height:40px;vertical-align:middle;" />
        <strong>${app.AppName || '[无应用名]'}</strong>
        <button class="launchBtn">启动</button>
      `;
      const button = li.querySelector('.launchBtn');
      button.addEventListener('click', () => launchApp(app.PackageName));
      appList.appendChild(li);
    });
  }

  /**
   * 启动指定应用
   * @param {string} pkg - 应用包名
   */
  async function launchApp(pkg) {
    if (!tvIp) {
      alert('IP 不存在，无法启动');
      window.location.href = 'scan.html'; // 重定向到首页
      return;
    }
    if (!pkg) {
      alert('应用包名不存在，无法启动');
      return;
    }
    try {
      const response = await fetch(`/tv/launch?ip=${tvIp}&packagename=${pkg}`);
      const data = await response.json();
      if (data.status === 0) {
        alert(`已请求启动 [${pkg}]`);
      } else {
        alert(`启动失败: ${data.msg || '未知错误'}`);
        console.error('启动应用失败:', data);
      }
    } catch (err) {
      console.error('启动应用出错:', err);
      alert('启动应用出错: ' + err);
    }
  }

  // 绑定按钮点击事件
  loadAppsBtn.addEventListener('click', loadApps);

  // 页面加载时自动获取应用列表
  loadApps();
});