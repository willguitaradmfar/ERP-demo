import { prisma } from '@/lib/prisma'
import { ReceivablesList } from './receivables-list'

async function getReceivables() {
  const receivables = await prisma.receivable.findMany({
    include: {
      customer: true,
      category: true,
      createdBy: { select: { name: true } }
    },
    orderBy: { dueDate: 'asc' }
  })

  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  const categories = await prisma.category.findMany({
    where: { type: 'receivable', isActive: true },
    orderBy: { name: 'asc' }
  })

  // Serialize dates to ISO strings
  const serializedReceivables = receivables.map(r => ({
    ...r,
    dueDate: r.dueDate.toISOString(),
    paidDate: r.paidDate?.toISOString() || null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    customer: r.customer ? {
      id: r.customer.id,
      name: r.customer.name
    } : null,
    category: r.category ? {
      id: r.category.id,
      name: r.category.name,
      color: r.category.color
    } : null
  }))

  return { receivables: serializedReceivables, customers, categories }
}

export default async function ReceivablesPage() {
  const { receivables, customers, categories } = await getReceivables()

  return (
    <ReceivablesList
      initialReceivables={receivables}
      customers={customers}
      categories={categories}
    />
  )
}
