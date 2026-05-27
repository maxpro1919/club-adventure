'use client'

import { useState, useEffect } from 'react'

interface Props {
  outcome: string
  onPlayAgain: () => void
}

export default function OutcomeReveal({ outcome, onPlayAgain }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gray-900 rounded-lg pixel-border max-w-lg mx-auto">
      <h3 className="text-xl pixel-text">结局揭晓！</h3>

      <div
        className={`text-lg leading-relaxed text-center transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {outcome}
      </div>

      <div className="flex gap-4 mt-4">
        <button onClick={onPlayAgain} className="pixel-btn pixel-btn-primary">
          再来一局！
        </button>
      </div>
    </div>
  )
}
