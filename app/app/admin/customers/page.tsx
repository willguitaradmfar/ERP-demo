'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit2, Trash2, User, Mail, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Customer {
  id: string
  name: string
  document: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  notes: string | null
  isActive: boolean
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    const response = await fetch('/api/customers')
    if (response.ok) {
      const data = await response.json()
      setCustomers(data)
    }
  }

  const filteredCustomers = customers.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({ name: '', document: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', notes: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (item: Customer) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      document: item.document || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      city: item.city || '',
      state: item.state || '',
      zipCode: item.zipCode || '',
      notes: item.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingItem ? `/api/customers/${editingItem.id}` : '/api/customers'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsModalOpen(false)
        fetchCustomers()
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    try {
      const response = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setCustomers(prev => prev.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie seus clientes</p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus size={20} />}>Novo Cliente</Button>
      </div>

      <Card>
        <CardContent>
          <Input
            placeholder="Buscar por nome, documento ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={20} />}
          />
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.document || '-'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail size={14} className="text-gray-400" />
                          {item.email}
                        </div>
                      )}
                      {item.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone size={14} className="text-gray-400" />
                          {item.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.city && item.state ? `${item.city}/${item.state}` : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? 'success' : 'default'}>
                      {item.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Editar Cliente' : 'Novo Cliente'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CPF/CNPJ" value={formData.document} onChange={(e) => setFormData({ ...formData, document: e.target.value })} />
            <Input label="Telefone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input label="Endereço" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Cidade" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
            <Input label="UF" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} maxLength={2} />
            <Input label="CEP" value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={loading}>{editingItem ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
