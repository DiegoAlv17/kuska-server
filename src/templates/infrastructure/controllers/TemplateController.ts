// src/templates/infrastructure/controllers/TemplateController.ts

import { Request, Response, NextFunction } from 'express';
import { CreateTemplateSchema } from '../../application/dtos/CreateTemplateDto';
import { UpdateTemplateSchema } from '../../application/dtos/UpdateTemplateDto';
import { CreateTemplateUseCase } from '../../application/use-cases/CreateTemplateUseCase';
import { GetTemplateUseCase } from '../../application/use-cases/GetTemplateUseCase';
import { ListTemplatesUseCase } from '../../application/use-cases/ListTemplatesUseCase';
import { UpdateTemplateUseCase } from '../../application/use-cases/UpdateTemplateUseCase';
import { DeleteTemplateUseCase } from '../../application/use-cases/DeleteTemplateUseCase';
import { IncrementTemplateUsageUseCase } from '../../application/use-cases/IncrementTemplateUsageUseCase'; // ✅ NUEVO
import { PrismaTemplateRepository } from '../repositories/PrismaTemplateRepository';

export class TemplateController {
  private createTemplateUseCase: CreateTemplateUseCase;
  private getTemplateUseCase: GetTemplateUseCase;
  private listTemplatesUseCase: ListTemplatesUseCase;
  private updateTemplateUseCase: UpdateTemplateUseCase;
  private deleteTemplateUseCase: DeleteTemplateUseCase;
  private incrementTemplateUsageUseCase: IncrementTemplateUsageUseCase; // ✅ NUEVO

  constructor() {
    const templateRepository = new PrismaTemplateRepository();

    this.createTemplateUseCase = new CreateTemplateUseCase(templateRepository);
    this.getTemplateUseCase = new GetTemplateUseCase(templateRepository);
    this.listTemplatesUseCase = new ListTemplatesUseCase(templateRepository);
    this.updateTemplateUseCase = new UpdateTemplateUseCase(templateRepository);
    this.deleteTemplateUseCase = new DeleteTemplateUseCase(templateRepository);
    this.incrementTemplateUsageUseCase = new IncrementTemplateUsageUseCase(templateRepository); // ✅ NUEVO
  }

  createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const validatedData = CreateTemplateSchema.parse(req.body);
      const result = await this.createTemplateUseCase.execute(validatedData, req.user.userId);

      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { templateId } = req.params;
      const result = await this.getTemplateUseCase.execute(templateId, req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Query param: includePublic (default true)
      const includePublic = req.query.includePublic !== 'false';

      const result = await this.listTemplatesUseCase.execute(req.user.userId, includePublic);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { templateId } = req.params;
      const validatedData = UpdateTemplateSchema.parse(req.body);

      const result = await this.updateTemplateUseCase.execute(
        templateId,
        validatedData,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: 'Template updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { templateId } = req.params;
      await this.deleteTemplateUseCase.execute(templateId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ NUEVO MÉTODO: Incrementar uso de template
  incrementTemplateUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { templateId } = req.params;
      
      await this.incrementTemplateUsageUseCase.execute(templateId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Template usage incremented successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}