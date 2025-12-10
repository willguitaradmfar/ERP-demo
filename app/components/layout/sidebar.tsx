'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useTheme } from '../providers/theme-provider'
import { useSound } from '../providers/sound-provider'

// Mario-themed menu items with emojis
const menuItems = [
  { href: '/admin', label: 'Castelo', emoji: '🏰', description: 'Dashboard' },
  { href: '/admin/receivables', label: 'Moedas', emoji: '🪙', description: 'A Receber' },
  { href: '/admin/payables', label: 'Canos', emoji: '🟢', description: 'A Pagar' },
  { href: '/admin/customers', label: 'Toads', emoji: '🍄', description: 'Clientes' },
  { href: '/admin/suppliers', label: 'Yoshis', emoji: '🦖', description: 'Fornecedores' },
  { href: '/admin/categories', label: 'Estrelas', emoji: '⭐', description: 'Categorias' },
  { href: '/admin/logs', label: 'Mapas', emoji: '🗺️', description: 'Logs' },
  { href: '/admin/settings', label: 'Blocos ?', emoji: '❓', description: 'Config' },
]

// Mario character sprite (CSS animation)
const MarioSprite = ({ isJumping, direction }: { isJumping: boolean; direction: 'left' | 'right' }) => (
  <div
    className={`
      text-2xl transition-transform duration-150
      ${isJumping ? 'animate-mario-jump' : 'animate-mario-walk'}
      ${direction === 'left' ? 'scale-x-[-1]' : ''}
    `}
  >
    🏃
  </div>
)

// Floating coin animation
const FloatingCoin = ({ show }: { show: boolean }) => (
  <div
    className={`
      absolute -top-4 left-1/2 -translate-x-1/2
      text-xl transition-all duration-500
      ${show ? 'opacity-100 -translate-y-4' : 'opacity-0 translate-y-0'}
    `}
  >
    🪙
  </div>
)

