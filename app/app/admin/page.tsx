import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Building2
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

async function getDashboardData() {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [
    totalReceivables,
    totalPayables,
    overdueReceivables,
    overduePayables,
    monthReceivables,
    monthPayables,
    paidThisMonth,
    receivedThisMonth,
    recentReceivables,
    recentPayables,
    customersCount,
    suppliersCount
  ] = await Promise.all([
    prisma.receivable.aggregate({
      where: { status: { in: ['pending', 'overdue'] } },
      _sum: { amount: true }
    }),
    prisma.payable.aggregate({
      where: { status: { in: ['pending', 'overdue', 'approved'] } },
      _sum: { amount: true }
    }),
    prisma.receivable.aggregate({
      where: { status: 'overdue' },
      _sum: { amount: true },
      _count: true
    }),
    prisma.payable.aggregate({
      where: { status: 'overdue' },
      _sum: { amount: true },
      _count: true
    }),
    prisma.receivable.aggregate({
      where: {
        dueDate: { gte: monthStart, lte: monthEnd },
        status: { in: ['pending', 'overdue'] }
      },
      _sum: { amount: true }
    }),
    prisma.payable.aggregate({
      where: {
        dueDate: { gte: monthStart, lte: monthEnd },
        status: { in: ['pending', 'overdue', 'approved'] }
      },
      _sum: { amount: true }
    }),
    prisma.payable.aggregate({
      where: {
        paidDate: { gte: monthStart, lte: monthEnd },
        status: 'paid'
      },
      _sum: { paidAmount: true }
    }),
    prisma.receivable.aggregate({
      where: {
        paidDate: { gte: monthStart, lte: monthEnd },
        status: 'paid'
      },
      _sum: { paidAmount: true }
    }),
    prisma.receivable.findMany({
      where: { status: { in: ['pending', 'overdue'] } },
      include: { customer: true, category: true },
      orderBy: { dueDate: 'asc' },
      take: 5
    }),
    prisma.payable.findMany({
      where: { status: { in: ['pending', 'overdue', 'approved'] } },
      include: { supplier: true, category: true },
      orderBy: { dueDate: 'asc' },
      take: 5
    }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.supplier.count({ where: { isActive: true } })
  ])

  return {
    totalReceivables: totalReceivables._sum.amount || 0,
    totalPayables: totalPayables._sum.amount || 0,
    overdueReceivables: {
      amount: overdueReceivables._sum.amount || 0,
      count: overdueReceivables._count
    },
    overduePayables: {
      amount: overduePayables._sum.amount || 0,
      count: overduePayables._count
    },
    monthReceivables: monthReceivables._sum.amount || 0,
    monthPayables: monthPayables._sum.amount || 0,
    paidThisMonth: paidThisMonth._sum.paidAmount || 0,
    receivedThisMonth: receivedThisMonth._sum.paidAmount || 0,
    recentReceivables,
    recentPayables,
    customersCount,
    suppliersCount
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  const now = new Date()
  const balance = data.totalReceivables - data.totalPayables

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Visão geral do seu financeiro - {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <ArrowDownToLine className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">A Receber</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.totalReceivables)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <ArrowUpFromLine className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">A Pagar</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.totalPayables)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
              <DollarSign className={`w-6 h-6 ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Previsto</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Em Atraso</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {data.overdueReceivables.count + data.overduePayables.count}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recebido este mês</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.receivedThisMonth)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
              <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pago este mês</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.paidThisMonth)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clientes Ativos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {data.customersCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fornecedores Ativos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {data.suppliersCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Receivables */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Próximos a Receber
            </h2>
            <Link
              href="/admin/receivables"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <CardContent className="p-0">
            {data.recentReceivables.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                Nenhum recebível pendente
              </p>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.recentReceivables.map((item) => {
                  const isOverdue = isAfter(now, new Date(item.dueDate))
                  return (
                    <div key={item.id} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.customer?.name || 'Sem cliente'} • {format(new Date(item.dueDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {formatCurrency(item.amount)}
                        </p>
                        {isOverdue && (
                          <span className="text-xs text-red-600 dark:text-red-400">Atrasado</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payables */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Próximos a Pagar
            </h2>
            <Link
              href="/admin/payables"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <CardContent className="p-0">
            {data.recentPayables.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                Nenhum pagamento pendente
              </p>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.recentPayables.map((item) => {
                  const isOverdue = isAfter(now, new Date(item.dueDate))
                  return (
                    <div key={item.id} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.supplier?.name || 'Sem fornecedor'} • {format(new Date(item.dueDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                          {formatCurrency(item.amount)}
                        </p>
                        {isOverdue && (
                          <span className="text-xs text-red-600 dark:text-red-400">Atrasado</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
