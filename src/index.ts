import 'dotenv/config';
import http from 'http';
import app from './server';
import ChatGateway from './communication/infrastructure/gateways/chat.gateway';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Chat Gateway (Socket.IO)
const chatGateway = new ChatGateway(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
});


