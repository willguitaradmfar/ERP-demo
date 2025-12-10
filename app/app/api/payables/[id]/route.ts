import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const payable = await prisma.payable.findUnique({
      where: { id },
      include: {
        supplier: true,
        category: true,
        createdBy: { select: { name: true } }
      }
    })

    if (!payable) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(payable)
  } catch (error) {
    console.error('Error fetching payable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { description, amount, dueDate, supplierId, categoryId, documentNumber, notes, status } = body

    const payable = await prisma.payable.update({
      where: { id },
      data: {
        description,
        amount,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        supplierId: supplierId || null,
        categoryId: categoryId || null,
        documentNumber: documentNumber || null,
        notes: notes || null,
        status
      },
      include: {
        supplier: true,
        category: true,
        createdBy: { select: { name: true } }
      }
    })

    return NextResponse.json(payable)
  } catch (error) {
    console.error('Error updating payable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.payable.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
