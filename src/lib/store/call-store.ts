import { create } from 'zustand'

export interface CallLog {
  id: string
  facilityId: string
  facilityName: string
  phoneNumber: string
  status: 'completed' | 'failed' | 'in-progress' | 'missed'
  duration: number // seconds
  cost: number // USD
  timestamp: Date
  notes?: string
}

export interface ActiveCall {
  facilityId: string
  facilityName: string
  phoneNumber: string
  status: 'connecting' | 'ringing' | 'connected' | 'ended'
  startTime: Date
  duration: number
}

interface CallState {
  // Active call
  activeCall: ActiveCall | null
  
  // Call history
  callLogs: CallLog[]
  
  // Stats
  totalCalls: number
  totalDuration: number
  totalCost: number
  
  // Actions
  initiateCall: (facilityId: string, facilityName: string, phoneNumber: string) => void
  updateCallStatus: (status: ActiveCall['status']) => void
  endCall: (notes?: string) => void
  fetchCallLogs: () => Promise<void>
  clearCallLogs: () => void
}

export const useCallStore = create<CallState>((set, get) => ({
  activeCall: null,
  callLogs: [],
  totalCalls: 0,
  totalDuration: 0,
  totalCost: 0,

  initiateCall: (facilityId, facilityName, phoneNumber) => {
    set({
      activeCall: {
        facilityId,
        facilityName,
        phoneNumber,
        status: 'connecting',
        startTime: new Date(),
        duration: 0,
      },
    })

    // Simulate call progression
    setTimeout(() => {
      const state = get()
      if (state.activeCall) {
        set({
          activeCall: {
            ...state.activeCall,
            status: 'ringing',
          },
        })
      }
    }, 1000)

    setTimeout(() => {
      const state = get()
      if (state.activeCall) {
        set({
          activeCall: {
            ...state.activeCall,
            status: 'connected',
          },
        })
      }
    }, 3000)
  },

  updateCallStatus: (status) => {
    const state = get()
    if (state.activeCall) {
      set({
        activeCall: {
          ...state.activeCall,
          status,
        },
      })
    }
  },

  endCall: (notes) => {
    const state = get()
    if (state.activeCall) {
      const duration = Math.floor((Date.now() - state.activeCall.startTime.getTime()) / 1000)
      const cost = duration * 0.02 // $0.02 per second mock rate

      const newLog: CallLog = {
        id: `call-${Date.now()}`,
        facilityId: state.activeCall.facilityId,
        facilityName: state.activeCall.facilityName,
        phoneNumber: state.activeCall.phoneNumber,
        status: 'completed',
        duration,
        cost,
        timestamp: new Date(),
        notes,
      }

      set({
        activeCall: null,
        callLogs: [newLog, ...state.callLogs],
        totalCalls: state.totalCalls + 1,
        totalDuration: state.totalDuration + duration,
        totalCost: state.totalCost + cost,
      })
    }
  },

  fetchCallLogs: async () => {
    // Mock API call
    try {
      const response = await fetch('/api/calls/logs')
      if (response.ok) {
        const data = await response.json()
        set({
          callLogs: data.logs || [],
          totalCalls: data.totalCalls || 0,
          totalDuration: data.totalDuration || 0,
          totalCost: data.totalCost || 0,
        })
      }
    } catch (error) {
      // Silently fall back to mock data (no backend API yet)
      // Use mock data on failure
      const mockLogs: CallLog[] = [
        {
          id: 'call-1',
          facilityId: 'fac-1',
          facilityName: 'Memorial Hospital',
          phoneNumber: '+1-555-0123',
          status: 'completed',
          duration: 245,
          cost: 4.9,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          notes: 'Discussed patient transfer protocol',
        },
        {
          id: 'call-2',
          facilityId: 'fac-2',
          facilityName: 'St. Mary Medical Center',
          phoneNumber: '+1-555-0456',
          status: 'completed',
          duration: 180,
          cost: 3.6,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
          id: 'call-3',
          facilityId: 'fac-3',
          facilityName: 'City General Hospital',
          phoneNumber: '+1-555-0789',
          status: 'missed',
          duration: 0,
          cost: 0,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ]
      set({
        callLogs: mockLogs,
        totalCalls: 15,
        totalDuration: 3600,
        totalCost: 72.0,
      })
    }
  },

  clearCallLogs: () => {
    set({
      callLogs: [],
      totalCalls: 0,
      totalDuration: 0,
      totalCost: 0,
    })
  },
}))

