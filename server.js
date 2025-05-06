const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store messages in memory (for simplicity, use a database in production)
let messages = [];

// Serve static files (e.g., HTML, CSS)
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send previous messages to the new user
  socket.emit('previousMessages', messages);

  // Listen for new messages
  socket.on('chatMessage', (msg) => {
    // Add message to message history
    messages.push(msg);
    // Emit message to all users
    io.emit('chatMessage', msg);
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
