// public/js/remote.js

window.addEventListener('DOMContentLoaded', () => {
  const tvIp = getUrlParam('ip');

  /**
   * 发送按键事件到电视
   * @param {string} key - 按键名称
   */
  async function sendKeyEvent(key) {
    if (!tvIp) {
      showPopup('未获取到电视 IP，无法下发指令。');
      return;
    }

    try {
      const response = await fetch(`/tv/key?ip=${tvIp}&keycode=${key}`);
      const data = await response.json();
      if (data.status !== 0) {
        console.error(`按键 ${key} 发送失败:`, data.msg);
        await showPopup(`按键发送失败：${data.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('按键发送网络错误:', error);
      await showPopup(`网络错误：${error.message || error}`);
    }
  }

  // 绑定遥控按键事件
  document.querySelectorAll('.remote-btn[data-key]').forEach(button => {
    button.addEventListener('click', () => {
      const keyName = button.getAttribute('data-key');
      if (keyName) {
        sendKeyEvent(keyName);
      }
    });
  });

  // 跳转到应用列表页面
  const appBtn = document.getElementById('appBtn');
  if (appBtn) {
    appBtn.addEventListener('click', (event) => {
      event.preventDefault();
      if (!tvIp) {
        showPopup('未获取到电视 IP，无法跳转到应用列表。');
        return;
      }
      window.location.href = `apps.html?ip=${tvIp}`;
    });
  }
});
