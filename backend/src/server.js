import http from 'node:http';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

const app = express();
const server = http.createServer(app);

const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});
const onlineUsers = new Map();

app.set('io', io);
app.set('onlineUsers', onlineUsers);

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'codearena-api',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', apiRoutes);

io.on('connection', (socket) => {
  socket.emit('server:ready', {
    message: 'CodeArena realtime server connected',
  });

  socket.on('presence:join', (user) => {
    const safeUser = {
      id: user?.id || socket.id,
      name: user?.name || 'CodeArena Player',
      rating: user?.rating || 1200,
    };

    onlineUsers.set(socket.id, safeUser);
    socket.join('online-players');
    io.to('online-players').emit('presence:update', {
      onlineCount: onlineUsers.size,
      players: Array.from(onlineUsers.values()),
    });
  });

  socket.on('battle:invite', (payload) => {
    socket.to('online-players').emit('battle:notification', {
      type: 'INVITE',
      from: payload?.from || 'CodeArena Player',
      level: payload?.level || 'MEDIUM',
      roomCode: payload?.roomCode,
      inviteLink: payload?.inviteLink,
      message: `${payload?.from || 'A player'} invited you to a ${payload?.level || 'MEDIUM'} private battle.`,
    });
  });

  socket.on('battle:join', ({ battleId } = {}) => {
    if (!battleId) return;
    socket.join(`battle:${battleId}`);
    socket.emit('battle:presence', { battleId, connected: true });
  });

  socket.on('battle:leave', ({ battleId } = {}) => {
    if (battleId) socket.leave(`battle:${battleId}`);
  });

  socket.on('battle:heartbeat', ({ battleId, progress } = {}) => {
    if (!battleId) return;
    socket.to(`battle:${battleId}`).emit('battle:progress', {
      battleId,
      progress: Math.max(0, Math.min(Number(progress) || 0, 100)),
      at: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.to('online-players').emit('presence:update', {
      onlineCount: onlineUsers.size,
      players: Array.from(onlineUsers.values()),
    });
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(env.PORT, () => {
  console.log(`CodeArena API running on http://localhost:${env.PORT}`);
});
