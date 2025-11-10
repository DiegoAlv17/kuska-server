import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { UserNotFoundException } from '../../../auth/domain/exceptions/UserNotFoundException';
import { InvalidCredentialsException } from '../../../auth/domain/exceptions/InvalidCredentialsException';
import { UserAlreadyExistsException } from '../../../auth/domain/exceptions/UserAlreadyExistsException';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Errores de validación con Zod
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }

  // Errores de dominio - Usuario no encontrado
  if (error instanceof UserNotFoundException) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Errores de dominio - Credenciales inválidas
  if (error instanceof InvalidCredentialsException) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Errores de dominio - Usuario ya existe
  if (error instanceof UserAlreadyExistsException) {
    res.status(409).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Errores de validación de value objects
  if (error.message.includes('Email') || error.message.includes('Password')) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Usuario desactivado
  if (error.message.includes('deactivated')) {
    res.status(403).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
