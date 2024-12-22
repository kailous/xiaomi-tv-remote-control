// public/js/nav.js

fetch('nav.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('nav-container').innerHTML = html;

    // 获取当前页面的 IP 参数，并更新导航链接
    const tvIp = getUrlParam('ip');
    updateNavLinks(tvIp);
  })
  .catch(err => {
    console.error('加载 nav 失败:', err);
  });