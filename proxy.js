import http from 'http';
import httpProxy from 'http-proxy';

// 创建代理服务器实例
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true
});

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头，允许所有来源访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`[${new Date().toISOString()}] Proxying request: ${req.method} ${req.url}`);
  
  // 转发请求到本地开发服务器
  proxy.web(req, res, (err) => {
    if (err) {
      console.error(`Proxy error: ${err.message}`);
      res.writeHead(500);
      res.end(`Proxy error: ${err.message}`);
    }
  });
});

// 处理WebSocket连接
server.on('upgrade', (req, socket, head) => {
  console.log(`[${new Date().toISOString()}] Upgrading to WebSocket: ${req.url}`);
  proxy.ws(req, socket, head);
});

// 启动代理服务器
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`\n🚀 Proxy server running at http://0.0.0.0:${PORT}`);
  console.log(`📡 Forwarding requests to http://localhost:3000`);
  console.log(`🔗 Local network access: http://192.168.0.101:${PORT}`);
  console.log(`\n📝 Logs will appear below...`);
});

// 处理代理错误
proxy.on('error', (err, req, res) => {
  console.error(`[${new Date().toISOString()}] Proxy error: ${err.message}`);
});

// 处理代理响应
proxy.on('proxyRes', (proxyRes, req, res) => {
  console.log(`[${new Date().toISOString()}] Response: ${proxyRes.statusCode} ${req.method} ${req.url}`);
});
