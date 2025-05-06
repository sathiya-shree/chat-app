const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://sathiyashree03:Shree%4003@chatappcluster.jfenyhb.mongodb.net/chatapp?retryWrites=true&w=majority&appName=ChatAppCluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connection
io.on('connection', socket => {
  console.log('🟢 A user connected');

  // Send last 50 messages to new user
  Message.find().sort({ timestamp: 1 }).limit(50).then(messages => {
    socket.emit('previousMessages', messages);
  });

  // Listen for new messages
  socket.on('chatMessage', async (msgText) => {
    const message = new Message({
      username: 'Anonymous', // static for now
      message: msgText,
      timestamp: new Date()
    });
    await message.save();

    io.emit('chatMessage', message); // broadcast to all
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
