import { Request, Response, NextFunction } from 'express';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { prisma } from '../persistence/PrismaClient';

const userRepository = new PrismaUserRepository();

export const requireRole = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Obtener roles del usuario desde la base de datos
      const userRoles = await prisma.userRole.findMany({
        where: { userId: req.user.userId },
        include: { role: true },
      });

      // Extraer nombres de roles
      const userRoleNames = userRoles.map((ur) => ur.role.name);

      // Verificar si el usuario tiene al menos uno de los roles permitidos
      const hasRequiredRole = allowedRoles.some((role) => userRoleNames.includes(role));

      if (!hasRequiredRole) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          requiredRoles: allowedRoles,
          userRoles: userRoleNames,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking user permissions',
      });
    }
  };
};
