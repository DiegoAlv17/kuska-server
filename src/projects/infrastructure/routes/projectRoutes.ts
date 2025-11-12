import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';

const router = Router();
const projectController = new ProjectController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ✅ NUEVA RUTA: Crear proyecto desde template
router.post('/from-template/:templateId', projectController.createFromTemplate);

// Rutas de proyectos
router.get('/', projectController.listProjects); // Listar proyectos del usuario
router.post('/', projectController.createProject); // Crear proyecto (cualquier usuario autenticado)
router.get('/:projectId', projectController.getProject); // Obtener proyecto (solo miembros)
router.patch('/:projectId', projectController.updateProject); // Actualizar proyecto (solo admins)
router.delete('/:projectId', projectController.deleteProject); // Eliminar proyecto (solo admins)

// Rutas de miembros
router.get('/:projectId/members', projectController.getProjectMembers); // Obtener miembros del proyecto
router.post('/:projectId/members', projectController.addMember); // Agregar miembro (solo admins)
router.patch('/:projectId/members/:memberId', projectController.updateMemberRole); // Cambiar rol (solo admins)
router.delete('/:projectId/members/:memberId', projectController.removeMember); // Remover miembro (solo admins)

export default router;
