import { Request, Response } from 'express';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

export class SharedFileController {
  // Obtener archivos compartidos de un canal
  getFiles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { channelId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
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

      // Get file messages
      const fileMessages = await prisma.message.findMany({
        where: {
          channelId,
          messageType: 'archivo',
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
        orderBy: { createdAt: 'desc' }
      });

      const mapped = fileMessages.map(m => {
        try {
          const fileData = JSON.parse(m.content);
          return {
            id: m.id,
            fileName: fileData.fileName,
            fileUrl: fileData.fileUrl,
            fileSize: fileData.fileSize,
            fileType: fileData.fileType,
            uploadedBy: m.user?.completeName || m.user?.email || 'Unknown',
            uploadedById: m.userId,
            createdAt: m.createdAt
          };
        } catch {
          return null;
        }
      }).filter(f => f !== null);

      res.status(200).json({ success: true, data: { files: mapped } });
    } catch (err) {
      console.error('[SharedFileController.getFiles] error', err);
      res.status(500).json({ success: false, message: 'Error fetching files' });
    }
  };

  // Subir archivo
  uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { channelId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
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

      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const file = req.file;
      const fileUrl = `/uploads/${file.filename}`;
      
      const fileData = {
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        fileType: file.mimetype
      };

      // Create message with file info
      const message = await prisma.message.create({
        data: {
          channelId,
          userId,
          content: JSON.stringify(fileData),
          messageType: 'archivo'
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

      res.status(201).json({
        success: true,
        data: {
          file: {
            id: message.id,
            fileName: fileData.fileName,
            fileUrl: fileData.fileUrl,
            fileSize: fileData.fileSize,
            fileType: fileData.fileType,
            uploadedBy: message.user?.completeName || message.user?.email,
            uploadedById: message.userId,
            createdAt: message.createdAt
          }
        }
      });
    } catch (err) {
      console.error('[SharedFileController.uploadFile] error', err);
      res.status(500).json({ success: false, message: 'Error uploading file' });
    }
  };

  // Eliminar archivo
  deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fileId } = req.params;
      const userId = req.user?.userId;
      const { deleteForEveryone } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const message = await prisma.message.findUnique({
        where: { id: fileId }
      });

      if (!message || message.messageType !== 'archivo') {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
      }

      // Only uploader can delete
      if (message.userId !== userId) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      try {
        const fileData = JSON.parse(message.content);
        const filePath = path.join(process.cwd(), 'uploads', path.basename(fileData.fileUrl));

        if (deleteForEveryone) {
          // Delete file from disk
          if (fs.existsSync(filePath)) {
            await unlinkAsync(filePath);
          }

          // Soft delete message
          await prisma.message.update({
            where: { id: fileId },
            data: { deletedAt: new Date() }
          });
        } else {
          // For "delete for me", just soft delete (in production, use separate table)
          await prisma.message.update({
            where: { id: fileId },
            data: { deletedAt: new Date() }
          });
        }
      } catch (parseErr) {
        console.error('Error parsing file data', parseErr);
      }

      res.status(200).json({ success: true, data: { deleted: true } });
    } catch (err) {
      console.error('[SharedFileController.deleteFile] error', err);
      res.status(500).json({ success: false, message: 'Error deleting file' });
    }
  };
}
