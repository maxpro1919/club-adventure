'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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

  // 加入或创建房间
  const joinRoom = async (
    nickname: string,
    animal: AnimalType,
    color: PlayerColor,
    accessory: Accessory
  ) => {
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

  // 加载房间和玩家
  useEffect(() => {
    if (!roomCode) {
      setLoading(false)
      return
    }

    const loadRoom = async () => {
      const { data: roomData } = await supabase
        .from('rooms')
        .select()
        .eq('code', roomCode)
        .single()

      if (roomData) {
        // 检查房间是否过期
        if (new Date(roomData.expires_at) < new Date()) {
          setRoom(null)
          setLoading(false)
          return
        }

        setRoom(roomData)

        const { data: playersData } = await supabase
          .from('players')
          .select()
          .eq('room_id', roomData.id)
          .eq('is_online', true)

        setPlayers(playersData || [])

        const playerId = getPlayerId()
        const me = playersData?.find((p) => p.id === playerId)
        if (me) setCurrentPlayer(me)

        // 设置带过滤的实时订阅
        setupSubscription(roomData.id)
      }
      setLoading(false)
    }

    loadRoom()

    // 订阅玩家变化（带 room_id 过滤）
    let channel = supabase.channel(`room:${roomCode}`)

    // loadRoom 内部获取到 roomData 后设置订阅
    const setupSubscription = (roomId: string) => {
      supabase.removeChannel(channel)
      channel = supabase
        .channel(`room:${roomCode}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        }, () => {
          loadRoom()
        })
        .subscribe()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode])

  return { room, players, currentPlayer, loading, joinRoom }
}
