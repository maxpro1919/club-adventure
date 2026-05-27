'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { useMatch } from '@/hooks/useMatch'
import RoomLobby from '@/components/RoomLobby'
import MatchArena from '@/components/MatchArena'
import CharacterCreator from '@/components/CharacterCreator'
import { AnimalType, PlayerColor, Accessory } from '@/lib/types'

export default function RoomPage() {
  const params = useParams()
  const code = params.code as string
  const { room, players, currentPlayer, loading, error: roomError, joinRoom } = useRoom(code)
  const {
    match,
    currentCard,
    myChoice,
    error: matchError,
    startMatch,
    makeChoice,
    getOutcome,
    resetMatch,
  } = useMatch(room?.id ?? null, currentPlayer?.id ?? null)
  const [joinError, setJoinError] = useState<string | null>(null)

  if (loading) return <div className="text-white text-center mt-20 pixel-text">加载中...</div>
  if (!room) return <div className="text-white text-center mt-20 pixel-text">房间不存在或已过期</div>

  if (!currentPlayer) {
    const handleCharacterComplete = async (character: {
      nickname: string
      animal: AnimalType
      color: PlayerColor
      accessory: Accessory
    }) => {
      setJoinError(null)
      try {
        await joinRoom(
          character.nickname,
          character.animal,
          character.color,
          character.accessory
        )
      } catch (err) {
        setJoinError(err instanceof Error ? err.message : '加入房间失败')
      }
    }

    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <h1 className="text-2xl pixel-text mb-8">社团大冒险</h1>

        {joinError && (
          <div className="mb-4 px-4 py-2 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm pixel-text">
            {joinError}
          </div>
        )}

        <CharacterCreator onComplete={handleCharacterComplete} />
      </main>
    )
  }

  const handleStartMatch = () => {
    const opponent = players.find((p) => p.id !== currentPlayer.id)
    if (opponent) {
      startMatch(opponent.id)
    }
  }

  const handlePlayAgain = () => {
    resetMatch()
  }

  const opponent = players.find((p) => p.id !== currentPlayer.id) ?? null
  const outcome = getOutcome()

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl pixel-text">社团大冒险</h1>
          <div className="pixel-border px-4 py-2">
            <span className="pixel-text text-sm">房间: {code}</span>
          </div>
        </div>

        {(roomError || matchError) && (
          <div className="mb-4 px-4 py-2 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm pixel-text">
            {roomError || matchError}
          </div>
        )}

        {match ? (
          <MatchArena
            match={match}
            currentCard={currentCard}
            myChoice={myChoice}
            outcome={outcome}
            onSelect={makeChoice}
            onPlayAgain={handlePlayAgain}
            opponent={opponent}
            currentPlayer={currentPlayer}
          />
        ) : (
          <RoomLobby
            room={room}
            players={players}
            currentPlayer={currentPlayer}
            onStartMatch={handleStartMatch}
          />
        )}
      </div>
    </main>
  )
}
