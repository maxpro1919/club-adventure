'use client'

import { Room, Player } from '@/lib/types'
import CharacterDisplay from './CharacterDisplay'

interface Props {
  room: Room
  players: Player[]
  currentPlayer: Player
  onStartMatch: () => void
}

export default function RoomLobby({ room, players, currentPlayer, onStartMatch }: Props) {
  const copyInviteLink = () => {
    const url = `${window.location.origin}/room/${room.code}`
    navigator.clipboard.writeText(url)
    alert('邀请链接已复制！')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 邀请按钮 */}
      <button onClick={copyInviteLink} className="pixel-btn pixel-btn-primary self-center">
        复制邀请链接
      </button>

      {/* 玩家列表 */}
      <div className="grid grid-cols-2 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className={`p-4 bg-gray-900 rounded-lg pixel-border ${
              player.id === currentPlayer.id ? 'ring-2 ring-green-400' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <CharacterDisplay
                animal={player.animal_type}
                color={player.color}
                accessory={player.accessory}
                size={48}
              />
              <div>
                <div className="pixel-text text-sm">{player.nickname}</div>
                <div className="text-xs text-gray-400">
                  {player.is_online ? '在线' : '离线'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 空位 */}
        {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, i) => (
          <div key={i} className="p-4 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center">
            <span className="text-gray-500 pixel-text text-xs">等待加入...</span>
          </div>
        ))}
      </div>

      {/* 开始匹配按钮 */}
      {players.length >= 2 && (
        <button onClick={onStartMatch} className="pixel-btn pixel-btn-primary self-center text-lg px-8 py-3">
          开始冒险！
        </button>
      )}

      {players.length < 2 && (
        <p className="text-center text-gray-400 pixel-text text-xs">
          需要至少 2 人才能开始
        </p>
      )}
    </div>
  )
}
