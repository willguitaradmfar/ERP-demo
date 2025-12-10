import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')
const LOCKOUT_DURATION = parseInt(process.env.LOCKOUT_DURATION || '15')

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user) {
          await logAccess(null, 'failed_login', `Tentativa com email inexistente: ${email}`, request)
          return null
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await logAccess(user.id, 'failed_login', 'Conta bloqueada - tentativa durante lockout', request)
          throw new Error('Conta bloqueada. Tente novamente mais tarde.')
        }

        // Check if user is active
        if (!user.isActive) {
          await logAccess(user.id, 'failed_login', 'Tentativa em conta desativada', request)
          return null
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          const newAttempts = user.failedAttempts + 1
          const updates: { failedAttempts: number; lockedUntil?: Date } = {
            failedAttempts: newAttempts
          }

          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION * 60 * 1000)
            await logAccess(user.id, 'account_locked', `Conta bloqueada após ${MAX_LOGIN_ATTEMPTS} tentativas`, request)
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updates
          })

          await logAccess(user.id, 'failed_login', `Senha incorreta - tentativa ${newAttempts}`, request)
          return null
        }

        // Reset failed attempts on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: 0,
            lockedUntil: null,
            lastLogin: new Date()
          }
        })

        await logAccess(user.id, 'login', 'Login bem-sucedido', request)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.SESSION_TIMEOUT || '1800')
  }
})

async function logAccess(
  userId: string | null,
  action: string,
  details: string,
  request?: Request
) {
  try {
    const headers = request?.headers
    const ipAddress = headers?.get('x-forwarded-for') || headers?.get('x-real-ip') || 'unknown'
    const userAgent = headers?.get('user-agent') || 'unknown'

    await prisma.accessLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Error logging access:', error)
  }
}

// Password validation helper
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Pelo menos uma letra maiúscula')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Pelo menos uma letra minúscula')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Pelo menos um número')
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Pelo menos um caractere especial')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Hash password helper
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
