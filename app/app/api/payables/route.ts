import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payables = await prisma.payable.findMany({
      include: {
        supplier: true,
        category: true,
        createdBy: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(payables)
  } catch (error) {
    console.error('Error fetching payables:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { description, amount, dueDate, supplierId, categoryId, documentNumber, notes } = body

    const payable = await prisma.payable.create({
      data: {
        description,
        amount,
        dueDate: new Date(dueDate),
        supplierId: supplierId || null,
        categoryId: categoryId || null,
        documentNumber: documentNumber || null,
        notes: notes || null,
        createdById: session.user.id
      },
      include: {
        supplier: true,
        category: true,
        createdBy: { select: { name: true } }
      }
    })

    return NextResponse.json(payable)
  } catch (error) {
    console.error('Error creating payable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
