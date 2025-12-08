import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { MessagePrismaRepository } from '../repositories/message-prisma.repository';
import { JwtTokenService } from '../../../auth/infrastructure/services/JwtTokenService';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';

export class ChatGateway {
  private io: Server;
  private messageRepo = new MessagePrismaRepository();
  private tokenService = new JwtTokenService();

  constructor(server: HttpServer) {
    this.io = new Server(server, { cors: { origin: '*' } });
    this.configure();
  }

  private configure() {
    // JWT validation middleware
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token as string | undefined;
        if (!token) return next(new Error('Authentication error: token required'));
        const payload = this.tokenService.verifyAccessToken(token);
        // attach user info to socket
        (socket as any).data = { userId: payload.userId, email: payload.email };
        return next();
      } catch (err: any) {
        return next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', async (socket: Socket) => {
      console.log('socket connected', socket.id, (socket as any).data?.userId);

      const userId = (socket as any).data?.userId;
      if (userId) {
        // mark presence as online
        await prisma.presence.upsert({
          where: { userId },
          update: {
            status: 'en_linea',
            isTyping: false,
            lastActivity: new Date(),
            updatedAt: new Date(),
          },
          create: {
            userId,
            channelId: null,
            status: 'en_linea',
            isTyping: false,
            lastActivity: new Date(),
            updatedAt: new Date(),
          }
        });
        // emit presence to any rooms the user is currently in (notify others)
        // we don't yet know rooms server-side here, but we can broadcast a general presence event
        this.io.emit('presence_update', { userId, status: 'en_linea', channelId: null });
      }

      socket.on('join_conversation', ({ conversationId }) => {
        socket.join(`conversation:${conversationId}`);
        // update presence channel
        const userId = (socket as any).data?.userId;
        if (userId) {
          prisma.presence.updateMany({ where: { userId }, data: { channelId: conversationId, lastActivity: new Date(), updatedAt: new Date() } }).catch(() => {});
          // notify other members in the conversation that this user is now present in the channel
          this.io.to(`conversation:${conversationId}`).emit('presence_update', { userId, status: 'en_linea', channelId: conversationId });
        }
      });

      socket.on('send_message', async (payload, ack) => {
        // Persist message
        const userId = (socket as any).data?.userId || payload.userId;
        const saved = await this.messageRepo.create({
          channelId: payload.conversationId,
          userId,
          content: payload.content,
        });
        // Emit to room
        this.io.to(`conversation:${payload.conversationId}`).emit('new_message', saved);
        if (typeof ack === 'function') ack({ ok: true, id: saved.id });
      });

      socket.on('leave_conversation', ({ conversationId }) => {
        socket.leave(`conversation:${conversationId}`);
        const userId = (socket as any).data?.userId;
        if (userId) {
          prisma.presence.updateMany({ where: { userId }, data: { channelId: null, lastActivity: new Date(), updatedAt: new Date() } }).catch(() => {});
          // notify room members that user left
          this.io.to(`conversation:${conversationId}`).emit('presence_update', { userId, status: 'ausente', channelId: null });
        }
      });

      socket.on('disconnect', async () => {
        const userId = (socket as any).data?.userId;
        if (userId) {
          await prisma.presence.updateMany({ where: { userId }, data: { status: 'desconectado', channelId: null, isTyping: false, lastActivity: new Date(), updatedAt: new Date() } }).catch(() => {});
          // notify all that this user disconnected
          this.io.emit('presence_update', { userId, status: 'desconectado', channelId: null });
        }
      });
    });
  }
}

export default ChatGateway;
