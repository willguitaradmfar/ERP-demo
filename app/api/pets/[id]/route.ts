/*
 * API Route: /api/pets/[id]
 *
 * Endpoint:
 * - GET /api/pets/:id - Buscar pet por ID (RF02)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PetResponse } from '@/lib/types/pet';

/**
 * GET /api/pets/:id
 *
 * Retorna um pet específico pelo ID
 *
 * Critérios de Aceite:
 * - CA03: Retorna o pet correto
 * - CA04: Retorna 404 se pet não existe
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validar se o ID é um número válido
    const petId = parseInt(id, 10);
    if (isNaN(petId) || petId <= 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'ID inválido. O ID deve ser um número inteiro positivo',
        },
        { status: 400 }
      );
    }

    // Buscar pet no banco de dados
    const pet = await prisma.pet.findUnique({
      where: {
        id: petId,
      },
    });

    // CA04: Retornar 404 se pet não existe
    if (!pet) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: `Pet com ID ${petId} não encontrado`,
        },
        { status: 404 }
      );
    }

    // CA03: Retornar o pet correto
    const response: PetResponse = {
      id: pet.id,
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      createdAt: pet.createdAt.toISOString(),
      updatedAt: pet.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar pet:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Erro ao buscar pet',
      },
      { status: 500 }
    );
  }
}
