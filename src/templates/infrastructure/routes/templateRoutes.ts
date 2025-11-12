// src/templates/infrastructure/routes/templateRoutes.ts

import { Router } from 'express';
import { TemplateController } from '../controllers/TemplateController';
import { authMiddleware } from '../../../auth/infrastructure/middlewares/authMiddleware';

const router = Router();
const templateController = new TemplateController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de templates
router.get('/', templateController.listTemplates);          // Listar templates (propios + públicos)
router.post('/', templateController.createTemplate);        // Crear template
router.get('/:templateId', templateController.getTemplate); // Obtener template específico
router.patch('/:templateId', templateController.updateTemplate); // Actualizar template (solo creador)
router.delete('/:templateId', templateController.deleteTemplate); // Eliminar template (solo creador)

export default router;