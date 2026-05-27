'use client'

import { Card } from '@/lib/types'

interface Props {
  card: Card
  onSelect: (choice: 'A' | 'B' | 'C') => void
  disabled: boolean
  selectedChoice: string | null
}

export default function EventCard({ card, onSelect, disabled, selectedChoice }: Props) {
  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-900 rounded-lg pixel-border max-w-lg mx-auto">
      <h3 className="text-lg pixel-text text-center">{card.title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{card.description}</p>

      <div className="flex flex-col gap-3 mt-2">
        {card.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={`pixel-btn text-left flex items-center gap-3 ${
              selectedChoice === option.id ? 'pixel-btn-active' : ''
            }`}
          >
            <span className="text-xl">{option.emoji}</span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>

      {selectedChoice && (
        <p className="text-center text-yellow-400 pixel-text text-xs mt-2">
          你选了 {selectedChoice}，等待队友选择...
        </p>
      )}
    </div>
  )
}
