import { create } from "zustand"

export type CallStatus = "connecting" | "ringing" | "connected" | "ended"

export interface ActiveCall {
  facilityId: string
  facilityName: string
  phoneNumber: string
  status: CallStatus
  startTime: Date
}

interface CallState {
  activeCall: ActiveCall | null
  totalCalls: number
  totalDuration: number // in seconds
  totalCost: number
  
  // Actions
  initiateCall: (facilityId: string, facilityName: string, phoneNumber: string) => void
  endCall: () => void
  updateCallStatus: (status: CallStatus) => void
  fetchCallLogs: () => Promise<void>
}

export const useCallStore = create<CallState>((set, get) => ({
  activeCall: null,
  totalCalls: 0,
  totalDuration: 0,
  totalCost: 0,

  initiateCall: (facilityId, facilityName, phoneNumber) => {
    // Don't allow new call if one is already active
    if (get().activeCall) {
      return
    }

    const newCall: ActiveCall = {
      facilityId,
      facilityName,
      phoneNumber,
      status: "connecting",
      startTime: new Date(),
    }

    set({ activeCall: newCall })

    // Simulate call progression: connecting -> ringing -> connected
    setTimeout(() => {
      const currentCall = get().activeCall
      if (currentCall && currentCall.facilityId === facilityId) {
        set({
          activeCall: {
            ...currentCall,
            status: "ringing",
          },
        })
      }
    }, 1000)

    setTimeout(() => {
      const currentCall = get().activeCall
      if (currentCall && currentCall.facilityId === facilityId) {
        set({
          activeCall: {
            ...currentCall,
            status: "connected",
          },
        })
      }
    }, 3000)
  },

  endCall: () => {
    set({ activeCall: null })
  },

  updateCallStatus: (status) => {
    const currentCall = get().activeCall
    if (currentCall) {
      set({
        activeCall: {
          ...currentCall,
          status,
        },
      })
    }
  },

  fetchCallLogs: async () => {
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock data - replace with actual API response
      set({
        totalCalls: 1247,
        totalDuration: 45600, // 760 minutes in seconds
        totalCost: 1250.50,
      })
    } catch (error) {
      console.error('Failed to fetch call logs:', error)
    }
  },
}))

