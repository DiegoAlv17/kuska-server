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

// Crear equipos: cualquier usuario autenticado puede crear equipos
router.post('/', teamController.createTeam);

// Actualizar equipos: el líder del equipo puede actualizar
router.put('/:id', teamController.updateTeam);
router.patch('/:id', teamController.updateTeam);

// Solo ADMIN puede eliminar equipos
router.delete('/:id', requireRole('ADMIN'), teamController.deleteTeam);

export default router;
