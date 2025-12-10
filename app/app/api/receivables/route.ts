import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const receivables = await prisma.receivable.findMany({
      include: {
        customer: true,
        category: true,
        createdBy: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(receivables)
  } catch (error) {
    console.error('Error fetching receivables:', error)
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
    const { description, amount, dueDate, customerId, categoryId, documentNumber, notes } = body

    const receivable = await prisma.receivable.create({
      data: {
        description,
        amount,
        dueDate: new Date(dueDate),
        customerId: customerId || null,
        categoryId: categoryId || null,
        documentNumber: documentNumber || null,
        notes: notes || null,
        createdById: session.user.id
      },
      include: {
        customer: true,
        category: true,
        createdBy: { select: { name: true } }
      }
    })

    return NextResponse.json(receivable)
  } catch (error) {
    console.error('Error creating receivable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
