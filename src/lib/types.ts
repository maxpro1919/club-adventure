export interface Room {
  id: string
  code: string
  created_at: string
  expires_at: string
}

export interface Player {
  id: string
  room_id: string
  nickname: string
  animal_type: AnimalType
  color: PlayerColor
  accessory: Accessory
  is_online: boolean
  joined_at: string
}

export interface Card {
  id: string
  title: string
  description: string
  options: CardOption[]
  outcomes: Record<string, string>
}

export interface CardOption {
  id: 'A' | 'B' | 'C'
  text: string
  emoji: string
}

export interface Match {
  id: string
  room_id: string
  card_id: string
  player1_id: string
  player2_id: string
  player1_choice: 'A' | 'B' | 'C' | null
  player2_choice: 'A' | 'B' | 'C' | null
  status: 'waiting' | 'revealed'
  created_at: string
}

export type AnimalType = 'cat' | 'dog' | 'rabbit' | 'bear' | 'fox' | 'penguin'
export type PlayerColor = 'default' | 'pink' | 'blue'
export type Accessory = 'none' | 'hat' | 'glasses'

export const ANIMALS: { type: AnimalType; name: string; emoji: string }[] = [
  { type: 'cat', name: '猫', emoji: '🐱' },
  { type: 'dog', name: '狗', emoji: '🐶' },
  { type: 'rabbit', name: '兔子', emoji: '🐰' },
  { type: 'bear', name: '熊', emoji: '🐻' },
  { type: 'fox', name: '狐狸', emoji: '🦊' },
  { type: 'penguin', name: '企鹅', emoji: '🐧' },
]

export const COLORS: { value: PlayerColor; name: string; hex: string }[] = [
  { value: 'default', name: '默认', hex: '#8B8B8B' },
  { value: 'pink', name: '粉色', hex: '#FFB6C1' },
  { value: 'blue', name: '蓝色', hex: '#87CEEB' },
]

export const ACCESSORIES: { value: Accessory; name: string; emoji: string }[] = [
  { value: 'none', name: '无', emoji: '' },
  { value: 'hat', name: '帽子', emoji: '🎩' },
  { value: 'glasses', name: '眼镜', emoji: '👓' },
]
