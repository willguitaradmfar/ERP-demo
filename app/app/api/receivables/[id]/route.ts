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

    const receivable = await prisma.receivable.findUnique({
      where: { id },
      include: {
        customer: true,
        category: true,
        createdBy: { select: { name: true } }
      }
    })

    if (!receivable) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(receivable)
  } catch (error) {
    console.error('Error fetching receivable:', error)
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
    const { description, amount, dueDate, customerId, categoryId, documentNumber, notes, status } = body

    const receivable = await prisma.receivable.update({
      where: { id },
      data: {
        description,
        amount,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        customerId: customerId || null,
        categoryId: categoryId || null,
        documentNumber: documentNumber || null,
        notes: notes || null,
        status
      },
      include: {
        customer: true,
        category: true,
        createdBy: { select: { name: true } }
      }
    })

    return NextResponse.json(receivable)
  } catch (error) {
    console.error('Error updating receivable:', error)
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

    await prisma.receivable.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting receivable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
