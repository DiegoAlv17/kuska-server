import 'dotenv/config';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './server';
import ChatGateway from './communication/infrastructure/gateways/chat.gateway';
import { WebRTCSignalingServer } from './communication/infrastructure/services/webrtc-signaling.service';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Create a single Socket.IO instance
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize Chat Gateway with the shared Socket.IO instance
const chatGateway = new ChatGateway(io);

// Initialize WebRTC Signaling Server with the shared Socket.IO instance
const webrtcServer = new WebRTCSignalingServer(io);
console.log('Socket.IO server initialized');
console.log('Chat Gateway initialized');
console.log('WebRTC Signaling Server initialized');

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`WebRTC Signaling: ws://localhost:${PORT}`);
});
