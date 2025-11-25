import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface SaveListDialogProps {
  selectedCount: number
  onSave: (name: string, description: string) => void
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SaveListDialog({
  selectedCount,
  onSave,
  trigger,
  open,
  onOpenChange
}: SaveListDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  // If open/onOpenChange are not provided, we can use internal state, but for this refactor 
  // the parent controls it. We'll assume controlled component if props provided.
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isControlled = open !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the list')
      return
    }
    
    onSave(name, description)
    setName('')
    setDescription('')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" variant="outline">
            <Bookmark className="h-4 w-4 mr-2" />
            Save {selectedCount} Facility(ies)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save Facilities to List</DialogTitle>
          <DialogDescription>
            Save selected facilities with their details for future email campaigns
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="list-name">List Name *</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q4 Outreach Targets"
            />
          </div>
          <div>
            <Label htmlFor="list-description">Description</Label>
            <Textarea
              id="list-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-2">This will save {selectedCount} facility(ies) including:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Facility details (name, NPI, address, phone)</li>
              <li>Authorized person information</li>
              <li>Contact details</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Bookmark className="h-4 w-4 mr-2" />
              Save List
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