// Question block that bounces
const QuestionBlock = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`
      relative px-4 py-3 rounded-lg font-bold
      bg-gradient-to-b from-yellow-400 to-yellow-600
      border-4 border-yellow-700
      shadow-[inset_0_-4px_0_rgba(0,0,0,0.3)]
      transition-all duration-100
      ${active ? 'animate-block-bump scale-95' : 'hover:scale-105'}
    `}
  >
    <span className="text-yellow-900">{children}</span>
  </button>
)

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { playSound, soundEnabled, toggleSound } = useSound()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [marioPosition, setMarioPosition] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [showCoin, setShowCoin] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  // Update Mario position based on active menu
  useEffect(() => {
    const activeIndex = menuItems.findIndex(
      item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
    )
    if (activeIndex !== -1) {
      setMarioPosition(activeIndex)
    }
  }, [pathname])

  const handleMenuClick = (href: string, index: number) => {
    // Jump animation
    setIsJumping(true)
    playSound('jump')

    // Show coin
    setShowCoin(href)
    setTimeout(() => {
      playSound('coin')
      setScore(prev => prev + 100)
    }, 150)

    setTimeout(() => {
      setIsJumping(false)
      setShowCoin(null)
    }, 300)

    setMobileOpen(false)
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    playSound('pipe')
    setTheme(newTheme)
  }

  const handleLogout = () => {
    playSound('gameOver')
    setTimeout(() => {
      signOut({ callbackUrl: '/login' })
    }, 800)
  }

  const handleCollapse = () => {
    playSound('bump')
    setCollapsed(!collapsed)
  }

  return (
    <>
      {/* Custom Mario animations */}
      <style jsx global>{`
        @keyframes mario-jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes mario-walk {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(2px); }
        }
        @keyframes block-bump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes coin-spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px); }
        }
        @keyframes brick-pattern {
          0% { background-position: 0 0; }
          100% { background-position: 32px 32px; }
        }
        .animate-mario-jump { animation: mario-jump 0.3s ease-out; }
        .animate-mario-walk { animation: mario-walk 0.3s ease-in-out infinite; }
        .animate-block-bump { animation: block-bump 0.2s ease-out; }
        .animate-coin-spin { animation: coin-spin 0.5s linear infinite; }
        .animate-float-up { animation: float-up 0.5s ease-out forwards; }

        .mario-brick-bg {
          background-color: #c84c0c;
          background-image:
            linear-gradient(to right, #8b3008 2px, transparent 2px),
            linear-gradient(to bottom, #8b3008 2px, transparent 2px);
          background-size: 32px 16px;
        }

        .mario-sky-bg {
          background: linear-gradient(180deg, #5c94fc 0%, #87ceeb 100%);
        }

        .mario-underground-bg {
          background: linear-gradient(180deg, #000000 0%, #1a1a2e 100%);
        }

        .mario-grass {
          position: relative;
        }
        .mario-grass::after {
          content: '🌿🌱🌿🌱🌿';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          font-size: 10px;
          letter-spacing: 2px;
        }
      `}</style>

      {/* Mobile menu button - styled as ? block */}
      <button
        onClick={() => {
          playSound('bump')
          setMobileOpen(!mobileOpen)
        }}
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-b from-yellow-400 to-yellow-600 border-4 border-yellow-700 rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold text-yellow-900 hover:scale-110 transition-transform"
      >
        {mobileOpen ? '✕' : '❓'}
      </button>

      {/* Mobile overlay - dark like underground */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Mario themed */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          flex flex-col
          ${theme === 'dark' ? 'mario-underground-bg' : 'mario-brick-bg'}
          border-r-4 border-yellow-700
          transition-all duration-300
          ${collapsed ? 'w-24' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header - Castle style */}
        <div className="relative h-20 flex items-center justify-center px-4 bg-gradient-to-b from-gray-700 to-gray-900 border-b-4 border-yellow-600">
          {/* Castle towers */}
          <div className="absolute -top-2 left-4 text-2xl">🏰</div>
          <div className="absolute -top-2 right-4 text-2xl">🏰</div>

          {!collapsed && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-yellow-400 drop-shadow-[2px_2px_0_#000]" style={{ fontFamily: 'system-ui' }}>
                SUPER ERP
              </h1>
              <div className="flex items-center justify-center gap-2 text-yellow-300 text-sm">
                <span>🪙</span>
                <span className="font-mono">{score.toString().padStart(6, '0')}</span>
              </div>
            </div>
          )}

          {/* Collapse button - Pipe style */}
          <button
            onClick={handleCollapse}
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-gradient-to-b from-green-400 to-green-600 border-2 border-green-800 rounded-r-lg items-center justify-center hover:from-green-500 hover:to-green-700 transition-colors"
          >
            <span className="text-white font-bold">{collapsed ? '→' : '←'}</span>
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="px-4 py-2 flex justify-center">
          <button
            onClick={() => {
              toggleSound()
              if (!soundEnabled) playSound('powerUp')
            }}
            className={`
              px-3 py-1 rounded-full text-sm font-bold
              ${soundEnabled
                ? 'bg-green-500 text-white'
                : 'bg-gray-600 text-gray-300'
              }
              transition-colors
            `}
          >
            {soundEnabled ? '🔊 SOM' : '🔇 MUDO'}
          </button>
        </div>

        {/* Navigation - World Map style */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Mario character indicator */}
          <div
            className="absolute left-2 transition-all duration-300 z-10"
            style={{ top: `${180 + marioPosition * 56}px` }}
          >
            <MarioSprite isJumping={isJumping} direction="right" />
          </div>

          {menuItems.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleMenuClick(item.href, index)}
                onMouseEnter={() => {
                  setHoveredItem(item.href)
                  playSound('bump')
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 transform
                  ${isActive
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-4 border-yellow-600 shadow-lg scale-105'
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 border-4 border-orange-800 hover:scale-105 hover:from-orange-500 hover:to-orange-600'
                  }
                  ${hoveredItem === item.href ? 'animate-block-bump' : ''}
                `}
              >
                {/* Floating coin on click */}
                <FloatingCoin show={showCoin === item.href} />

                {/* Emoji icon */}
                <span className={`text-2xl ${isActive ? 'animate-coin-spin' : ''}`}>
                  {item.emoji}
                </span>

                {/* Label */}
                {!collapsed && (
                  <div className="flex-1">
                    <span className={`font-bold drop-shadow-[1px_1px_0_#000] ${isActive ? 'text-yellow-900' : 'text-white'}`}>
                      {item.label}
                    </span>
                    <p className={`text-xs ${isActive ? 'text-yellow-800' : 'text-orange-200'}`}>
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Active indicator - Star */}
                {isActive && (
                  <span className="text-xl animate-pulse">⭐</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Theme Switcher - World select style */}
        <div className="p-4 border-t-4 border-yellow-700">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-white text-xs font-bold drop-shadow-[1px_1px_0_#000]">WORLD</span>
          </div>
          <div className={`flex ${collapsed ? 'flex-col' : 'flex-row'} gap-2`}>
            {[
              { value: 'light' as const, emoji: '☀️', label: '1-1' },
              { value: 'dark' as const, emoji: '🌙', label: '1-2' },
              { value: 'system' as const, emoji: '🌍', label: 'AUTO' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`
                  flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg
                  font-bold text-sm transition-all
                  ${theme === option.value
                    ? 'bg-gradient-to-b from-green-400 to-green-600 border-2 border-green-700 text-white scale-105'
                    : 'bg-gradient-to-b from-gray-500 to-gray-700 border-2 border-gray-800 text-gray-300 hover:from-gray-400 hover:to-gray-600'
                  }
                `}
              >
                <span>{option.emoji}</span>
                {!collapsed && <span>{option.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* User section - Player info */}
        <div className="p-4 border-t-4 border-yellow-700 bg-black/30">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            {/* Mario avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-red-500 to-red-700 border-4 border-red-800 flex items-center justify-center text-2xl shadow-lg">
              👨‍🔧
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-yellow-400 drop-shadow-[1px_1px_0_#000] truncate">
                  {session?.user?.name || 'PLAYER 1'}
                </p>
                <p className="text-xs text-green-400 truncate">
                  ★ {session?.user?.role === 'admin' ? 'ADMIN' : 'USER'}
                </p>
              </div>
            )}
          </div>

          {/* Logout - Pipe exit */}
          <button
            onClick={handleLogout}
            className={`
              mt-3 w-full flex items-center justify-center gap-2 px-3 py-2
              bg-gradient-to-b from-green-500 to-green-700
              border-4 border-green-800 rounded-lg
              text-white font-bold
              hover:from-red-500 hover:to-red-700 hover:border-red-800
              transition-all hover:scale-105
            `}
          >
            <span className="text-xl">🚪</span>
            {!collapsed && <span>GAME OVER</span>}
          </button>
        </div>

        {/* Ground decoration */}
        <div className="h-4 bg-gradient-to-b from-green-600 to-green-800 border-t-4 border-green-500 flex items-end justify-center overflow-hidden">
          {!collapsed && <span className="text-xs">🌿🌱🌿🌱🌿🌱🌿</span>}
        </div>
      </aside>
    </>
  )
}
