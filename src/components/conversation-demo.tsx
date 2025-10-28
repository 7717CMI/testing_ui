'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, User } from 'lucide-react'
import { TypewriterText } from './animations/typewriter-text'

export function ConversationDemo() {
  const [step, setStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const conversation = [
    { 
      speaker: 'user', 
      text: 'Show me all hospitals in California with over 500 beds', 
      name: 'You' 
    },
    { 
      speaker: 'assistant', 
      text: 'Found 127 hospitals matching your criteria. Filtering by region...', 
      name: 'HealthData AI' 
    },
    { 
      speaker: 'user', 
      text: 'Can you generate a report with their contact details?', 
      name: 'You' 
    },
    { 
      speaker: 'assistant', 
      text: 'Report generated! Sent to your email with 127 verified contacts. ✓', 
      name: 'HealthData AI' 
    },
  ]

  useEffect(() => {
    if (step < conversation.length) {
      const timer = setTimeout(() => setStep(step + 1), 2500)
      return () => clearTimeout(timer)
    } else {
      const fadeOut = setTimeout(() => setIsVisible(false), 1000)
      const reset = setTimeout(() => {
        setStep(0)
        setIsVisible(true)
      }, 2000)
      return () => {
        clearTimeout(fadeOut)
        clearTimeout(reset)
      }
    }
  }, [step, conversation.length])

  if (!isVisible) return null

  return (
    <div className="w-full max-w-3xl mx-auto p-8 rounded-3xl bg-card border border-border shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
        <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-foreground font-semibold text-lg">AI Assistant Demo</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-muted-foreground text-sm">Live</span>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {conversation.slice(0, step).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.speaker === 'user' ? 50 : -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 100
              }}
              className={`flex gap-3 ${msg.speaker === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.speaker === 'user' 
                  ? 'bg-primary-500' 
                  : 'bg-secondary-500'
              }`}>
                {msg.speaker === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[75%] ${msg.speaker === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-muted-foreground mb-1 px-1">{msg.name}</span>
                <div
                  className={`px-6 py-4 rounded-2xl shadow-lg ${
                    msg.speaker === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-sm'
                      : 'bg-muted text-foreground border border-border rounded-tl-sm'
                  }`}
                >
                  <TypewriterText text={msg.text} delay={200} speed={25} className="text-sm leading-relaxed" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {step < conversation.length && step > 0 && step % 2 === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="px-6 py-4 rounded-2xl bg-muted border border-border flex items-center gap-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-muted-foreground/60"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-muted-foreground/60"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-muted-foreground/60"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

