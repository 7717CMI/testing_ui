import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Call {
  id: string
  callSid?: string
  leadId: string
  phoneNumber: string
  direction: 'outbound' | 'inbound'
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'no-answer' | 'busy' | 'canceled'
  duration: number // seconds
  startedAt: Date
  endedAt: Date | null
  recordingUrl?: string
  recordingSid?: string
  notes?: string
  outcome?: 'connected' | 'voicemail' | 'busy' | 'no-answer' | 'failed' | 'canceled'
  cost?: number
  costUnit?: string
}

interface PhoneCRMState {
  calls: Call[]
  activeCall: Call | null
  isCalling: boolean
  isMuted: boolean
  isOnHold: boolean
  device: any | null // Twilio Device instance

  // Actions
  setDevice: (device: any) => void
  initiateCall: (leadId: string, phoneNumber: string, callSid?: string) => string
  endCall: (callId: string) => void
  updateCallStatus: (callId: string, status: Call['status']) => void
  updateCallDuration: (callId: string, duration: number) => void
  addCallNote: (callId: string, notes: string) => void
  setCallOutcome: (callId: string, outcome: Call['outcome']) => void
  setRecording: (callId: string, recordingUrl: string, recordingSid?: string) => void
  toggleMute: () => void
  toggleHold: () => void
  setActiveCall: (call: Call | null) => void
  setIsCalling: (isCalling: boolean) => void
  
  // Queries
  getCallHistory: (leadId?: string) => Call[]
  getCallStats: () => {
    totalCalls: number
    connectedCalls: number
    averageDuration: number
    successRate: number
    totalDuration: number
  }
  getCallById: (callId: string) => Call | undefined
  getCallsByLead: (leadId: string) => Call[]
}

export const usePhoneCRMStore = create<PhoneCRMState>()(
  persist(
    (set, get) => ({
      calls: [],
      activeCall: null,
      isCalling: false,
      isMuted: false,
      isOnHold: false,
      device: null,

      setDevice: (device) => {
        set({ device })
      },

      initiateCall: (leadId, phoneNumber, callSid) => {
        const id = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const call: Call = {
          id,
          callSid,
          leadId,
          phoneNumber,
          direction: 'outbound',
          status: 'initiated',
          duration: 0,
          startedAt: new Date(),
          endedAt: null,
        }

        set((state) => ({
          calls: [...state.calls, call],
          activeCall: call,
          isCalling: true,
        }))

        return id
      },

      endCall: (callId) => {
        set((state) => {
          const call = state.calls.find((c) => c.id === callId)
          if (call) {
            const duration = call.endedAt
              ? Math.floor((call.endedAt.getTime() - call.startedAt.getTime()) / 1000)
              : Math.floor((new Date().getTime() - call.startedAt.getTime()) / 1000)

            return {
              calls: state.calls.map((c) =>
                c.id === callId
                  ? {
                      ...c,
                      status: c.status === 'in-progress' ? 'completed' : c.status,
                      endedAt: new Date(),
                      duration,
                    }
                  : c
              ),
              activeCall: state.activeCall?.id === callId ? null : state.activeCall,
              isCalling: false,
              isMuted: false,
              isOnHold: false,
            }
          }
          return state
        })
      },

      updateCallStatus: (callId, status) => {
        set((state) => ({
          calls: state.calls.map((c) =>
            c.id === callId ? { ...c, status } : c
          ),
          activeCall:
            state.activeCall?.id === callId
              ? { ...state.activeCall, status }
              : state.activeCall,
        }))
      },

      updateCallDuration: (callId, duration) => {
        set((state) => ({
          calls: state.calls.map((c) =>
            c.id === callId ? { ...c, duration } : c
          ),
          activeCall:
            state.activeCall?.id === callId
              ? { ...state.activeCall, duration }
              : state.activeCall,
        }))
      },

      addCallNote: (callId, notes) => {
        set((state) => ({
          calls: state.calls.map((c) =>
            c.id === callId ? { ...c, notes } : c
          ),
        }))
      },

      setCallOutcome: (callId, outcome) => {
        set((state) => ({
          calls: state.calls.map((c) =>
            c.id === callId ? { ...c, outcome } : c
          ),
        }))
      },

      setRecording: (callId, recordingUrl, recordingSid) => {
        set((state) => ({
          calls: state.calls.map((c) =>
            c.id === callId
              ? { ...c, recordingUrl, recordingSid }
              : c
          ),
        }))
      },

      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted }))
      },

      toggleHold: () => {
        set((state) => ({ isOnHold: !state.isOnHold }))
      },

      setActiveCall: (call) => {
        set({ activeCall: call, isCalling: !!call })
      },

      setIsCalling: (isCalling) => {
        set({ isCalling })
      },

      getCallHistory: (leadId) => {
        const { calls } = get()
        if (leadId) {
          return calls.filter((c) => c.leadId === leadId)
        }
        return calls.sort(
          (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
        )
      },

      getCallStats: () => {
        const { calls } = get()
        const completedCalls = calls.filter(
          (c) => c.status === 'completed' || c.status === 'in-progress'
        )
        const connectedCalls = calls.filter(
          (c) => c.outcome === 'connected' || c.status === 'completed'
        )
        const totalDuration = calls.reduce((sum, c) => sum + c.duration, 0)
        const averageDuration =
          completedCalls.length > 0
            ? Math.floor(totalDuration / completedCalls.length)
            : 0
        const successRate =
          calls.length > 0
            ? Math.round((connectedCalls.length / calls.length) * 100)
            : 0

        return {
          totalCalls: calls.length,
          connectedCalls: connectedCalls.length,
          averageDuration,
          successRate,
          totalDuration,
        }
      },

      getCallById: (callId) => {
        return get().calls.find((c) => c.id === callId)
      },

      getCallsByLead: (leadId) => {
        return get().calls.filter((c) => c.leadId === leadId)
      },
    }),
    {
      name: 'phone-crm-storage',
      partialize: (state) => ({
        calls: state.calls.map((call) => ({
          ...call,
          startedAt: call.startedAt.toISOString(),
          endedAt: call.endedAt?.toISOString() || null,
        })),
      }),
      merge: (persistedState: any, currentState) => {
        if (persistedState?.calls) {
          return {
            ...currentState,
            calls: persistedState.calls.map((call: any) => ({
              ...call,
              startedAt: new Date(call.startedAt),
              endedAt: call.endedAt ? new Date(call.endedAt) : null,
            })),
          }
        }
        return currentState
      },
    }
  )
)




