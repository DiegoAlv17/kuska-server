import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../services/JwtTokenService';

const tokenService = new JwtTokenService();

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'No authorization header provided',
      });
      return;
    }

    // Verificar formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Use: Bearer <token>',
      });
      return;
    }

    const token = parts[1];

    // Verificar token
    const payload = tokenService.verifyAccessToken(token);

    // Agregar usuario a request
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        res.status(401).json({
          success: false,
          message: 'Token has expired',
        });
        return;
      }
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
