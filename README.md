# Gameshow Buzzer Backend

This is the backend WebSocket server for the Gameshow Buzzer app. It manages player connections, buzz events, and communicates real-time updates to all connected clients (players and host).

## Getting Started

### 1. Install dependencies

```
npm install
```

### 2. Run the WebSocket server

```
node server.js
```

The server will start on `ws://localhost:8080` by default.

## How it works
- Players and the host connect to this server via WebSockets.
- Players join with their name and can buzz in; the server tracks the buzz order.
- The host sees the list and order of buzzed players and can reset the queue for the next question.

## Notes
- Make sure to start this backend before running the frontend app.
- You can change the port in `server.js` if needed. 