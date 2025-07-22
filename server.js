const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocket.Server({ server });

let players = [];
let buzzOrder = [];

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebgaSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      return;
    }

    if (data.type === 'join') {
      // Add player if not already present
      if (!players.find(p => p.name === data.name)) {
        players.push({ name: data.name });
      }
      broadcast({ type: 'players', players, buzzOrder });
    }

    if (data.type === 'buzz') {
      if (!buzzOrder.includes(data.name)) {
        buzzOrder.push(data.name);
        broadcast({ type: 'buzzOrder', buzzOrder });
      }
    }

    if (data.type === 'reset') {
      buzzOrder = [];
      broadcast({ type: 'buzzOrder', buzzOrder });
    }
  });

  ws.on('close', () => {
    // Optionally handle player disconnects
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`HTTP/WebSocket server running on http://localhost:${PORT}`);
}); 