import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { randomUUID } from 'crypto';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      todos: [],
      createdAt: Date.now(),
    });
  }
  return rooms.get(roomId);
}

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('join', (roomId) => {
    currentRoom = roomId || randomUUID();
    socket.join(currentRoom);
    const room = getRoom(currentRoom);
    socket.emit('sync', room.todos);
    console.log(`Client joined room: ${currentRoom}`);
  });

  socket.on('update', (todos) => {
    if (currentRoom) {
      const room = getRoom(currentRoom);
      room.todos = todos;
      socket.to(currentRoom).emit('sync', todos);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected from room: ${currentRoom}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
