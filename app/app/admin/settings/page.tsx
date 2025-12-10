'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield, Clock } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Informações da sua conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Perfil do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {session?.user?.name || 'Usuário'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail size={14} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {session?.user?.email || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Função</span>
                <Badge variant="info">
                  <Shield size={12} className="mr-1" />
                  {session?.user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Políticas de Senha
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Mínimo de 8 caracteres</li>
                <li>• Ao menos uma letra maiúscula</li>
                <li>• Ao menos uma letra minúscula</li>
                <li>• Ao menos um número</li>
                <li>• Ao menos um caractere especial</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Proteção de Conta
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Bloqueio após 5 tentativas falhas</li>
                <li>• Duração do bloqueio: 15 minutos</li>
                <li>• Timeout de sessão: 30 minutos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Framework</p>
                <p className="font-semibold text-gray-900 dark:text-white">Next.js 16</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Database</p>
                <p className="font-semibold text-gray-900 dark:text-white">SQLite</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">ORM</p>
                <p className="font-semibold text-gray-900 dark:text-white">Prisma 5</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Autenticação</p>
                <p className="font-semibold text-gray-900 dark:text-white">NextAuth v5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
