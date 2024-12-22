fetch('nav.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('nav-container').innerHTML = html;

        // 解析当前页面 URL 中的 ip 参数
        const urlParams = new URLSearchParams(window.location.search);
        const tvIp = urlParams.get('ip'); 

        // 若存在 ip，则把它带到导航链接中
        if (tvIp) {
          const scanLink   = document.getElementById('nav-scan');
          const remoteLink = document.getElementById('nav-remote');
          const appsLink   = document.getElementById('nav-apps');
          scanLink.href   = `scan.html?ip=${tvIp}`;
          remoteLink.href = `remote.html?ip=${tvIp}`;
          appsLink.href   = `apps.html?ip=${tvIp}`;
        }

        // ★★★ 页面加载后立即获取列表 ★★★
        // 这里调用 apps.js 中的某个函数，或者直接写 fetch 逻辑
        // 如果逻辑在 apps.js 中，可等下在那边统一处理
        // 下面是简单演示：我们用一个全局函数 loadApps() 来获取列表
        if (typeof loadApps === 'function') {
          loadApps(); 
        }
      })
      .catch(err => {
        console.error('导航加载失败:', err);
      });