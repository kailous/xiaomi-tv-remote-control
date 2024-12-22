// public/js/remote.js

window.addEventListener('DOMContentLoaded', () => {
    // 1. 解析 URL 参数中的 ip
    const urlParams = new URLSearchParams(window.location.search);
    const tvIp = urlParams.get('ip'); // 例如 "192.168.1.120"
    const tvIpSpan = document.getElementById('tvIp');
    tvIpSpan.innerText = tvIp || '无';
  
    // 2. 给每个遥控按键绑定点击事件
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('click', async () => {
        if (!tvIp) {
          alert('未获取到电视IP');
          return;
        }
        const keyName = button.getAttribute('data-key');
        
        try {
          const response = await fetch(`/tv/key?ip=${tvIp}&keyName=${keyName}`);
          const data = await response.json();
          if (data.success) {
            console.log(`按键 ${keyName} 发送成功`);
          } else {
            console.error(`按键 ${keyName} 发送失败`, data.error);
          }
        } catch (err) {
          console.error(`网络错误: ${err}`);
        }
      });
    });
  
    // 3. 跳转到应用列表页面
    const appBtn = document.getElementById('appBtn');
    appBtn.addEventListener('click', (e) => {
      e.preventDefault(); // 阻止默认跳转
      if (!tvIp) {
        alert('未获取到电视IP');
        return;
      }
      // 跳转到 apps.html，并带上电视 IP 参数
      window.location.href = `apps.html?ip=${tvIp}`;
    });
  });
  