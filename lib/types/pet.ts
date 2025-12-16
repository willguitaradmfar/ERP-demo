/*
 * Pet Types and Interfaces
 *
 * Define os tipos TypeScript para a entidade Pet,
 * incluindo DTOs para criação e validação de dados.
 */

// Type derivado do modelo Prisma
export interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para criação de um novo Pet
export interface CreatePetDto {
  nome: string;
  especie: string;
  raca?: string;
}

// DTO para resposta da API
export interface PetResponse {
  id: number;
  nome: string;
  especie: string;
  raca: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tipo para erros da API
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
