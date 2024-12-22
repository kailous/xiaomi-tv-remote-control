// 加载 header.html
fetch('header.html')
.then(res => res.text())
.then(html => {
  document.getElementById('header-container').innerHTML = html;
  
  // 1) 获取当前页面 URL 参数中的 ip（若需要）
  const urlParams = new URLSearchParams(window.location.search);
  const tvIpValue = urlParams.get('ip') || '无';

  // 2) 从后端获取本机IP（或者在之前的扫描接口里已有），假设变量名是 localIpValue
  //   比如在 /scan 路由返回里已经包含 localIp
  //   这里做个示例: (真实项目中您会实际请求服务器或从别处拿到)
  let localIpValue = '192.168.0.101'; // 仅作示例

  // 3) 将它们填充到 <span id="localIp"> 和 <span id="tvIp">
  document.getElementById('localIp').innerText = localIpValue;
  document.getElementById('tvIp').innerText = tvIpValue;
})
.catch(err => {
  console.error('header 加载失败:', err);
});