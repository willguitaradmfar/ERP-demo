import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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
    const { paidAmount, paidDate } = body

    const payable = await prisma.payable.update({
      where: { id },
      data: {
        paidAmount,
        paidDate: new Date(paidDate),
        status: 'paid'
      },
      include: {
        supplier: true,
        category: true,
        createdBy: { select: { name: true } }
      }
    })

    return NextResponse.json(payable)
  } catch (error) {
    console.error('Error paying payable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
