import { Request, Response } from 'express';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';

export class CallRoomController {
  // Crear una sala de llamada
  createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { teamId, name } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      if (!teamId) {
        res.status(400).json({ success: false, message: 'Team ID is required' });
        return;
      }

      // Verify user is member of the team
      const membership = await prisma.teamMember.findFirst({
        where: { teamId, userId }
      });

      if (!membership) {
        res.status(403).json({ success: false, message: 'Not a member of this team' });
        return;
      }

      // Check if there's already an active room for this team
      const existingRoom = await prisma.callRoom.findFirst({
        where: {
          teamId,
          isActive: true
        }
      });

      if (existingRoom) {
        res.status(200).json({ 
          success: true, 
          data: { room: existingRoom, message: 'Active room already exists' }
        });
        return;
      }

      // Create new room
      const room = await prisma.callRoom.create({
        data: {
          teamId,
          createdBy: userId,
          name: name || 'Llamada de equipo',
          isActive: true
        }
      });

      // Add creator as first participant
      await prisma.callParticipant.create({
        data: {
          roomId: room.id,
          userId
        }
      });

      res.status(201).json({ success: true, data: { room } });
    } catch (err) {
      console.error('[CallRoomController.createRoom] error', err);
      res.status(500).json({ success: false, message: 'Error creating call room' });
    }
  };

  // Obtener sala activa de un equipo
  getActiveRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { teamId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const room = await prisma.callRoom.findFirst({
        where: {
          teamId,
          isActive: true
        },
        include: {
          participants: {
            where: {
              leftAt: null
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
          },
          creator: {
            select: {
              id: true,
              completeName: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      res.status(200).json({ success: true, data: { room } });
    } catch (err) {
      console.error('[CallRoomController.getActiveRoom] error', err);
      res.status(500).json({ success: false, message: 'Error fetching call room' });
    }
  };

  // Unirse a una sala
  joinRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { roomId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const room = await prisma.callRoom.findUnique({
        where: { id: roomId }
      });

      if (!room || !room.isActive) {
        res.status(404).json({ success: false, message: 'Room not found or inactive' });
        return;
      }

      // Verify user is member of the team
      const membership = await prisma.teamMember.findFirst({
        where: { teamId: room.teamId, userId }
      });

      if (!membership) {
        res.status(403).json({ success: false, message: 'Not a member of this team' });
        return;
      }

      // Check if already in room
      const existingParticipant = await prisma.callParticipant.findFirst({
        where: {
          roomId,
          userId,
          leftAt: null
        }
      });

      if (existingParticipant) {
        res.status(200).json({ 
          success: true, 
          data: { participant: existingParticipant, message: 'Already in room' }
        });
        return;
      }

      // Add as participant
      const participant = await prisma.callParticipant.create({
        data: {
          roomId,
          userId
        }
      });

      res.status(200).json({ success: true, data: { participant } });
    } catch (err) {
      console.error('[CallRoomController.joinRoom] error', err);
      res.status(500).json({ success: false, message: 'Error joining call room' });
    }
  };

  // Salir de una sala
  leaveRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { roomId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const participant = await prisma.callParticipant.findFirst({
        where: {
          roomId,
          userId,
          leftAt: null
        }
      });

      if (!participant) {
        res.status(404).json({ success: false, message: 'Not in this room' });
        return;
      }

      // Mark as left
      await prisma.callParticipant.update({
        where: { id: participant.id },
        data: { leftAt: new Date() }
      });

      // Check if room is empty, if so mark as inactive
      const activeParticipants = await prisma.callParticipant.count({
        where: {
          roomId,
          leftAt: null
        }
      });

      if (activeParticipants === 0) {
        await prisma.callRoom.update({
          where: { id: roomId },
          data: {
            isActive: false,
            endedAt: new Date()
          }
        });
      }

      res.status(200).json({ success: true, data: { left: true } });
    } catch (err) {
      console.error('[CallRoomController.leaveRoom] error', err);
      res.status(500).json({ success: false, message: 'Error leaving call room' });
    }
  };

  // Actualizar estado de audio/video
  updateParticipantState = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { roomId } = req.params;
      const { isMuted, isVideoOff } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const participant = await prisma.callParticipant.findFirst({
        where: {
          roomId,
          userId,
          leftAt: null
        }
      });

      if (!participant) {
        res.status(404).json({ success: false, message: 'Not in this room' });
        return;
      }

      const updated = await prisma.callParticipant.update({
        where: { id: participant.id },
        data: {
          ...(typeof isMuted === 'boolean' && { isMuted }),
          ...(typeof isVideoOff === 'boolean' && { isVideoOff })
        }
      });

      res.status(200).json({ success: true, data: { participant: updated } });
    } catch (err) {
      console.error('[CallRoomController.updateParticipantState] error', err);
      res.status(500).json({ success: false, message: 'Error updating participant state' });
    }
  };
}
