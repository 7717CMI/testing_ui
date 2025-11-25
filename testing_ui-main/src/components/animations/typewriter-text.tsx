'use client'

import { useState, useEffect } from 'react'

interface TypewriterTextProps {
  text: string
  delay?: number
  speed?: number
  className?: string
  onComplete?: () => void
}

export function TypewriterText({ 
  text, 
  delay = 0, 
  speed = 30, 
  className = '',
  onComplete 
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [startTyping, setStartTyping] = useState(false)

  useEffect(() => {
    const delayTimer = setTimeout(() => setStartTyping(true), delay)
    return () => clearTimeout(delayTimer)
  }, [delay])

  useEffect(() => {
    if (!startTyping) return

    let currentIndex = 0
    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(timer)
        if (onComplete) onComplete()
      }
    }, speed)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, startTyping])

  return <span className={className}>{displayText}</span>
}









