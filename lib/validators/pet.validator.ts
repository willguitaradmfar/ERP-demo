/*
 * Pet Validators
 *
 * Funções de validação para os dados de Pet.
 * Implementa as regras de negócio definidas nos requisitos.
 */

import { CreatePetDto } from '../types/pet';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Valida os dados para criação de um Pet
 *
 * Regras:
 * - RN01: Nome é obrigatório
 * - Espécie é obrigatória
 * - Raça é opcional
 */
export function validateCreatePet(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Verifica se é um objeto
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Request body deve ser um objeto JSON válido' }],
    };
  }

  const petData = data as Record<string, unknown>;

  // RN01: Validação do campo nome (obrigatório)
  if (!petData.nome || typeof petData.nome !== 'string' || petData.nome.trim() === '') {
    errors.push({
      field: 'nome',
      message: 'O campo nome é obrigatório e deve ser uma string não vazia',
    });
  }

  // Validação do campo especie (obrigatório)
  if (!petData.especie || typeof petData.especie !== 'string' || petData.especie.trim() === '') {
    errors.push({
      field: 'especie',
      message: 'O campo especie é obrigatório e deve ser uma string não vazia',
    });
  }

  // Validação do campo raca (opcional)
  if (petData.raca !== undefined && petData.raca !== null) {
    if (typeof petData.raca !== 'string') {
      errors.push({
        field: 'raca',
        message: 'O campo raca deve ser uma string',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Type guard para CreatePetDto
 */
export function isCreatePetDto(data: unknown): data is CreatePetDto {
  const result = validateCreatePet(data);
  return result.isValid;
}
