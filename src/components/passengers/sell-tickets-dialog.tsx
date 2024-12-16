'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SellTicketsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  routeId: string
  availableSeats: number
  departureTime: string
}

export function SellTicketsDialog({
  open,
  onOpenChange,
  routeId,
  availableSeats,
  departureTime,
}: SellTicketsDialogProps) {
  const [passengerCount, setPassengerCount] = useState(1)
  const [passengerDetails, setPassengerDetails] = useState([
    { name: '', idNumber: '' }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle ticket sale submission
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sell Tickets</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Number of Passengers</Label>
            <Input
              type="number"
              min={1}
              max={availableSeats}
              value={passengerCount}
              onChange={(e) => {
                const count = parseInt(e.target.value)
                setPassengerCount(count)
                setPassengerDetails(Array(count).fill({ name: '', idNumber: '' }))
              }}
            />
          </div>

          {passengerDetails.map((passenger, index) => (
            <div key={index} className="space-y-2">
              <Label>Passenger {index + 1}</Label>
              <Input
                placeholder="Full Name"
                value={passenger.name}
                onChange={(e) => {
                  const newDetails = [...passengerDetails]
                  newDetails[index] = { ...passenger, name: e.target.value }
                  setPassengerDetails(newDetails)
                }}
              />
              <Input
                placeholder="ID Number"
                value={passenger.idNumber}
                onChange={(e) => {
                  const newDetails = [...passengerDetails]
                  newDetails[index] = { ...passenger, idNumber: e.target.value }
                  setPassengerDetails(newDetails)
                }}
              />
            </div>
          ))}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Sale</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 