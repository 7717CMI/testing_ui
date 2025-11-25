'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useNotificationsStore } from '@/stores/notifications-store'
import { BellRing, Check, Newspaper } from 'lucide-react'
import { toast } from 'sonner'

interface NewsSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewsSubscriptionDialog({ open, onOpenChange }: NewsSubscriptionDialogProps) {
  const { userPreferences, setUserPreferences } = useNotificationsStore()
  
  // Local state for the form
  const [categories, setCategories] = useState({
    expansion: userPreferences?.monitoredCategories.expansion ?? true,
    technology: userPreferences?.monitoredCategories.technology ?? true,
    funding: userPreferences?.monitoredCategories.funding ?? true,
    mna: userPreferences?.monitoredCategories.mna ?? true,
    policy: userPreferences?.monitoredCategories.policy ?? false,
    marketTrend: userPreferences?.monitoredCategories.marketTrend ?? true,
  })

  const handleToggle = (key: keyof typeof categories) => {
    setCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = () => {
    if (userPreferences) {
      setUserPreferences({
        monitoredCategories: {
          ...userPreferences.monitoredCategories,
          ...categories
        }
      })
      toast.success('News subscriptions updated', {
        description: 'Your news feed will be customized based on your preferences.'
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            News Subscriptions
          </DialogTitle>
          <DialogDescription>
            Select the types of healthcare news you want to see in your workspace and get notified about.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="expansion" className="text-base font-medium">Expansions & Openings</Label>
                <p className="text-xs text-muted-foreground">New facilities, capacity increases, construction</p>
              </div>
              <Switch 
                id="expansion" 
                checked={categories.expansion} 
                onCheckedChange={() => handleToggle('expansion')} 
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="technology" className="text-base font-medium">Technology & AI</Label>
                <p className="text-xs text-muted-foreground">Digital health, telehealth, IT implementations</p>
              </div>
              <Switch 
                id="technology" 
                checked={categories.technology} 
                onCheckedChange={() => handleToggle('technology')} 
              />
            </div>

            <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="funding" className="text-base font-medium">Funding & Investment</Label>
                <p className="text-xs text-muted-foreground">Capital raises, grants, financial updates</p>
              </div>
              <Switch 
                id="funding" 
                checked={categories.funding} 
                onCheckedChange={() => handleToggle('funding')} 
              />
            </div>

            <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="mna" className="text-base font-medium">Mergers & Acquisitions</Label>
                <p className="text-xs text-muted-foreground">Consolidations, partnerships, buyouts</p>
              </div>
              <Switch 
                id="mna" 
                checked={categories.mna} 
                onCheckedChange={() => handleToggle('mna')} 
              />
            </div>

            <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="policy" className="text-base font-medium">Policy & Regulation</Label>
                <p className="text-xs text-muted-foreground">CMS updates, compliance, legal changes</p>
              </div>
              <Switch 
                id="policy" 
                checked={categories.policy} 
                onCheckedChange={() => handleToggle('policy')} 
              />
            </div>

            <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="marketTrend" className="text-base font-medium">Market Trends</Label>
                <p className="text-xs text-muted-foreground">Industry analysis, forecasts, broad shifts</p>
              </div>
              <Switch 
                id="marketTrend" 
                checked={categories.marketTrend} 
                onCheckedChange={() => handleToggle('marketTrend')} 
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            <Check className="h-4 w-4" />
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

