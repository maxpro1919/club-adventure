'use client'

import { useParams } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { useMatch } from '@/hooks/useMatch'
import RoomLobby from '@/components/RoomLobby'
import MatchArena from '@/components/MatchArena'

export default function RoomPage() {
  const params = useParams()
  const code = params.code as string
  const { room, players, currentPlayer, loading } = useRoom(code)
  const {
    match,
    currentCard,
    myChoice,
    startMatch,
    makeChoice,
    getOutcome,
    resetMatch,
  } = useMatch(room?.id ?? null, currentPlayer?.id ?? null)

  if (loading) return <div className="text-white text-center mt-20 pixel-text">加载中...</div>
  if (!room) return <div className="text-white text-center mt-20 pixel-text">房间不存在</div>
  if (!currentPlayer) return <div className="text-white text-center mt-20 pixel-text">请先创建角色</div>

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

        {match ? (
          <MatchArena
            match={match}
            currentCard={currentCard}
            myChoice={myChoice}
            outcome={outcome}
            onSelect={makeChoice}
            onPlayAgain={handlePlayAgain}
            opponent={opponent}
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
