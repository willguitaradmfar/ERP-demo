// Mario Bros Sound Effects using Web Audio API
class MarioSounds {
  private audioContext: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return this.audioContext
  }

  // Coin sound - the classic "bling"
  coin() {
    const ctx = this.getContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(988, ctx.currentTime) // B5
    oscillator.frequency.setValueAtTime(1319, ctx.currentTime + 0.1) // E6

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }

  // Jump sound
  jump() {
    const ctx = this.getContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(150, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15)

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.15)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  }

  // Power up sound
  powerUp() {
    const ctx = this.getContext()
    const notes = [523, 659, 784, 1047, 1319, 1568] // C5 to G6

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08)
      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.08 + 0.1)

      oscillator.start(ctx.currentTime + i * 0.08)
      oscillator.stop(ctx.currentTime + i * 0.08 + 0.1)
    })
  }

  // Pipe/warp sound
  pipe() {
    const ctx = this.getContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.3)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }

  // Bump sound (hitting block)
  bump() {
    const ctx = this.getContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.05)

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  // 1-UP sound
  oneUp() {
    const ctx = this.getContext()
    const notes = [330, 392, 523, 392, 523, 659]

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1)
      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.1 + 0.12)

      oscillator.start(ctx.currentTime + i * 0.1)
      oscillator.stop(ctx.currentTime + i * 0.1 + 0.12)
    })
  }

  // Game over sound
  gameOver() {
    const ctx = this.getContext()
    const notes = [392, 311, 261, 196]

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2)

      gainNode.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.2)
      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.2 + 0.25)

      oscillator.start(ctx.currentTime + i * 0.2)
      oscillator.stop(ctx.currentTime + i * 0.2 + 0.25)
    })
  }

  // Fireball sound
  fireball() {
    const ctx = this.getContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(600, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }
}

export const marioSounds = typeof window !== 'undefined' ? new MarioSounds() : null
