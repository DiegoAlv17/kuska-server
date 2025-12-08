import { Request, Response } from 'express';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';

export class MessageController {
  // Obtener mensajes de un canal
  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { channelId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      // Verify user is member of the channel
      const membership = await prisma.channelMember.findFirst({
        where: { channelId, userId }
      });

      if (!membership) {
        res.status(403).json({ success: false, message: 'Not a member of this channel' });
        return;
      }

      const messages = await prisma.message.findMany({
        where: { 
          channelId,
          deletedAt: null
        },
        include: {
          user: {
            select: {
              id: true,
              completeName: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 100
      });

      const mapped = messages.map(m => ({
        id: m.id,
        content: m.content,
        messageType: m.messageType,
        userId: m.userId,
        userName: m.user?.completeName || m.user?.email || 'Unknown',
        userAvatar: m.user?.avatar,
        createdAt: m.createdAt,
        isEdited: m.isEdited,
        editedAt: m.editedAt
      }));

      res.status(200).json({ success: true, data: { messages: mapped } });
    } catch (err) {
      console.error('[MessageController.getMessages] error', err);
      res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
  };

  // Enviar mensaje (también manejado por WebSocket pero este es REST fallback)
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { channelId } = req.params;
      const userId = req.user?.userId;
      const { content, messageType = 'texto' } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      if (!content || typeof content !== 'string') {
        res.status(400).json({ success: false, message: 'Content required' });
        return;
      }

      // Verify membership
      const membership = await prisma.channelMember.findFirst({
        where: { channelId, userId }
      });

      if (!membership) {
        res.status(403).json({ success: false, message: 'Not a member of this channel' });
        return;
      }

      const message = await prisma.message.create({
        data: {
          channelId,
          userId,
          content,
          messageType
        },
        include: {
          user: {
            select: {
              id: true,
              completeName: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      const mapped = {
        id: message.id,
        content: message.content,
        messageType: message.messageType,
        userId: message.userId,
        userName: message.user?.completeName || message.user?.email || 'Unknown',
        userAvatar: message.user?.avatar,
        createdAt: message.createdAt
      };

      res.status(201).json({ success: true, data: { message: mapped } });
    } catch (err) {
      console.error('[MessageController.sendMessage] error', err);
      res.status(500).json({ success: false, message: 'Error sending message' });
    }
  };

  // Editar mensaje
  updateMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;
      const userId = req.user?.userId;
      const { content } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      if (!content || typeof content !== 'string') {
        res.status(400).json({ success: false, message: 'Content required' });
        return;
      }

      const message = await prisma.message.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        res.status(404).json({ success: false, message: 'Message not found' });
        return;
      }

      // Only message sender can edit
      if (message.userId !== userId) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      const updated = await prisma.message.update({
        where: { id: messageId },
        data: {
          content,
          isEdited: true,
          editedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              completeName: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      const mapped = {
        id: updated.id,
        content: updated.content,
        messageType: updated.messageType,
        userId: updated.userId,
        userName: updated.user?.completeName || updated.user?.email || 'Unknown',
        userAvatar: updated.user?.avatar,
        createdAt: updated.createdAt,
        isEdited: updated.isEdited,
        editedAt: updated.editedAt
      };

      res.status(200).json({ success: true, data: { message: mapped } });
    } catch (err) {
      console.error('[MessageController.updateMessage] error', err);
      res.status(500).json({ success: false, message: 'Error updating message' });
    }
  };

  // Eliminar mensaje
  deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;
      const userId = req.user?.userId;
      const { deleteForEveryone } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const message = await prisma.message.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        res.status(404).json({ success: false, message: 'Message not found' });
        return;
      }

      // Only message sender can delete
      if (message.userId !== userId) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      if (deleteForEveryone) {
        // Soft delete for everyone
        await prisma.message.update({
          where: { id: messageId },
          data: { deletedAt: new Date() }
        });
      } else {
        // For "delete for me", we'd need a separate table, for now just soft delete
        await prisma.message.update({
          where: { id: messageId },
          data: { deletedAt: new Date() }
        });
      }

      res.status(200).json({ success: true, data: { deleted: true } });
    } catch (err) {
      console.error('[MessageController.deleteMessage] error', err);
      res.status(500).json({ success: false, message: 'Error deleting message' });
    }
  };
}
