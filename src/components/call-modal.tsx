'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCallStore } from '@/lib/store/call-store'

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`
}

function CallWaveform() {
  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 bg-primary-500 rounded-full"
          initial={{ height: '20%' }}
          animate={{ height: ['20%', '100%', '20%'] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function CallModal() {
  const { activeCall, endCall, updateCallStatus } = useCallStore()
  const [duration, setDuration] = useState(0)
  const [cost, setCost] = useState(0)
  const isOpen = !!activeCall

  useEffect(() => {
    if (!activeCall || activeCall.status !== 'connected') {
      setDuration(0)
      setCost(0)
      return
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeCall.startTime.getTime()) / 1000)
      setDuration(elapsed)
      setCost(elapsed * 0.02) // $0.02 per second
    }, 1000)

    return () => clearInterval(interval)
  }, [activeCall])

  function handleEndCall() {
    endCall()
  }

  function handleClose() {
    if (activeCall && activeCall.status === 'connected') {
      // Don't allow closing during active call
      return
    }
    endCall()
  }

  if (!activeCall) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-heavy max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Call in Progress</span>
            {activeCall.status !== 'connected' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Facility Info */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
              <Phone className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold">{activeCall.facilityName}</h3>
            <p className="text-sm text-muted-foreground">{activeCall.phoneNumber}</p>
          </div>

          {/* Call Status */}
          <div className="text-center space-y-4">
            <AnimatePresence mode="wait">
              {activeCall.status === 'connecting' && (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Connecting...</p>
                  </div>
                </motion.div>
              )}

              {activeCall.status === 'ringing' && (
                <motion.div
                  key="ringing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 pulse-glow" />
                    <p className="text-sm text-muted-foreground">Ringing...</p>
                  </div>
                </motion.div>
              )}

              {activeCall.status === 'connected' && (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Connected
                    </p>
                  </div>

                  <CallWaveform />

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold counter-animate">
                        {formatDuration(duration)}
                      </p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold counter-animate text-primary-600 dark:text-primary-400">
                        {formatCost(cost)}
                      </p>
                      <p className="text-xs text-muted-foreground">Cost</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleEndCall}
              size="lg"
              variant="destructive"
              className="rounded-full h-14 w-14 p-0"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-xs text-muted-foreground">
            Rate: $0.02/second
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

