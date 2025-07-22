const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let players = [];
let buzzOrder = [];

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

console.log('WebSocket server running on ws://localhost:8080'); 