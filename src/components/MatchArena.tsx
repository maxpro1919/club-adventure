'use client'

import { Match, Card, Player } from '@/lib/types'
import EventCard from './EventCard'
import OutcomeReveal from './OutcomeReveal'

interface Props {
  match: Match | null
  currentCard: Card | null
  myChoice: string | null
  outcome: string | null
  onSelect: (choice: 'A' | 'B' | 'C') => void
  onPlayAgain: () => void
  opponent: Player | null
  currentPlayer: Player | null
}

export default function MatchArena({
  match,
  currentCard,
  myChoice,
  outcome,
  onSelect,
  onPlayAgain,
  opponent,
  currentPlayer,
}: Props) {
  // 结局揭晓
  if (outcome) {
    return (
      <OutcomeReveal
        outcome={outcome}
        onPlayAgain={onPlayAgain}
        currentPlayer={currentPlayer}
        opponent={opponent}
      />
    )
  }

  // 等待匹配中
  if (!match || !currentCard) {
    return (
      <div className="text-center pixel-text text-gray-400">
        等待对手加入...
      </div>
    )
  }

  // 选卡阶段
  return (
    <div className="flex flex-col gap-4">
      {opponent && (
        <p className="text-center text-gray-400 pixel-text text-xs">
          对手: {opponent.nickname}
        </p>
      )}
      <EventCard
        card={currentCard}
        onSelect={onSelect}
        disabled={!!myChoice}
        selectedChoice={myChoice}
      />
    </div>
  )
}
