'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, isAfter } from 'date-fns'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface Payable {
  id: string
  description: string
  amount: number
  dueDate: string
  paidDate: string | null
  paidAmount: number | null
  status: string
  documentNumber: string | null
  notes: string | null
  supplier: { id: string; name: string } | null
  category: { id: string; name: string; color: string | null } | null
  createdBy: { name: string }
}

interface Supplier {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  color: string | null
}

interface Props {
  initialPayables: Payable[]
  suppliers: Supplier[]
  categories: Category[]
}

export function PayablesList({ initialPayables, suppliers, categories }: Props) {
  const router = useRouter()
  const [payables, setPayables] = useState(initialPayables)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Payable | null>(null)
  const [payingItem, setPayingItem] = useState<Payable | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dueDate: '',
    supplierId: '',
    categoryId: '',
    documentNumber: '',
    notes: ''
  })

  const [payFormData, setPayFormData] = useState({
    paidAmount: '',
    paidDate: format(new Date(), 'yyyy-MM-dd')
  })

  const filteredPayables = payables.filter(item => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status === 'pending' && isAfter(new Date(), new Date(dueDate))

    if (isOverdue) {
      return <Badge variant="danger"><AlertCircle size={12} className="mr-1" />Atrasado</Badge>
    }

    switch (status) {
      case 'paid':
        return <Badge variant="success"><CheckCircle size={12} className="mr-1" />Pago</Badge>
      case 'pending':
        return <Badge variant="warning"><Clock size={12} className="mr-1" />Pendente</Badge>
      case 'approved':
        return <Badge variant="info"><ShieldCheck size={12} className="mr-1" />Aprovado</Badge>
      case 'cancelled':
        return <Badge variant="default"><XCircle size={12} className="mr-1" />Cancelado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({
      description: '',
      amount: '',
      dueDate: '',
      supplierId: '',
      categoryId: '',
      documentNumber: '',
      notes: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: Payable) => {
    setEditingItem(item)
    setFormData({
      description: item.description,
      amount: item.amount.toString(),
      dueDate: format(new Date(item.dueDate), 'yyyy-MM-dd'),
      supplierId: item.supplier?.id || '',
      categoryId: item.category?.id || '',
      documentNumber: item.documentNumber || '',
      notes: item.notes || ''
    })
    setIsModalOpen(true)
  }

  const openPayModal = (item: Payable) => {
    setPayingItem(item)
    setPayFormData({
      paidAmount: item.amount.toString(),
      paidDate: format(new Date(), 'yyyy-MM-dd')
    })
    setIsPayModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingItem
        ? `/api/payables/${editingItem.id}`
        : '/api/payables'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          supplierId: formData.supplierId || null,
          categoryId: formData.categoryId || null
        })
      })

      if (response.ok) {
        setIsModalOpen(false)
        router.refresh()
        const data = await response.json()
        if (editingItem) {
          setPayables(prev =>
            prev.map(item => item.id === editingItem.id ? data : item)
          )
        } else {
          setPayables(prev => [...prev, data])
        }
      }
    } catch (error) {
      console.error('Error saving payable:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingItem) return
    setLoading(true)

    try {
      const response = await fetch(`/api/payables/${payingItem.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidAmount: parseFloat(payFormData.paidAmount),
          paidDate: payFormData.paidDate
        })
      })

      if (response.ok) {
        setIsPayModalOpen(false)
        router.refresh()
        const data = await response.json()
        setPayables(prev =>
          prev.map(item => item.id === payingItem.id ? data : item)
        )
      }
    } catch (error) {
      console.error('Error paying payable:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return

    try {
      const response = await fetch(`/api/payables/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPayables(prev => prev.filter(item => item.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting payable:', error)
    }
  }

  const totals = filteredPayables.reduce(
    (acc, item) => {
      if (item.status === 'paid') {
        acc.paid += item.paidAmount || item.amount
      } else if (item.status !== 'cancelled') {
        acc.pending += item.amount
      }
      return acc
    },
    { pending: 0, paid: 0 }
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contas a Pagar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie seus pagamentos
          </p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus size={20} />}>
          Novo Pagamento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Pendente</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(totals.pending)}
              </p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Pago</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totals.paid)}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por descrição, fornecedor ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={20} />}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="paid">Pago</option>
            <option value="overdue">Atrasado</option>
            <option value="cancelled">Cancelado</option>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum pagamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredPayables.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.description}</p>
                      {item.documentNumber && (
                        <p className="text-xs text-gray-500">Doc: {item.documentNumber}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.supplier?.name || '-'}</TableCell>
                  <TableCell>
                    {item.category ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${item.category.color}20`,
                          color: item.category.color || undefined
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.category.color || undefined }}
                        />
                        {item.category.name}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{format(new Date(item.dueDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.amount)}
                    {item.paidAmount && item.paidAmount !== item.amount && (
                      <p className="text-xs text-green-600">
                        Pago: {formatCurrency(item.paidAmount)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status, item.dueDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(item.status === 'pending' || item.status === 'approved') && (
                        <button
                          onClick={() => openPayModal(item)}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                          title="Registrar pagamento"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Pagamento' : 'Novo Pagamento'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Descrição *"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor *"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Input
              label="Vencimento *"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Fornecedor"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            >
              <option value="">Selecione...</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </Select>
            <Select
              label="Categoria"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Selecione...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Número do Documento"
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {editingItem ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pay Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Registrar Pagamento"
        size="sm"
      >
        <form onSubmit={handlePay} className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Conta a Pagar</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {payingItem?.description}
            </p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
              {payingItem && formatCurrency(payingItem.amount)}
            </p>
          </div>

          <Input
            label="Valor Pago *"
            type="number"
            step="0.01"
            min="0"
            value={payFormData.paidAmount}
            onChange={(e) => setPayFormData({ ...payFormData, paidAmount: e.target.value })}
            required
          />

          <Input
            label="Data do Pagamento *"
            type="date"
            value={payFormData.paidDate}
            onChange={(e) => setPayFormData({ ...payFormData, paidDate: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsPayModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Confirmar Pagamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
