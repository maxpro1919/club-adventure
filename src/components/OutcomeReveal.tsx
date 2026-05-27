'use client'

import { useState, useEffect } from 'react'
import { Player } from '@/lib/types'
import CharacterDisplay from './CharacterDisplay'

interface Props {
  outcome: string
  onPlayAgain: () => void
  currentPlayer: Player | null
  opponent: Player | null
}

export default function OutcomeReveal({ outcome, onPlayAgain, currentPlayer, opponent }: Props) {
  const [visible, setVisible] = useState(false)
  const [charactersVisible, setCharactersVisible] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setCharactersVisible(true), 300)
    const timer2 = setTimeout(() => setVisible(true), 800)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gray-900 rounded-lg pixel-border max-w-lg mx-auto">
      <h3 className="text-xl pixel-text">结局揭晓！</h3>

      <div className="flex items-center gap-8">
        {currentPlayer && (
          <div
            className={`flex flex-col items-center gap-2 transition-all duration-500 ${
              charactersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ animation: charactersVisible ? 'outcome-bounce 0.6s ease-out' : 'none' }}
          >
            <CharacterDisplay
              animal={currentPlayer.animal_type}
              color={currentPlayer.color}
              accessory={currentPlayer.accessory}
              size={64}
              expression="shocked"
            />
            <span className="pixel-text text-xs text-gray-400">{currentPlayer.nickname}</span>
          </div>
        )}

        {opponent && (
          <div
            className={`flex flex-col items-center gap-2 transition-all duration-500 ${
              charactersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ animation: charactersVisible ? 'outcome-bounce 0.6s ease-out 0.15s both' : 'none' }}
          >
            <CharacterDisplay
              animal={opponent.animal_type}
              color={opponent.color}
              accessory={opponent.accessory}
              size={64}
              expression="shocked"
            />
            <span className="pixel-text text-xs text-gray-400">{opponent.nickname}</span>
          </div>
        )}
      </div>

      <div
        className={`text-lg leading-relaxed text-center transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {outcome}
      </div>

      <div className="flex gap-4 mt-4">
        <button onClick={onPlayAgain} className="pixel-btn pixel-btn-primary">
          再来一局！
        </button>
      </div>

      <style jsx>{`
        @keyframes outcome-bounce {
          0% { transform: translateY(30px) scale(0.8); opacity: 0; }
          50% { transform: translateY(-10px) scale(1.05); opacity: 1; }
          70% { transform: translateY(4px) scale(0.98); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
