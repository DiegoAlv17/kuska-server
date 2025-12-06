import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';
import { requireRole } from '../../../auth/infrastructure/middlewares/requireRole';

const router = Router();
const taskController = new TaskController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de tareas
router.get('/', taskController.getTasks);
router.get('/calendar', taskController.getCalendarTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id', taskController.updateTask);

// Solo ADMIN y PROJECT_MANAGER pueden eliminar tareas
router.delete('/:id', requireRole('ADMIN', 'PROJECT_MANAGER'), taskController.deleteTask);

export default router;
