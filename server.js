const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Helper to get local Wi-Fi / Ethernet IPv4 address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();

const server = http.createServer((req, res) => {
  const [urlPath] = req.url.split('?');
  const cleanUrl = decodeURIComponent(urlPath);

  // Endpoint to return the local Wi-Fi IP to frontend
  if (cleanUrl === '/api/network-info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ip: localIp, port: PORT }));
    return;
  }

  let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('404 - Arquivo não encontrado');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`❤️  Site do Pedido de Namoro Iniciado com Sucesso!`);
  console.log(`💻  No Computador:           http://localhost:${PORT}`);
  if (localIp !== 'localhost') {
    console.log(`📱  No Celular (mesmo Wi-Fi): http://${localIp}:${PORT}`);
  }
  console.log(`======================================================\n`);
});
