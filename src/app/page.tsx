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
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { joinRoom } = useRoom(null)

  const handleCharacterComplete = async (character: {
    nickname: string
    animal: AnimalType
    color: PlayerColor
    accessory: Accessory
  }) => {
    setError(null)
    setSubmitting(true)
    try {
      const code = await joinRoom(
        character.nickname,
        character.animal,
        character.color,
        character.accessory
      )
      router.push(`/room/${code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建房间失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoinExisting = () => {
    if (!joinCode.trim()) return
    router.push(`/room/${joinCode.trim()}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <h1 className="text-2xl pixel-text mb-8">社团大冒险</h1>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm pixel-text">
          {error}
        </div>
      )}

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
