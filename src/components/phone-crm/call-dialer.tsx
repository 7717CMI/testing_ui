'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, PhoneOff, Mic, MicOff, Pause, Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePhoneCRMStore } from '@/stores/phone-crm-store'
import { toast } from 'sonner'

interface CallDialerProps {
  leadId?: string
  phoneNumber?: string
  leadName?: string
}

export function CallDialer({ leadId, phoneNumber: initialPhoneNumber, leadName }: CallDialerProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '')
  
  // Update phone number when prop changes
  useEffect(() => {
    if (initialPhoneNumber) {
      setPhoneNumber(initialPhoneNumber)
    }
  }, [initialPhoneNumber])
  const [isInitializing, setIsInitializing] = useState(false)
  const [isTwilioConfigured, setIsTwilioConfigured] = useState<boolean | null>(null) // null = checking, true = configured, false = not configured
  const [connection, setConnection] = useState<any>(null)
  const [callDuration, setCallDuration] = useState(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const {
    device,
    setDevice,
    activeCall,
    isCalling,
    isMuted,
    isOnHold,
    initiateCall,
    endCall,
    updateCallStatus,
    updateCallDuration,
    toggleMute,
    toggleHold,
    setActiveCall,
    setIsCalling,
  } = usePhoneCRMStore()

  // Check Twilio configuration and initialize device
  useEffect(() => {
    const checkAndInitialize = async () => {
      if (device) {
        console.log('[CallDialer] Device already initialized')
        setIsTwilioConfigured(true)
        return // Device already initialized
      }

      console.log('[CallDialer] Starting initialization...')
      setIsInitializing(true)
      setIsTwilioConfigured(null) // Checking status

      // Add overall timeout to prevent infinite hanging
      const overallTimeout = setTimeout(() => {
        console.error('[CallDialer] Overall initialization timeout after 15 seconds')
        toast.error('Device initialization timed out. Check browser console for details.')
        setIsInitializing(false)
        setIsTwilioConfigured(false)
      }, 15000)

      try {
        console.log('[CallDialer] Step 1: Calling token API...')
        // First, check if Twilio is configured by calling the token API
        const response = await fetch('/api/phone-crm/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }),
        })

        console.log('[CallDialer] Token API response status:', response.status)
        const data = await response.json()
        console.log('[CallDialer] Token API response data:', { success: data.success, hasToken: !!data.token, error: data.error })

        // Check if Twilio is not configured
        if (!response.ok || !data.success) {
          clearTimeout(overallTimeout)
          const errorMessage = data.error || 'Unknown error'
          console.error('[CallDialer] Token API failed:', errorMessage)
          
          if (errorMessage.includes('Twilio configuration is missing') || 
              errorMessage.includes('environment variables')) {
            // Twilio is not configured - this is expected, don't show error
            console.warn('[CallDialer] Twilio not configured')
            setIsTwilioConfigured(false)
            setIsInitializing(false)
            return // Exit gracefully
          }
          
          // Other errors - log but don't throw
          console.error('[CallDialer] Token API error:', errorMessage)
          toast.error(`Token API error: ${errorMessage}`)
          setIsTwilioConfigured(false)
          setIsInitializing(false)
          return
        }

        if (!data.token) {
          clearTimeout(overallTimeout)
          console.error('[CallDialer] No token in response')
          toast.error('No token received from API')
          setIsTwilioConfigured(false)
          setIsInitializing(false)
          return
        }

        // Twilio is configured, proceed with initialization
        console.log('[CallDialer] Step 2: Token received, importing Twilio SDK...')
        setIsTwilioConfigured(true)
        
        // Dynamically import Twilio Voice SDK
        const { Device } = await import('@twilio/voice-sdk')
        console.log('[CallDialer] Step 3: Twilio SDK imported, creating device...')

        const { token } = data

        // Create Twilio Device
        const newDevice = new Device(token, {
          logLevel: 1, // Enable verbose logging
          codecPreferences: ['opus', 'pcmu'],
        })

        console.log('[CallDialer] Step 4: Device created, setting up event handlers...')

        // Add device initialization timeout
        const deviceTimeout = setTimeout(() => {
          console.warn('[CallDialer] Device ready event timeout after 10 seconds')
          console.warn('[CallDialer] Browser-based calling unavailable, but server-side calling will work')
          // Don't show error - server-side calling works without device
          // Just mark as configured but device not ready
          setIsInitializing(false)
          setIsTwilioConfigured(true) // Still configured, just device not ready
          // Don't set device, so we'll use server-side calling
        }, 10000)

        // Device event handlers
        newDevice.on('ready', () => {
          clearTimeout(overallTimeout)
          clearTimeout(deviceTimeout)
          console.log('[CallDialer] ✅ Device ready event fired!')
          setDevice(newDevice)
          setIsInitializing(false)
          toast.success('Calling device ready')
        })

        newDevice.on('error', (error: any) => {
          clearTimeout(overallTimeout)
          clearTimeout(deviceTimeout)
          console.error('[CallDialer] ❌ Device error event:', error)
          toast.error(`Device error: ${error.message || error.code || 'Unknown error'}`)
          setIsInitializing(false)
          setIsTwilioConfigured(false)
        })

        newDevice.on('offline', () => {
          console.log('[CallDialer] Device offline')
        })

        newDevice.on('incoming', (conn: any) => {
          console.log('[CallDialer] Incoming call:', conn)
          // Handle incoming calls if needed
        })

        newDevice.on('tokenWillExpire', async () => {
          console.log('[CallDialer] Token expiring, refreshing...')
          // Refresh token
          const refreshResponse = await fetch('/api/phone-crm/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identity: `user-${Date.now()}`,
            }),
          })
          const refreshData = await refreshResponse.json()
          if (refreshData.success && refreshData.token) {
            newDevice.updateToken(refreshData.token)
          }
        })

        console.log('[CallDialer] Step 5: Waiting for device ready event...')
      } catch (error: any) {
        clearTimeout(overallTimeout)
        // Network or other errors
        console.error('[CallDialer] ❌ Exception during initialization:', error)
        toast.error(`Initialization failed: ${error.message || 'Unknown error'}`)
        setIsTwilioConfigured(false)
        setIsInitializing(false)
      }
    }

    checkAndInitialize()

    // Cleanup
    return () => {
      if (device) {
        device.destroy()
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Start call duration timer
  useEffect(() => {
    if (isCalling && activeCall) {
      durationIntervalRef.current = setInterval(() => {
        const duration = Math.floor(
          (new Date().getTime() - activeCall.startedAt.getTime()) / 1000
        )
        setCallDuration(duration)
        updateCallDuration(activeCall.id, duration)
      }, 1000)
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
      setCallDuration(0)
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [isCalling, activeCall, updateCallDuration])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCall = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number')
      return
    }

    // Note: We use server-side calling, so device is optional
    // Browser-based calling requires device, but server-side doesn't
    if (!device && isInitializing) {
      toast.error('Please wait for initialization to complete...')
      return
    }

    // leadId is optional for server-side calling
    // if (!leadId) {
    //   toast.error('Lead ID is required')
    //   return
    // }

    try {
      // Format phone number (ensure it starts with +)
      const formattedNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+1${phoneNumber.replace(/\D/g, '')}`

      // Create call via API first to get callSid
      const callResponse = await fetch('/api/phone-crm/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formattedNumber,
          leadId,
          record: true,
        }),
      })

      const callData = await callResponse.json()

      if (!callData.success) {
        throw new Error(callData.error || 'Failed to initiate call')
      }

      // Create call in store
      const callId = initiateCall(leadId, formattedNumber, callData.callSid)
      updateCallStatus(callId, 'ringing')

      // Connect using Twilio Device (for browser-based calling)
      // Note: This is optional - you can also just use server-side calling
      // For now, we'll use server-side calling via API
      toast.success('Call initiated')
    } catch (error: any) {
      console.error('Call error:', error)
      toast.error(`Failed to make call: ${error.message}`)
      if (activeCall) {
        updateCallStatus(activeCall.id, 'failed')
        endCall(activeCall.id)
      }
    }
  }

  const handleEndCall = () => {
    if (activeCall) {
      if (connection) {
        connection.disconnect()
        setConnection(null)
      }
      endCall(activeCall.id)
      toast.success('Call ended')
    }
  }

  const handleMute = () => {
    if (connection) {
      if (isMuted) {
        connection.mute(false)
      } else {
        connection.mute(true)
      }
    }
    toggleMute()
  }

  const handleHold = () => {
    if (connection) {
      if (isOnHold) {
        connection.reject()
      } else {
        // Hold functionality
      }
    }
    toggleHold()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Make a Call
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leadName && (
          <div className="text-sm text-muted-foreground">
            Calling: <span className="font-medium text-foreground">{leadName}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Number</label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            disabled={isCalling || isInitializing}
          />
        </div>

        {isCalling && activeCall && (
          <div className="flex items-center justify-center gap-4 p-4 bg-primary/5 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatDuration(callDuration)}</div>
              <div className="text-xs text-muted-foreground">
                {activeCall.status === 'ringing' && 'Ringing...'}
                {activeCall.status === 'in-progress' && 'In Progress'}
                {activeCall.status === 'completed' && 'Completed'}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isCalling ? (
            <Button
              onClick={handleCall}
              disabled={!phoneNumber.trim() || isInitializing || isTwilioConfigured === false}
              className="flex-1"
              size="lg"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleMute}
                variant={isMuted ? 'destructive' : 'outline'}
                size="lg"
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleHold}
                variant={isOnHold ? 'destructive' : 'outline'}
                size="lg"
              >
                {isOnHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleEndCall}
                variant="destructive"
                size="lg"
                className="flex-1"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </Button>
            </>
          )}
        </div>

        {isInitializing && (
          <p className="text-xs text-muted-foreground text-center">
            Setting up calling device... (Server-side calling will work even if this times out)
          </p>
        )}

        {!isInitializing && isTwilioConfigured === true && !device && (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Browser-based calling is unavailable, but you can still make calls using server-side calling (which works without the device).
            </p>
          </div>
        )}

        {isTwilioConfigured === false && !isInitializing && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Phone className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Twilio Not Configured
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  To enable phone calling, please configure your Twilio credentials in <code className="text-xs bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded">.env.local</code>
                </p>
                <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                  <p className="font-medium">Required environment variables:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li><code>TWILIO_ACCOUNT_SID</code></li>
                    <li><code>TWILIO_AUTH_TOKEN</code></li>
                    <li><code>TWILIO_PHONE_NUMBER</code></li>
                    <li><code>TWILIO_API_KEY_SID</code></li>
                    <li><code>TWILIO_API_KEY_SECRET</code></li>
                    <li><code>TWILIO_APP_SID</code></li>
                  </ul>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  See <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 py-0.5 rounded">PHONE_CRM_SETUP.md</code> for detailed setup instructions.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

