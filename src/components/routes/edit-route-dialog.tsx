'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Route } from "@/types/database.types"

interface EditRouteDialogProps {
  route: Route | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function EditRouteDialog({ route, open, onOpenChange, onSave }: EditRouteDialogProps) {
  const [formData, setFormData] = useState({
    origin: route?.origin || '',
    destination: route?.destination || '',
    departure_date: route?.departure_date || '',
    departure_time: route?.departure_time || '',
    basePrice: route?.basePrice.toString() || ''
  })
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!route) return

    await supabase
      .from('routes')
      .update({
        ...formData,
        basePrice: parseFloat(formData.basePrice)
      })
      .eq('id', route.id)

    onSave()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Route</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
          />
          <Input
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          />
          <Input
            type="date"
            value={formData.departure_date}
            onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
          />
          <Input
            type="time"
            value={formData.departure_time}
            onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
          />
          <Input
            type="number"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
          />
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}