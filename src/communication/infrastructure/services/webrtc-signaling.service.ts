import { Server as HttpServer } from 'http';
import { Server, Socket, Namespace } from 'socket.io';
import jwt from 'jsonwebtoken';

interface UserSocket extends Socket {
  userId?: string;
  roomId?: string;
}

interface SignalData {
  roomId: string;
  signal: any; // RTCSessionDescription or RTCIceCandidate
  targetUserId?: string;
}

export class WebRTCSignalingServer {
  private io: Namespace;
  private userSockets: Map<string, UserSocket> = new Map();

  constructor(io: Server) {
    // Use the shared Socket.IO instance with a namespace
    this.io = io.of('/webrtc');
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket: UserSocket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.error('[WebRTC] No token provided');
        return next(new Error('Authentication error: No token'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
        socket.userId = decoded.userId;
        console.log(`[WebRTC] User authenticated: ${socket.userId}`);
        next();
      } catch (err) {
        console.error('[WebRTC] Token verification failed:', err);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: UserSocket) => {
      console.log(`[WebRTC] User connected: ${socket.userId}`);

      if (socket.userId) {
        this.userSockets.set(socket.userId, socket);
      }

      // Join a call room
      socket.on('join-room', ({ roomId }: { roomId: string }) => {
        socket.roomId = roomId;
        socket.join(roomId);
        console.log(`[WebRTC] User ${socket.userId} joined room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId: socket.userId,
          userName: socket.userId // You may want to fetch the actual user name
        });

        // Send list of existing participants
        const room = this.io.adapter.rooms.get(roomId);
        const roomSockets = room ? Array.from(room) : [];
        const participants = roomSockets
          .map(socketId => {
            const participantSocket = this.io.sockets.get(socketId) as UserSocket;
            return participantSocket?.userId;
          })
          .filter(id => id !== socket.userId);

        socket.emit('room-participants', { participants });
      });

      // WebRTC signaling: offer
      socket.on('offer', ({ roomId, signal, targetUserId }: SignalData) => {
        console.log(`[WebRTC] Offer from ${socket.userId} to ${targetUserId}`);
        
        const targetSocket = this.userSockets.get(targetUserId!);
        if (targetSocket) {
          targetSocket.emit('offer', {
            signal,
            userId: socket.userId
          });
        }
      });

      // WebRTC signaling: answer
      socket.on('answer', ({ roomId, signal, targetUserId }: SignalData) => {
        console.log(`[WebRTC] Answer from ${socket.userId} to ${targetUserId}`);
        
        const targetSocket = this.userSockets.get(targetUserId!);
        if (targetSocket) {
          targetSocket.emit('answer', {
            signal,
            userId: socket.userId
          });
        }
      });

      // WebRTC signaling: ICE candidate
      socket.on('ice-candidate', ({ roomId, signal, targetUserId }: SignalData) => {
        console.log(`[WebRTC] ICE candidate from ${socket.userId} to ${targetUserId}`);
        
        const targetSocket = this.userSockets.get(targetUserId!);
        if (targetSocket) {
          targetSocket.emit('ice-candidate', {
            signal,
            userId: socket.userId
          });
        }
      });

      // Toggle audio/video state
      socket.on('toggle-audio', ({ roomId, isMuted }: { roomId: string; isMuted: boolean }) => {
        socket.to(roomId).emit('user-audio-changed', {
          userId: socket.userId,
          isMuted
        });
      });

      socket.on('toggle-video', ({ roomId, isVideoOff }: { roomId: string; isVideoOff: boolean }) => {
        socket.to(roomId).emit('user-video-changed', {
          userId: socket.userId,
          isVideoOff
        });
      });

      // Leave room
      socket.on('leave-room', ({ roomId }: { roomId: string }) => {
        console.log(`[WebRTC] User ${socket.userId} leaving room ${roomId}`);
        
        socket.leave(roomId);
        socket.to(roomId).emit('user-left', {
          userId: socket.userId
        });
        
        socket.roomId = undefined;
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`[WebRTC] User disconnected: ${socket.userId}`);
        
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }

        if (socket.roomId) {
          socket.to(socket.roomId).emit('user-left', {
            userId: socket.userId
          });
        }
      });
    });
  }

  public getIO(): Namespace {
    return this.io;
  }
}
