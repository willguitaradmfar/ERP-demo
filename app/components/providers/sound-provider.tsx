'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { marioSounds } from '@/lib/sounds'

interface SoundContextType {
  soundEnabled: boolean
  toggleSound: () => void
  playSound: (sound: 'coin' | 'jump' | 'powerUp' | 'pipe' | 'bump' | 'oneUp' | 'gameOver' | 'fireball') => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true)

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev)
  }, [])

  const playSound = useCallback((sound: 'coin' | 'jump' | 'powerUp' | 'pipe' | 'bump' | 'oneUp' | 'gameOver' | 'fireball') => {
    if (soundEnabled && marioSounds) {
      marioSounds[sound]()
    }
  }, [soundEnabled])

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}
