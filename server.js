const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

// HTTP server
const httpServer = http.createServer((req, res) => {
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// WebSocket server on port 9090
const wss = new WebSocket.Server({ port: 9090 });

let players = [];
let buzzOrder = []; // structure will be: [{ name, time }]

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
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

    console.log(players);
    console.log(buzzOrder);

    if (data.type === 'join') {
      // Add player if not already present and name is not empty
      if (data.name && !players.find(p => p.name === data.name)) {
        players.push({ name: data.name });
      }
      broadcast({ type: 'players', players, buzzOrder });
    }

    if (data.type === 'buzz') {
      if (!buzzOrder.find(entry => entry.name === data.name)) {
        buzzOrder.push({ name: data.name, time: Date.now() });
        broadcast({ type: 'buzzOrder', buzzOrder });
      }
    }

    if (data.type === 'reset') {
      buzzOrder = [];
      broadcast({ type: 'buzzOrder', buzzOrder });
    }

    if (data.type === 'hardReset') {
      players = [];
      buzzOrder = [];
      broadcast({ type: 'hardReset' });
      broadcast({ type: 'players', players, buzzOrder });
    }

    if (data.type === 'changeName') {
      // Remove old name from players and buzzOrder
      players = players.filter(p => p.name !== data.oldName);
      buzzOrder = buzzOrder.filter(entry => entry.name !== data.oldName);
      // Add new name if not already present and newName is not empty
      if (data.newName && !players.find(p => p.name === data.newName)) {
        players.push({ name: data.newName });
      }
      broadcast({ type: 'players', players, buzzOrder });
      broadcast({ type: 'buzzOrder', buzzOrder });
    }

    if (data.type === 'getState') {
      ws.send(JSON.stringify({ type: 'players', players, buzzOrder }));
    }
  });

  ws.on('close', () => {
    // Optionally handle player disconnects
  });
});

const HTTP_PORT = process.env.PORT || 3100;
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});

console.log('WebSocket server running on ws://localhost:9090'); 