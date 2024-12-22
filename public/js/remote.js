// public/js/remote.js

window.addEventListener('DOMContentLoaded', () => {
  const tvIp = getUrlParam('ip');

  /**
   * 发送按键事件到电视
   * @param {string} key - 按键名称
   */
  async function sendKeyEvent(key) {
    if (!tvIp) {
      alert('未获取到电视IP');
      return;
    }

    try {
      const response = await fetch(`/tv/key?ip=${tvIp}&keycode=${key}`);
      const data = await response.json();
      if (data.status === 0) {
        console.log(`按键 ${key} 发送成功`);
      } else {
        console.error(`按键 ${key} 发送失败:`, data.msg);
        alert(`按键发送失败: ${data.msg || '未知错误'}`);
      }
    } catch (err) {
      console.error(`网络错误:`, err);
      alert(`网络错误: ${err}`);
    }
  }

  // 绑定遥控按键事件
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
      const keyName = button.getAttribute('data-key');
      sendKeyEvent(keyName);
    });
  });

  // 跳转到应用列表页面
  const appBtn = document.getElementById('appBtn');
  appBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!tvIp) {
      alert('未获取到电视IP');
      return;
    }
    window.location.href = `apps.html?ip=${tvIp}`;
  });
});