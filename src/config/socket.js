const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_ORIGIN, credentials: true }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Unauthorized'));
      const user = verifyAccessToken(token);
      socket.user = user;
      const eventId = socket.handshake.query?.eventId;
      if (eventId) socket.join(`event:${eventId}`);
      return next();
    } catch (e) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    // could add subscribe/unsubscribe here
  });

  return {
    emitToEvent: (eventId, channel, payload) => io.to(`event:${eventId}`).emit(channel, payload)
  };
}

module.exports = { initSocket };
