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
  const linkConfig = [
    { key: 'scan', path: 'scan.html', appendIp: true },
    { key: 'remote', path: 'remote.html', appendIp: true },
    { key: 'apps', path: 'apps.html', appendIp: true }
  ];

  linkConfig.forEach(({ key, path, appendIp }) => {
    const links = document.querySelectorAll(`[data-link=\"${key}\"]`);
    links.forEach(link => {
      let href = path;
      if (appendIp && ip) {
        const separator = path.includes('?') ? '&' : '?';
        href = `${path}${separator}ip=${encodeURIComponent(ip)}`;
      }
      link.setAttribute('href', href);
    });
  });
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

/**
 * 显示弹窗
 * @param {string} message - 要显示的消息
 * @returns {Promise} - 在弹窗关闭时解决
 */
function showPopup(message) {
  return new Promise((resolve) => {
    const popup = document.querySelector('info-popup');
    if (popup) {
      // 定义处理关闭事件的函数
      const handleClose = () => {
        popup.removeEventListener('close', handleClose);
        resolve();
      };
      // 绑定关闭事件
      popup.addEventListener('close', handleClose);
      // 显示弹窗
      popup.show(message);
    } else {
      console.error('弹窗组件未加载');
      resolve(); // 直接解决 Promise
    }
  });
}

/**
 * 定义自定义弹窗组件
 */
class InfoPopup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.loadComponent();
    // 绑定键盘事件
    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 加载弹窗的 HTML 结构和 CSS 样式
   */
  async loadComponent() {
    try {
      // 使用绝对路径确保正确加载
      const cssResponse = await fetch('/css/popup.css');
      const cssText = await cssResponse.text();

      const htmlResponse = await fetch('/components/popup.html');
      const htmlText = await htmlResponse.text();

      // 设置 Shadow DOM 内容
      this.shadowRoot.innerHTML = `
        <style>${cssText}</style>
        ${htmlText}
      `;

      // 获取元素引用
      this.popup = this.shadowRoot.querySelector('.popup-overlay');
      this.popupMessage = this.shadowRoot.querySelector('#popupMessage');
      this.closeBtn = this.shadowRoot.querySelector('.close-btn');

      // 绑定关闭按钮事件
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.hide());
      } else {
        console.error('弹窗关闭按钮 .close-btn 未找到');
      }

      // 绑定点击弹窗外部区域事件
      if (this.popup) {
        this.popup.addEventListener('click', (event) => {
          if (event.target === this.popup) {
            this.hide();
          }
        });
      } else {
        console.error('弹窗覆盖层 .popup-overlay 未找到');
      }
    } catch (error) {
      console.error('加载弹窗组件失败:', error);
    }
  }

  /**
   * 显示弹窗并设置消息内容
   * @param {string} message - 要显示的消息
   */
  show(message) {
    if (this.popup && this.popupMessage) {
      this.popupMessage.textContent = message;
      this.popup.style.display = 'flex';
    } else {
      console.error('弹窗元素或消息元素未找到');
    }
  }

  /**
   * 隐藏弹窗并触发关闭事件
   */
  hide() {
    if (this.popup) {
      this.popup.style.display = 'none';
      this.dispatchEvent(new Event('close')); // 触发自定义的 close 事件
    }
  }

  /**
   * 处理键盘事件，按 ESC 键关闭弹窗
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.hide();
    }
  }
}

// 注册自定义元素
customElements.define('info-popup', InfoPopup);

/**
 * 加载并插入弹窗组件到页面
 */
async function loadPopup() {
  try {
    // 检查是否已经存在弹窗组件，避免重复加载
    if (!document.querySelector('info-popup')) {
      const popupElement = document.createElement('info-popup');
      document.body.appendChild(popupElement);
      // 弹窗组件会在 connectedCallback 中加载其内容
    }
  } catch (error) {
    console.error('加载弹窗组件失败:', error);
  }
}

// 在 DOM 加载完成后加载弹窗组件
window.addEventListener('DOMContentLoaded', loadPopup);
