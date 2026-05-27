'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Match, Card } from '@/lib/types'
import { getRandomCard } from '@/lib/cards'

export function useMatch(roomId: string | null, playerId: string | null) {
  const [match, setMatch] = useState<Match | null>(null)
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [myChoice, setMyChoice] = useState<string | null>(null)

  // 发起对局
  const startMatch = async (opponentId: string) => {
    if (!roomId || !playerId) return

    const card = getRandomCard()

    const { data, error } = await supabase
      .from('matches')
      .insert({
        room_id: roomId,
        card_id: card.id,
        player1_id: playerId,
        player2_id: opponentId,
        status: 'waiting',
      })
      .select()
      .single()

    if (error) throw error

    setMatch(data)
    setCurrentCard(card)
    setMyChoice(null)
  }

  // 选择行动
  const makeChoice = async (choice: 'A' | 'B' | 'C') => {
    if (!match || !playerId) return

    setMyChoice(choice)

    const isPlayer1 = match.player1_id === playerId
    const updateField = isPlayer1 ? 'player1_choice' : 'player2_choice'

    await supabase
      .from('matches')
      .update({ [updateField]: choice })
      .eq('id', match.id)
  }

  // 监听对局状态
  useEffect(() => {
    if (!match) return

    const channel = supabase
      .channel(`match:${match.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${match.id}`,
      }, (payload) => {
        const updated = payload.new as Match
        setMatch(updated)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [match?.id])

  // 获取结局
  const getOutcome = (): string | null => {
    if (!match || !currentCard) return null
    if (match.status !== 'revealed') return null
    if (!match.player1_choice || !match.player2_choice) return null

    const key = match.player1_choice + match.player2_choice
    return currentCard.outcomes[key] || null
  }

  // 检查双方是否都选了
  useEffect(() => {
    if (!match) return
    if (match.player1_choice && match.player2_choice && match.status === 'waiting') {
      // 更新状态为 revealed
      supabase
        .from('matches')
        .update({ status: 'revealed' })
        .eq('id', match.id)
    }
  }, [match?.player1_choice, match?.player2_choice, match?.status])

  const resetMatch = () => {
    setMatch(null)
    setCurrentCard(null)
    setMyChoice(null)
  }

  return {
    match,
    currentCard,
    myChoice,
    startMatch,
    makeChoice,
    getOutcome,
    resetMatch,
  }
}
