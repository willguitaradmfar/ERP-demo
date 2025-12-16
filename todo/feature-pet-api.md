# Feature: API de PET

## Visão Geral
Criar uma API RESTful para gerenciamento de pets.

## Entidade PET

### Campos
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | string/number | Sim (auto) | Identificador único |
| nome | string | Sim | Nome do pet |
| especie | string | Sim | Espécie do pet (cachorro, gato, etc.) |
| raca | string | Não | Raça do pet |

## Operações da API

### RF01 - Criar Pet
- **Endpoint:** `POST /api/pets`
- **Descrição:** Criar um novo pet no sistema
- **Request Body:**
```json
{
  "nome": "string (obrigatório)",
  "especie": "string (obrigatório)",
  "raca": "string (opcional)"
}
```
- **Response:** Pet criado com id gerado

### RF02 - Buscar Pet por ID
- **Endpoint:** `GET /api/pets/:id`
- **Descrição:** Retornar um pet específico pelo ID
- **Response:** Dados do pet ou 404 se não encontrado

### RF03 - Listar Todos os Pets
- **Endpoint:** `GET /api/pets`
- **Descrição:** Listar todos os pets cadastrados
- **Response:** Array de pets

## Regras de Negócio

### RN01 - Nome Obrigatório
- O campo `nome` é obrigatório na criação e atualização
- Retornar erro 400 se não informado

## Critérios de Aceite

- [ ] CA01: POST /api/pets cria um novo pet com sucesso
- [ ] CA02: POST /api/pets retorna erro 400 se nome não informado
- [ ] CA03: GET /api/pets/:id retorna o pet correto
- [ ] CA04: GET /api/pets/:id retorna 404 se pet não existe
- [ ] CA05: GET /api/pets retorna lista de todos os pets
- [ ] CA06: GET /api/pets retorna array vazio se não houver pets
