require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const contactRoutes = require('./src/routes/contact');
const callRoutes = require('./src/routes/call');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/calls', callRoutes);

// serve client static files
app.use('/', express.static(path.join(__dirname, '..', 'client')));

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join-room', (roomId, user) => {
    socket.join(roomId);
    socket.to(roomId).emit('peer-joined', { id: socket.id, user });
  });

  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', data);
  });

  socket.on('end-call', (data) => {
    socket.to(data.roomId).emit('call-ended', data);
  });

  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach(r => {
      if (r !== socket.id) {
        socket.to(r).emit('peer-left', socket.id);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/vizzdb';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> { console.log('Mongo connected'); server.listen(PORT, ()=>console.log('Server running on port', PORT)); })
  .catch(err=> { console.error('Mongo error', err); server.listen(PORT, ()=>console.log('Server running (no DB) on', PORT)); });
