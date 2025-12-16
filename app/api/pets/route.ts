/*
 * API Route: /api/pets
 *
 * Endpoints:
 * - POST /api/pets - Criar um novo pet (RF01)
 * - GET /api/pets - Listar todos os pets (RF03)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateCreatePet } from '@/lib/validators/pet.validator';
import { CreatePetDto, PetResponse } from '@/lib/types/pet';

/**
 * POST /api/pets
 *
 * Cria um novo pet no sistema
 *
 * Critérios de Aceite:
 * - CA01: Cria um novo pet com sucesso
 * - CA02: Retorna erro 400 se nome não informado
 */
export async function POST(request: NextRequest) {
  try {
    // Parse do corpo da requisição
    const body = await request.json();

    // Validação dos dados
    const validation = validateCreatePet(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Dados inválidos',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const petData = body as CreatePetDto;

    // Criar pet no banco de dados
    const pet = await prisma.pet.create({
      data: {
        nome: petData.nome.trim(),
        especie: petData.especie.trim(),
        raca: petData.raca?.trim() || null,
      },
    });

    // Formatar resposta
    const response: PetResponse = {
      id: pet.id,
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      createdAt: pet.createdAt.toISOString(),
      updatedAt: pet.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pet:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Erro ao criar pet',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pets
 *
 * Lista todos os pets cadastrados
 *
 * Critérios de Aceite:
 * - CA05: Retorna lista de todos os pets
 * - CA06: Retorna array vazio se não houver pets
 */
export async function GET() {
  try {
    // Buscar todos os pets
    const pets = await prisma.pet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formatar resposta
    const response: PetResponse[] = pets.map((pet) => ({
      id: pet.id,
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      createdAt: pet.createdAt.toISOString(),
      updatedAt: pet.updatedAt.toISOString(),
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar pets:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Erro ao listar pets',
      },
      { status: 500 }
    );
  }
}
