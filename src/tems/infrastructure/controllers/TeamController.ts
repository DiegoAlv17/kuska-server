import { Request, Response } from 'express';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';

export class TeamController {
  // Placeholder: Listar equipos
  getTeams = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      // Return teams where the user is leader or a member
      const teams = await prisma.team.findMany({
        where: {
          OR: [
            { leaderId: userId },
            { members: { some: { userId } } }
          ]
        },
        include: {
          members: { include: { user: { select: { id: true, completeName: true, email: true, avatar: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const mapped = teams.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        links: t.links ? JSON.parse(t.links) : [],
        leaderId: t.leaderId,
        membersCount: t.members?.length || 0,
        createdAt: t.createdAt,
        members: t.members?.map(m => ({ id: m.user.id, name: m.user.completeName || m.user.email, role: m.role, avatar: m.user.avatar })) || []
      }));

      res.status(200).json({ success: true, data: { teams: mapped } });
    } catch (err) {
      console.error('[TeamController.getTeams] error', err);
      res.status(500).json({ success: false, message: 'Error fetching teams' });
    }
  };

  // Obtener un equipo por ID
  getTeamById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          members: { 
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
          leader: {
            select: {
              id: true,
              completeName: true,
              email: true
            }
          }
        }
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found' });
        return;
      }

      // Check if user is member or leader
      const isMember = team.members?.some(m => m.userId === userId);
      const isLeader = team.leaderId === userId;

      if (!isMember && !isLeader) {
        res.status(403).json({ success: false, message: 'Not authorized to view this team' });
        return;
      }

      // Get presence for all members
      const memberIds = team.members?.map(m => m.userId) || [];
      const presences = await prisma.presence.findMany({
        where: { userId: { in: memberIds } }
      });

      // Check for stale presences (more than 5 minutes = offline)
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const presenceMap = new Map<string, string>();
      presences.forEach(p => {
        const isActive = new Date(p.lastActivity) >= fiveMinutesAgo;
        presenceMap.set(p.userId, isActive ? p.status : 'desconectado');
      });

      const mapped = {
        id: team.id,
        name: team.name,
        description: team.description || '',
        links: team.links ? JSON.parse(team.links) : [],
        leaderId: team.leaderId,
        leaderName: team.leader?.completeName || team.leader?.email || 'Unknown',
        membersCount: team.members?.length || 0,
        createdAt: team.createdAt,
        members: team.members?.map(m => ({ 
          id: m.user.id, 
          name: m.user.completeName || m.user.email, 
          role: m.role, 
          avatar: m.user.avatar,
          status: presenceMap.get(m.user.id) || 'desconectado'
        })) || []
      };

      res.status(200).json({ success: true, data: { team: mapped } });
    } catch (err) {
      console.error('[TeamController.getTeamById] error', err);
      res.status(500).json({ success: false, message: 'Error fetching team' });
    }
  };

  // Placeholder: Crear equipo
  createTeam = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { name, description, links, members } = req.body as { name: string; description?: string; links?: string[]; members?: Array<{ userId: string; role: string }> };

      if (!name || name.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Team name is required' });
        return;
      }

      const memberIds = (members || []).map(m => m.userId).filter(Boolean);

      // Ensure all provided memberIds are friends of the creator
      if (memberIds.length > 0) {
        const friendships = await prisma.friendship.findMany({ where: { userId: userId, friendId: { in: memberIds } } });
        const allowedIds = friendships.map(f => f.friendId);
        const notFriends = memberIds.filter(id => !allowedIds.includes(id));
        if (notFriends.length > 0) {
          res.status(400).json({ success: false, message: 'Some members are not your friends', notFriends });
          return;
        }
      }

      // Create team and members in a transaction
      const created = await prisma.$transaction(async (tx) => {
        const team = await tx.team.create({ data: { name: name.trim(), description: description || '', links: links && links.length > 0 ? JSON.stringify(links) : null, leaderId: userId } });

        // Ensure creator is added as Administrador if not included
        const membersToCreate: Array<{ userId: string; role: string; }> = [];
        // add provided members
        for (const m of (members || [])) {
          // avoid adding creator twice
          if (m.userId === userId) continue;
          membersToCreate.push({ userId: m.userId, role: m.role || 'Colaborador' });
        }
        // add creator as Administrador
        membersToCreate.push({ userId, role: 'Administrador' });

        for (const m of membersToCreate) {
          await tx.teamMember.create({ data: { teamId: team.id, userId: m.userId, role: m.role } });
        }

        // Create default channel for team
        const channel = await tx.channel.create({
          data: {
            name: `Chat de ${team.name}`,
            description: `Canal principal del equipo ${team.name}`,
            type: 'equipo',
            teamId: team.id,
            createdById: userId,
            isPrivate: false
          }
        });

        // Add all team members to the channel
        for (const m of membersToCreate) {
          await tx.channelMember.create({
            data: {
              channelId: channel.id,
              userId: m.userId,
              role: m.role === 'Administrador' ? 'admin' : 'miembro'
            }
          });
        }

        return team;
      });

      res.status(201).json({ success: true, data: { team: created } });
    } catch (err) {
      console.error('[TeamController.createTeam] error', err);
      res.status(500).json({ success: false, message: 'Error creating team' });
    }
  };

  // Actualizar equipo
  updateTeam = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { name, description, links } = req.body as { name?: string; description?: string; links?: string[] };

      // Check if user is leader
      const team = await prisma.team.findUnique({ where: { id } });
      
      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found' });
        return;
      }

      if (team.leaderId !== userId) {
        res.status(403).json({ success: false, message: 'Only team leader can update team' });
        return;
      }

      const updated = await prisma.team.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(description !== undefined && { description }),
          ...(links !== undefined && { links: links.length > 0 ? JSON.stringify(links) : null })
        }
      });

      res.status(200).json({ success: true, data: { team: updated } });
    } catch (err) {
      console.error('[TeamController.updateTeam] error', err);
      res.status(500).json({ success: false, message: 'Error updating team' });
    }
  };

  // Placeholder: Eliminar equipo
  deleteTeam = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    res.status(200).json({
      success: true,
      message: `Delete team ${id} - Coming soon`,
      data: {
        teamId: id,
        user: req.user,
      },
    });
  };
}
