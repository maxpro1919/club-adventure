'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CharacterCreator from '@/components/CharacterCreator'
import { useRoom } from '@/hooks/useRoom'
import { AnimalType, PlayerColor, Accessory } from '@/lib/types'

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState<'create' | 'join'>('create')
  const [joinCode, setJoinCode] = useState('')
  const { joinRoom } = useRoom(null)

  const handleCharacterComplete = async (character: {
    nickname: string
    animal: AnimalType
    color: PlayerColor
    accessory: Accessory
  }) => {
    try {
      const code = await joinRoom(
        character.nickname,
        character.animal,
        character.color,
        character.accessory
      )
      router.push(`/room/${code}`)
    } catch (err) {
      console.error('Failed to join room:', err)
    }
  }

  const handleJoinExisting = () => {
    if (!joinCode.trim()) return
    router.push(`/room/${joinCode.trim()}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <h1 className="text-2xl pixel-text mb-8">社团大冒险</h1>

      {step === 'create' ? (
        <CharacterCreator onComplete={handleCharacterComplete} />
      ) : (
        <div className="flex flex-col gap-4 items-center">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="输入房间码..."
            maxLength={6}
            className="pixel-input w-48 text-center"
          />
          <button onClick={handleJoinExisting} className="pixel-btn pixel-btn-primary">
            加入房间
          </button>
        </div>
      )}

      {step === 'create' && (
        <button
          onClick={() => setStep('join')}
          className="mt-4 pixel-btn"
        >
          已有房间？输入房间码
        </button>
      )}
    </main>
  )
}
