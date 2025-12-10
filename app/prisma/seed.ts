import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: {
      email: 'admin@erp.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    }
  })

  console.log('Admin user created:', admin.email)

  // Create default categories
  const categories = [
    { name: 'Vendas', type: 'receivable', color: '#22c55e' },
    { name: 'Serviços', type: 'receivable', color: '#3b82f6' },
    { name: 'Outros Recebimentos', type: 'receivable', color: '#8b5cf6' },
    { name: 'Fornecedores', type: 'payable', color: '#ef4444' },
    { name: 'Salários', type: 'payable', color: '#f97316' },
    { name: 'Impostos', type: 'payable', color: '#eab308' },
    { name: 'Utilidades', type: 'payable', color: '#06b6d4' },
    { name: 'Outros Pagamentos', type: 'payable', color: '#6b7280' }
  ]

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        type: cat.type,
        color: cat.color
      }
    })
  }

  console.log('Categories created')

  // Create sample customers
  const customers = [
    { name: 'Cliente Exemplo 1', document: '12345678901', email: 'cliente1@exemplo.com', phone: '(11) 99999-0001' },
    { name: 'Empresa ABC Ltda', document: '12345678000190', email: 'contato@abc.com', phone: '(11) 3333-4444' }
  ]

  for (const cust of customers) {
    await prisma.customer.create({
      data: cust
    })
  }

  console.log('Sample customers created')

  // Create sample suppliers
  const suppliers = [
    { name: 'Fornecedor XYZ', document: '98765432000101', email: 'contato@xyz.com', phone: '(11) 2222-3333' },
    { name: 'Distribuidora 123', document: '11222333000144', email: 'vendas@dist123.com', phone: '(11) 4444-5555' }
  ]

  for (const supp of suppliers) {
    await prisma.supplier.create({
      data: supp
    })
  }

  console.log('Sample suppliers created')

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
