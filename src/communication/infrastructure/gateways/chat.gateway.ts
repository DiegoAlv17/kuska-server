import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { MessagePrismaRepository } from '../repositories/message-prisma.repository';

export class ChatGateway {
  private io: Server;
  private messageRepo = new MessagePrismaRepository();

  constructor(server: HttpServer) {
    this.io = new Server(server, { cors: { origin: '*' } });
    this.configure();
  }

  private configure() {
    this.io.on('connection', (socket: Socket) => {
      console.log('socket connected', socket.id);

      socket.on('join_conversation', ({ conversationId }) => {
        socket.join(`conversation:${conversationId}`);
      });

      socket.on('send_message', async (payload, ack) => {
        // Persist message
        const saved = await this.messageRepo.create({
          channelId: payload.conversationId,
          userId: payload.userId,
          content: payload.content,
        });
        // Emit to room
        this.io.to(`conversation:${payload.conversationId}`).emit('new_message', saved);
        if (typeof ack === 'function') ack({ ok: true, id: saved.id });
      });
    });
  }
}

export default ChatGateway;
