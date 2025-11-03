// public/js/apps.js

window.addEventListener('DOMContentLoaded', () => {
  const loadAppsBtn = document.getElementById('loadAppsBtn');
  const appList = document.getElementById('appList');
  const tvIp = getUrlParam('ip');
  const fallbackIcon = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="#e5e7eb"/>
      <path fill="#94a3b8" d="M16 20h32v4H16zm0 12h32v4H16zm0 12h20v4H16z"/>
    </svg>
  `);

  const setLoadingState = (loading) => {
    if (!loadAppsBtn) return;
    loadAppsBtn.disabled = loading;
    if (loading) {
      loadAppsBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>刷新中...';
    } else {
      loadAppsBtn.innerHTML = '刷新列表';
    }
  };

  const showInfo = (message) => {
    appList.innerHTML = `
      <div class="col-12">
        <div class="empty-state">${message}</div>
      </div>
    `;
  };

  const showError = (message) => {
    appList.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger" role="alert">${message}</div>
      </div>
    `;
  };

  function renderApps(apps) {
    if (!apps || apps.length === 0) {
      showInfo('电视上暂未发现可展示的应用。');
      return;
    }

    appList.innerHTML = '';

    apps.forEach(app => {
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-lg-4';

      const card = document.createElement('div');
      card.className = 'card app-card h-100';

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body d-flex flex-column justify-content-between';

      const header = document.createElement('div');
      header.className = 'd-flex align-items-center mb-3';

      const icon = document.createElement('img');
      icon.className = 'app-icon flex-shrink-0';
      icon.alt = `${app.AppName || '应用'} 图标`;
      icon.src = app.IconURL || fallbackIcon;
      icon.onerror = () => {
        icon.onerror = null;
        icon.src = fallbackIcon;
      };

      const meta = document.createElement('div');
      meta.className = 'ms-2';

      const title = document.createElement('h2');
      title.className = 'h6 mb-1';
      title.textContent = app.AppName || '未命名应用';

      const subtitle = document.createElement('div');
      subtitle.className = 'text-muted small';
      subtitle.textContent = app.PackageName || '';

      meta.appendChild(title);
      meta.appendChild(subtitle);

      header.appendChild(icon);
      header.appendChild(meta);

      const launchBtn = document.createElement('button');
      launchBtn.type = 'button';
      launchBtn.className = 'btn btn-outline-primary btn-launch w-100 mt-auto';
      launchBtn.textContent = '启动应用';
      launchBtn.addEventListener('click', () => launchApp(app.PackageName, app.AppName));

      cardBody.appendChild(header);
      cardBody.appendChild(launchBtn);
      card.appendChild(cardBody);
      col.appendChild(card);
      appList.appendChild(col);
    });
  }

  async function loadApps() {
    if (!tvIp) {
      showInfo('请先在扫描页选择要控制的电视。');
      await showPopup('还没有连接电视，无法获取应用列表。');
      window.location.href = 'scan.html';
      return;
    }

    setLoadingState(true);
    showInfo('正在加载应用列表，请稍候...');

    try {
      const response = await fetch(`/tv/apps?ip=${tvIp}&count=999&changeIcon=1`);
      const data = await response.json();
      if (data.status === 0 && data.data && Array.isArray(data.data.AppInfo)) {
        renderApps(data.data.AppInfo);
      } else {
        console.error('获取应用列表失败:', data);
        showError(`获取失败：${data.msg || '未知错误'}`);
        await showPopup(`获取应用列表失败：${data.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('获取应用列表出错:', error);
      showError(`网络错误：${error.message || error}`);
      await showPopup(`网络错误：${error.message || error}`);
    } finally {
      setLoadingState(false);
    }
  }

  async function launchApp(pkg, appName) {
    if (!tvIp) {
      await showPopup('当前未连接电视，无法启动应用。');
      return;
    }
    if (!pkg) {
      await showPopup('缺少应用包名，无法启动。');
      return;
    }

    try {
      const response = await fetch(`/tv/launch?ip=${tvIp}&packagename=${encodeURIComponent(pkg)}`);
      const data = await response.json();
      if (data.status === 0) {
        await showPopup(`[${appName || pkg}] 启动指令已发送。`);
      } else {
        console.error('启动应用失败:', data);
        await showPopup(`启动失败：${data.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('启动应用出错:', error);
      await showPopup(`启动应用出错：${error.message || error}`);
    }
  }

  if (loadAppsBtn) {
    loadAppsBtn.addEventListener('click', loadApps);
  }

  loadApps();
});
