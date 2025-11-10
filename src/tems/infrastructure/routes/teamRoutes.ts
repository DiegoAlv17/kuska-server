import { Router } from 'express';
import { TeamController } from '../controllers/TeamController';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';
import { requireRole } from '../../../auth/infrastructure/middlewares/requireRole';

const router = Router();
const teamController = new TeamController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de equipos
router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeamById);

// Solo ADMIN y PROJECT_MANAGER pueden crear equipos
router.post('/', requireRole('ADMIN', 'PROJECT_MANAGER'), teamController.createTeam);

// Solo ADMIN y PROJECT_MANAGER pueden actualizar equipos
router.put('/:id', requireRole('ADMIN', 'PROJECT_MANAGER'), teamController.updateTeam);
router.patch('/:id', requireRole('ADMIN', 'PROJECT_MANAGER'), teamController.updateTeam);

// Solo ADMIN puede eliminar equipos
router.delete('/:id', requireRole('ADMIN'), teamController.deleteTeam);

export default router;
