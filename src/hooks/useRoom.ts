'use client'

import { useState, useEffect, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import { getPlayerId } from '@/lib/player'
import { Room, Player, AnimalType, PlayerColor, Accessory } from '@/lib/types'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function useRoom(roomCode: string | null) {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加入或创建房间
  const joinRoom = async (
    nickname: string,
    animal: AnimalType,
    color: PlayerColor,
    accessory: Accessory
  ) => {
    const supabase = getSupabase()
    const playerId = getPlayerId()

    // 如果没有 roomCode，创建新房间
    let targetRoom: Room
    if (!roomCode) {
      const code = generateRoomCode()
      const { data, error } = await supabase
        .from('rooms')
        .insert({ code })
        .select()
        .single()
      if (error) throw error
      targetRoom = data
    } else {
      const { data, error } = await supabase
        .from('rooms')
        .select()
        .eq('code', roomCode)
        .single()
      if (error) throw error
      targetRoom = data

      // 检查房间是否过期
      if (new Date(targetRoom.expires_at) < new Date()) {
        throw new Error('房间已过期')
      }

      // 检查房间容量（最多8人）
      const { count } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', targetRoom.id)
        .eq('is_online', true)

      if (count && count >= 8) {
        throw new Error('房间已满（最多8人）')
      }
    }

    // 创建玩家记录
    const { data: player, error: playerError } = await supabase
      .from('players')
      .upsert({
        id: playerId,
        room_id: targetRoom.id,
        nickname,
        animal_type: animal,
        color,
        accessory,
        is_online: true,
      })
      .select()
      .single()

    if (playerError) throw playerError

    setRoom(targetRoom)
    setCurrentPlayer(player)
    return targetRoom.code
  }

  // Effect 1: 加载房间数据
  useEffect(() => {
    if (!roomCode) {
      setRoom(null)
      setPlayers([])
      setCurrentPlayer(null)
      setLoading(false)
      return
    }

    let cancelled = false

    const loadRoom = async () => {
      setLoading(true)
      setError(null)

      try {
        const supabase = getSupabase()

        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select()
          .eq('code', roomCode)
          .single()

        if (cancelled) return

        if (roomError || !roomData) {
          setRoom(null)
          return
        }

        // 检查房间是否过期
        if (new Date(roomData.expires_at) < new Date()) {
          setRoom(null)
          return
        }

        setRoom(roomData)

        const { data: playersData } = await supabase
          .from('players')
          .select()
          .eq('room_id', roomData.id)
          .eq('is_online', true)

        if (cancelled) return

        setPlayers(playersData || [])

        const playerId = getPlayerId()
        const me = playersData?.find((p) => p.id === playerId)
        if (me) setCurrentPlayer(me)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载房间失败')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRoom()

    return () => {
      cancelled = true
    }
  }, [roomCode])

  // Effect 2: Realtime 订阅（依赖 room.id 而非整个 room 对象）
  const roomIdRef = useRef<string | null>(null)
  roomIdRef.current = room?.id ?? null

  useEffect(() => {
    const roomId = roomIdRef.current
    if (!roomId || !roomCode) return

    const supabase = getSupabase()

    const channel = supabase
      .channel(`room:${roomCode}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      }, async () => {
        // 收到变更时重新加载数据
        const currentRoomId = roomIdRef.current
        if (!currentRoomId) return

        try {
          const { data: playersData } = await supabase
            .from('players')
            .select()
            .eq('room_id', currentRoomId)
            .eq('is_online', true)

          if (playersData) {
            setPlayers(playersData)
            const playerId = getPlayerId()
            const me = playersData.find((p) => p.id === playerId)
            if (me) setCurrentPlayer(me)
          }
        } catch {
          // realtime 刷新失败不中断流程
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room?.id, roomCode])

  return { room, players, currentPlayer, loading, error, joinRoom }
}
