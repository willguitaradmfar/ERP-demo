import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { LogIn, LogOut, AlertTriangle, Lock, Activity, User } from 'lucide-react'

async function getAccessLogs() {
  const logs = await prisma.accessLog.findMany({
    include: {
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  return logs
}

function getActionIcon(action: string) {
  switch (action) {
    case 'login':
      return <LogIn size={16} className="text-green-500" />
    case 'logout':
      return <LogOut size={16} className="text-blue-500" />
    case 'failed_login':
      return <AlertTriangle size={16} className="text-yellow-500" />
    case 'account_locked':
      return <Lock size={16} className="text-red-500" />
    default:
      return <Activity size={16} className="text-gray-500" />
  }
}

function getActionBadge(action: string) {
  switch (action) {
    case 'login':
      return <Badge variant="success">Login</Badge>
    case 'logout':
      return <Badge variant="info">Logout</Badge>
    case 'failed_login':
      return <Badge variant="warning">Falha no Login</Badge>
    case 'account_locked':
      return <Badge variant="danger">Conta Bloqueada</Badge>
    default:
      return <Badge>{action}</Badge>
  }
}

export default async function AccessLogsPage() {
  const logs = await getAccessLogs()

  const stats = {
    totalLogins: logs.filter(l => l.action === 'login').length,
    failedAttempts: logs.filter(l => l.action === 'failed_login').length,
    lockedAccounts: logs.filter(l => l.action === 'account_locked').length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Logs de Acesso
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Histórico de acessos e tentativas de login
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <LogIn className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Logins (últimos 100)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalLogins}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Tentativas Falhas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.failedAttempts}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Contas Bloqueadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.lockedAccounts}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos 100 registros</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum log encontrado
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {log.user ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{log.user.name}</p>
                          <p className="text-xs text-gray-500">{log.user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      {getActionBadge(log.action)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {log.details || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono text-gray-500">
                      {log.ipAddress || '-'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
