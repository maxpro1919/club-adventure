'use client'

import { useState } from 'react'
import { AnimalType, PlayerColor, Accessory, ANIMALS, COLORS, ACCESSORIES } from '@/lib/types'
import CharacterDisplay from './CharacterDisplay'

interface Props {
  onComplete: (character: {
    nickname: string
    animal: AnimalType
    color: PlayerColor
    accessory: Accessory
  }) => void
}

export default function CharacterCreator({ onComplete }: Props) {
  const [nickname, setNickname] = useState('')
  const [animal, setAnimal] = useState<AnimalType>('cat')
  const [color, setColor] = useState<PlayerColor>('default')
  const [accessory, setAccessory] = useState<Accessory>('none')

  const handleSubmit = () => {
    if (!nickname.trim()) return
    onComplete({ nickname: nickname.trim(), animal, color, accessory })
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gray-900 rounded-lg pixel-border">
      <h2 className="text-xl pixel-text">创建你的角色</h2>

      {/* 预览 */}
      <div className="p-4 bg-gray-800 rounded">
        <CharacterDisplay animal={animal} color={color} accessory={accessory} size={96} />
      </div>

      {/* 昵称 */}
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="起个名字..."
        maxLength={20}
        className="pixel-input w-64"
      />

      {/* 动物选择 */}
      <div className="flex gap-2">
        {ANIMALS.map((a) => (
          <button
            key={a.type}
            onClick={() => setAnimal(a.type)}
            className={`pixel-btn ${animal === a.type ? 'pixel-btn-active' : ''}`}
          >
            {a.emoji}
          </button>
        ))}
      </div>

      {/* 颜色选择 */}
      <div className="flex gap-2">
        {COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => setColor(c.value)}
            className={`w-8 h-8 rounded pixel-border ${color === c.value ? 'ring-2 ring-white' : ''}`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>

      {/* 配饰选择 */}
      <div className="flex gap-2">
        {ACCESSORIES.map((acc) => (
          <button
            key={acc.value}
            onClick={() => setAccessory(acc.value)}
            className={`pixel-btn ${accessory === acc.value ? 'pixel-btn-active' : ''}`}
          >
            {acc.emoji || '❌'}
          </button>
        ))}
      </div>

      {/* 确认 */}
      <button
        onClick={handleSubmit}
        disabled={!nickname.trim()}
        className="pixel-btn pixel-btn-primary w-64"
      >
        进入房间！
      </button>
    </div>
  )
}
