'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type ChangeHandler = (payload: Record<string, unknown>) => void

export function useRealtime(
  table: string,
  filter: string | null,
  onChange: ChangeHandler
) {
  useEffect(() => {
    const channelName = `realtime:${table}:${filter || '*'}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        ...(filter ? { filter } : {}),
      }, (payload) => {
        onChange(payload as unknown as Record<string, unknown>)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, onChange])
}
