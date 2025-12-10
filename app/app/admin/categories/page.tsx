'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Tags } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  name: string
  type: string
  color: string | null
  isActive: boolean
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    type: 'receivable',
    color: '#3b82f6'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const response = await fetch('/api/categories')
    if (response.ok) {
      const data = await response.json()
      setCategories(data)
    }
  }

  const filteredCategories = categories.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    return matchesSearch && matchesType
  })

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({ name: '', type: 'receivable', color: '#3b82f6' })
    setIsModalOpen(true)
  }

  const openEditModal = (item: Category) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      type: item.type,
      color: item.color || '#3b82f6'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingItem ? `/api/categories/${editingItem.id}` : '/api/categories'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsModalOpen(false)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setCategories(prev => prev.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorias</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie as categorias de contas</p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus size={20} />}>Nova Categoria</Button>
      </div>

      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={20} />}
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="all">Todos os tipos</option>
            <option value="receivable">A Receber</option>
            <option value="payable">A Pagar</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Nenhuma categoria encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <Tags className="w-5 h-5" style={{ color: item.color || undefined }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color || undefined }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'receivable' ? 'success' : 'danger'}>
                      {item.type === 'receivable' ? 'A Receber' : 'A Pagar'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? 'success' : 'default'}>
                      {item.isActive ? 'Ativa' : 'Inativa'}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Editar Categoria' : 'Nova Categoria'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Select
            label="Tipo *"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="receivable">A Receber</option>
            <option value="payable">A Pagar</option>
          </Select>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1"
              />
            </div>
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
