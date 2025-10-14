'use client'

import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCallStore } from '@/lib/store/call-store'
import { cn } from '@/lib/utils'

interface CallButtonProps {
  facilityId: string
  facilityName: string
  phoneNumber: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function CallButton({
  facilityId,
  facilityName,
  phoneNumber,
  className,
  variant = 'default',
  size = 'default',
}: CallButtonProps) {
  const { initiateCall, activeCall } = useCallStore()

  function handleCall(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    if (activeCall) {
      // Don't allow initiating new call if one is active
      return
    }

    initiateCall(facilityId, facilityName, phoneNumber)
  }

  const isDisabled = !!activeCall

  return (
    <Button
      onClick={handleCall}
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={cn(
        'gap-2 transition-all hover:scale-105 active:scale-95',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Phone className="h-4 w-4" />
      <span>Call</span>
    </Button>
  )
}

