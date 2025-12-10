'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [marioPosition, setMarioPosition] = useState(0)
  const [coins, setCoins] = useState<{ id: number; x: number; y: number }[]>([])

  // Animate Mario running
  useEffect(() => {
    const interval = setInterval(() => {
      setMarioPosition((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Add floating coins randomly
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setCoins((prev) => [
          ...prev.slice(-5),
          { id: Date.now(), x: Math.random() * 100, y: Math.random() * 100 },
        ])
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Play start sound effect
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
      const ctx = new AudioContext()
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1)
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1 + 0.12)
        osc.start(ctx.currentTime + i * 0.1)
        osc.stop(ctx.currentTime + i * 0.1 + 0.12)
      })
    } catch {}

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Game over sound
        try {
          const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
          const ctx = new AudioContext()
          const notes = [392, 311, 261, 196]
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.type = 'square'
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2)
            gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.2)
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.2 + 0.25)
            osc.start(ctx.currentTime + i * 0.2)
            osc.stop(ctx.currentTime + i * 0.2 + 0.25)
          })
        } catch {}

        if (result.error.includes('bloqueada')) {
          setError('Game Over! Conta bloqueada. Aguarde 15 minutos.')
        } else {
          setError('Game Over! Senha ou email incorretos.')
        }
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600">
      {/* Mario-style CSS */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes coin-spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes run {
          0%, 100% { transform: translateX(0) scaleX(1); }
          50% { transform: translateX(5px) scaleX(1); }
        }
        @keyframes cloud-float {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
        @keyframes brick-bump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .mario-run { animation: run 0.3s steps(2) infinite; }
        .coin-spin { animation: coin-spin 0.5s linear infinite; }
        .float { animation: float 2s ease-in-out infinite; }
      `}</style>

      {/* Clouds */}
      <div className="absolute top-10 left-0 text-6xl opacity-80" style={{ animation: 'cloud-float 30s linear infinite' }}>☁️</div>
      <div className="absolute top-20 left-1/4 text-4xl opacity-60" style={{ animation: 'cloud-float 40s linear infinite 5s' }}>☁️</div>
      <div className="absolute top-16 right-0 text-5xl opacity-70" style={{ animation: 'cloud-float 35s linear infinite 10s' }}>☁️</div>

      {/* Hills */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-600 to-green-500">
        <div className="absolute bottom-0 left-10 w-32 h-24 bg-green-500 rounded-t-full" />
        <div className="absolute bottom-0 left-32 w-48 h-32 bg-green-500 rounded-t-full" />
        <div className="absolute bottom-0 right-20 w-40 h-28 bg-green-500 rounded-t-full" />
      </div>

      {/* Ground bricks */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-orange-700 flex">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="w-8 h-8 border-2 border-orange-900 bg-orange-600" />
        ))}
      </div>

      {/* Running Mario at bottom */}
      <div
        className="absolute bottom-8 text-4xl mario-run"
        style={{ left: `${marioPosition}%`, transition: 'left 0.05s linear' }}
      >
        🏃
      </div>

      {/* Floating coins */}
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute text-2xl coin-spin pointer-events-none"
          style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
        >
          🪙
        </div>
      ))}

      {/* Question blocks decoration */}
      <div className="absolute top-1/4 left-10 text-4xl float">❓</div>
      <div className="absolute top-1/3 right-10 text-4xl float" style={{ animationDelay: '0.5s' }}>❓</div>

      {/* Login Box - styled as castle */}
      <div className="w-full max-w-md relative z-10">
        {/* Castle towers */}
        <div className="flex justify-between px-4 -mb-4">
          <div className="text-4xl">🏰</div>
          <div className="text-4xl">🏰</div>
        </div>

        <div className="bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.4)] border-8 border-yellow-600 p-8 relative">
          {/* Decorative bricks pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full" style={{
              backgroundImage: 'linear-gradient(to right, #92400e 2px, transparent 2px), linear-gradient(to bottom, #92400e 2px, transparent 2px)',
              backgroundSize: '24px 12px'
            }} />
          </div>

          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-b from-red-500 to-red-700 rounded-full border-4 border-red-800 mb-4 shadow-lg">
              <span className="text-4xl">👨‍🔧</span>
            </div>
            <h1 className="text-3xl font-black text-yellow-900 drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ fontFamily: 'system-ui' }}>
              SUPER ERP
            </h1>
            <p className="text-yellow-800 mt-2 font-bold">
              Pressione START para jogar!
            </p>
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-xl">🪙</span>
              <span className="text-xl">⭐</span>
              <span className="text-xl">🍄</span>
            </div>
          </div>

          {/* Error Message - styled as Goomba warning */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-b from-red-500 to-red-700 border-4 border-red-800 rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.4)] flex items-center gap-3">
              <span className="text-2xl">💀</span>
              <p className="text-sm text-white font-bold">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div>
              <label className="block text-sm font-bold text-yellow-900 mb-2 drop-shadow-[1px_1px_0_rgba(0,0,0,0.2)]">
                📧 PLAYER NAME (Email)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mario@mushroom.kingdom"
                  required
                  className="w-full px-4 py-3 bg-gradient-to-b from-white to-gray-100 border-4 border-yellow-700 rounded-xl text-yellow-900 font-bold placeholder-yellow-600/50 focus:ring-4 focus:ring-yellow-400 focus:border-yellow-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-yellow-900 mb-2 drop-shadow-[1px_1px_0_rgba(0,0,0,0.2)]">
                🔑 SECRET CODE (Senha)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 bg-gradient-to-b from-white to-gray-100 border-4 border-yellow-700 rounded-xl text-yellow-900 font-bold placeholder-yellow-600/50 focus:ring-4 focus:ring-yellow-400 focus:border-yellow-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl hover:scale-110 transition-transform"
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 px-6
                bg-gradient-to-b from-green-400 to-green-600
                hover:from-green-300 hover:to-green-500
                disabled:from-gray-400 disabled:to-gray-600
                text-white font-black text-lg
                rounded-xl border-4 border-green-700
                shadow-[4px_4px_0_rgba(0,0,0,0.4)]
                hover:shadow-[6px_6px_0_rgba(0,0,0,0.4)]
                hover:-translate-y-1
                active:shadow-[2px_2px_0_rgba(0,0,0,0.4)]
                active:translate-y-1
                transition-all duration-150
                flex items-center justify-center gap-3
              `}
            >
              {loading ? (
                <>
                  <span className="text-2xl animate-bounce">🪙</span>
                  <span>LOADING...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">▶️</span>
                  <span>START GAME</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-yellow-800 font-bold">
              © 2024 SUPER ERP WORLD
            </p>
            <div className="flex justify-center gap-2 mt-2 text-xl">
              <span className="hover:scale-125 transition-transform cursor-pointer" title="1UP">🍄</span>
              <span className="hover:scale-125 transition-transform cursor-pointer" title="Star Power">⭐</span>
              <span className="hover:scale-125 transition-transform cursor-pointer" title="Fire Flower">🌸</span>
            </div>
          </div>
        </div>

        {/* Pipe decoration at bottom */}
        <div className="flex justify-center -mt-2">
          <div className="w-24 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-b-xl border-4 border-t-0 border-green-700" />
        </div>
      </div>
    </div>
  )
}
