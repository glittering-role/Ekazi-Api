import { Server } from 'socket.io';
import http from 'http';
import { verifySocketToken } from './../Modules/Users/middleware/jwt_auth';

export const onlineUsers = new Map<string, string>();

export let io: Server;

export const socketIoConfig = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  io.use(verifySocketToken);

  io.on('connection', (socket) => {
    const user = socket.data.user;
    const userId = user.userId.id;

    // console.log(`Client connected: ${socket.id}, User ID: ${userId}`);

    // Add the user to the online users map
    onlineUsers.set(userId, socket.id);

    // Handle disconnection
    socket.on('disconnect', () => {
      // console.log(`Client disconnected: ${socket.id}, User ID: ${userId}`);

      // Remove the user from the online users map
      onlineUsers.delete(userId);
    });
  });

  return io;
};
