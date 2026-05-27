'use client'

import { useState, useEffect, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Match, Card } from '@/lib/types'
import { getRandomCard } from '@/lib/cards'

export function useMatch(roomId: string | null, playerId: string | null) {
  const [match, setMatch] = useState<Match | null>(null)
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [myChoice, setMyChoice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 用 ref 持有最新 match，避免 realtime 回调依赖整个 match 对象
  const matchRef = useRef(match)
  matchRef.current = match

  // 防止 revealed 状态重复更新
  const updatingRef = useRef(false)

  // 发起对局
  const startMatch = async (opponentId: string) => {
    if (!roomId || !playerId) return

    const supabase = getSupabase()
    const card = getRandomCard()

    // 按字典序排序玩家 ID，避免 player1/player2 顺序歧义
    const [p1, p2] = [playerId, opponentId].sort()

    const { data, error } = await supabase
      .from('matches')
      .insert({
        room_id: roomId,
        card_id: card.id,
        player1_id: p1,
        player2_id: p2,
        status: 'waiting',
      })
      .select()
      .single()

    if (error) throw error

    setMatch(data)
    setCurrentCard(card)
    setMyChoice(null)
    setError(null)
  }

  // 选择行动
  const makeChoice = async (choice: 'A' | 'B' | 'C') => {
    if (!match || !playerId) return

    const previousChoice = myChoice
    setMyChoice(choice)
    setError(null)

    const supabase = getSupabase()
    const isPlayer1 = match.player1_id === playerId
    const updateField = isPlayer1 ? 'player1_choice' : 'player2_choice'

    const { error: updateError } = await supabase
      .from('matches')
      .update({ [updateField]: choice })
      .eq('id', match.id)

    if (updateError) {
      // 回滚乐观更新
      setMyChoice(previousChoice)
      setError('选择失败，请重试')
    }
  }

  // 监听对局状态 — 只依赖 match.id
  useEffect(() => {
    if (!match?.id) return

    const supabase = getSupabase()

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

  // 检查双方是否都选了 — 用 updatingRef 防止重复触发
  useEffect(() => {
    const currentMatch = matchRef.current
    if (!currentMatch) return
    if (currentMatch.player1_choice && currentMatch.player2_choice && currentMatch.status === 'waiting') {
      if (updatingRef.current) return
      updatingRef.current = true

      const supabase = getSupabase()
      Promise.resolve(
        supabase
          .from('matches')
          .update({ status: 'revealed' })
          .eq('id', currentMatch.id)
      ).then(() => {
        updatingRef.current = false
      }).catch(() => {
        updatingRef.current = false
      })
    }
  }, [match?.player1_choice, match?.player2_choice, match?.status])

  const resetMatch = () => {
    setMatch(null)
    setCurrentCard(null)
    setMyChoice(null)
    setError(null)
  }

  return {
    match,
    currentCard,
    myChoice,
    error,
    startMatch,
    makeChoice,
    getOutcome,
    resetMatch,
  }
}
