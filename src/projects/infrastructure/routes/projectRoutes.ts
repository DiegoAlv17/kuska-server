import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';
import { requireRole } from '../../../auth/infrastructure/middlewares/requireRole';

const router = Router();
const projectController = new ProjectController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de proyectos
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

// Solo usuarios con rol ADMIN o PROJECT_MANAGER pueden crear proyectos
router.post('/', requireRole('ADMIN', 'PROJECT_MANAGER'), projectController.createProject);

// Solo usuarios con rol ADMIN o PROJECT_MANAGER pueden actualizar
router.put('/:id', requireRole('ADMIN', 'PROJECT_MANAGER'), projectController.updateProject);
router.patch('/:id', requireRole('ADMIN', 'PROJECT_MANAGER'), projectController.updateProject);

// Solo ADMIN puede eliminar proyectos
router.delete('/:id', requireRole('ADMIN'), projectController.deleteProject);

export default router;
