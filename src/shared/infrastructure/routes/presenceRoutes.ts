import { Router } from 'express';
import { PresenceController } from '../controllers/PresenceController';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';

const router = Router();
const presenceController = new PresenceController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Actualizar presencia del usuario actual
router.post('/update', presenceController.updatePresence);

// Obtener presencia de usuarios (query param: userIds=id1,id2,id3)
router.get('/', presenceController.getPresence);

// Heartbeat para mantener activo el estado
router.post('/heartbeat', presenceController.heartbeat);

export default router;
