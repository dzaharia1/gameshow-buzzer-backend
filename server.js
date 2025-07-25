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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`HTTP/WebSocket server running on http://localhost:${PORT}`);
}); 