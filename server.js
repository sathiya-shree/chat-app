const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/chat-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connection
io.on('connection', socket => {
  console.log('A user connected');

  // Send all old messages
  Message.find().sort({ timestamp: 1 }).limit(50).then(messages => {
    socket.emit('previousMessages', messages);
  });

  // Listen for new messages
  socket.on('chatMessage', async (msgText) => {
    const message = new Message({ text: msgText });
    await message.save();

    io.emit('chatMessage', message); // broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
