'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Database } from '@/types/database.types'

type Route = Database['public']['Tables']['routes']['Row']

interface UpdatePriceDialogProps {
  route: Route | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function UpdatePriceDialog({ route, open, onOpenChange, onSave }: UpdatePriceDialogProps) {
  const [price, setPrice] = useState(route?.basePrice.toString() || '')
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!route) return

    const { error } = await supabase
      .from('routes')
      .update({ basePrice: parseFloat(price) })
      .eq('id', route.id)

    if (!error) {
      onSave()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="New price"
          />
          <Button type="submit">Update Price</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}