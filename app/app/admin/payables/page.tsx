import { prisma } from '@/lib/prisma'
import { PayablesList } from './payables-list'

async function getPayables() {
  const payables = await prisma.payable.findMany({
    include: {
      supplier: true,
      category: true,
      createdBy: { select: { name: true } }
    },
    orderBy: { dueDate: 'asc' }
  })

  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  const categories = await prisma.category.findMany({
    where: { type: 'payable', isActive: true },
    orderBy: { name: 'asc' }
  })

  // Serialize dates to ISO strings
  const serializedPayables = payables.map(p => ({
    ...p,
    dueDate: p.dueDate.toISOString(),
    paidDate: p.paidDate?.toISOString() || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    approvedAt: p.approvedAt?.toISOString() || null,
    supplier: p.supplier ? {
      id: p.supplier.id,
      name: p.supplier.name
    } : null,
    category: p.category ? {
      id: p.category.id,
      name: p.category.name,
      color: p.category.color
    } : null
  }))

  return { payables: serializedPayables, suppliers, categories }
}

export default async function PayablesPage() {
  const { payables, suppliers, categories } = await getPayables()

  return (
    <PayablesList
      initialPayables={payables}
      suppliers={suppliers}
      categories={categories}
    />
  )
}
