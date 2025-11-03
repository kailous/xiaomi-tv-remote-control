// public/js/nav.js

fetch('nav.html')
  .then(response => response.text())
  .then(html => {
    const navContainer = document.getElementById('nav-container');
    navContainer.innerHTML = html;

    // 获取当前页面的 IP 参数，并更新导航链接
    const tvIp = getUrlParam('ip');
    updateNavLinks(tvIp);

    // 高亮当前页面对应的导航项
    const currentPage = document.body.dataset.page;
    if (currentPage) {
      const activeLinks = navContainer.querySelectorAll(`[data-page-link=\"${currentPage}\"]`);
      activeLinks.forEach(link => link.classList.add('active'));
    }
  })
  .catch(err => {
    console.error('加载 nav 失败:', err);
  });
