'use client'

import { Phone, PhoneIncoming, PhoneOutgoing, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePhoneCRMStore } from '@/stores/phone-crm-store'
import { format } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'

interface CallHistoryProps {
  leadId?: string
}

export function CallHistory({ leadId }: CallHistoryProps) {
  const { getCallHistory, addCallNote, getCallStats } = usePhoneCRMStore()
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  const calls = getCallHistory(leadId)
  const stats = getCallStats()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'in-progress':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
      case 'no-answer':
      case 'busy':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'ringing':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      'in-progress': 'default',
      ringing: 'secondary',
      failed: 'destructive',
      'no-answer': 'destructive',
      busy: 'destructive',
      canceled: 'outline',
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('-', ' ')}
      </Badge>
    )
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const handleSaveNote = (callId: string) => {
    if (noteText.trim()) {
      addCallNote(callId, noteText.trim())
      toast.success('Note saved')
      setEditingNote(null)
      setNoteText('')
    }
  }

  if (calls.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No call history yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Make your first call to see history here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
            <div className="text-xs text-muted-foreground">Total Calls</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.connectedCalls}</div>
            <div className="text-xs text-muted-foreground">Connected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</div>
            <div className="text-xs text-muted-foreground">Avg Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Call List */}
      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calls.map((call) => (
              <div
                key={call.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {call.direction === 'outbound' ? (
                        <PhoneOutgoing className="h-5 w-5 text-primary" />
                      ) : (
                        <PhoneIncoming className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(call.status)}
                        <span className="font-semibold">{call.phoneNumber}</span>
                        {getStatusBadge(call.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{format(call.startedAt, 'MMM d, yyyy h:mm a')}</span>
                        {call.duration > 0 && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(call.duration)}</span>
                          </>
                        )}
                        {call.outcome && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{call.outcome}</span>
                          </>
                        )}
                      </div>
                      {call.notes && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          {call.notes}
                        </div>
                      )}
                      {editingNote === call.id ? (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add notes about this call..."
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveNote(call.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingNote(null)
                                setNoteText('')
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2"
                          onClick={() => {
                            setEditingNote(call.id)
                            setNoteText(call.notes || '')
                          }}
                        >
                          {call.notes ? 'Edit Note' : 'Add Note'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




