'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SeatSelectorProps {
  capacity: number
  selectedSeats: number[]
  onSeatSelect: (seatNumber: number) => void
  occupiedSeats: number
}

export function SeatSelector({
  capacity,
  selectedSeats,
  onSeatSelect,
  occupiedSeats,
}: SeatSelectorProps) {
  // Calculate seats per floor (assuming equal distribution)
  const seatsPerFloor = Math.ceil(capacity / 2)

  const renderSeat = (seatNumber: number) => {
    const isSelected = selectedSeats.includes(seatNumber)
    const isOccupied = seatNumber <= occupiedSeats

    return (
      <Tooltip key={seatNumber} delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-10 h-10 p-0",
              isOccupied && "bg-muted cursor-not-allowed", 
              isSelected && "bg-primary"
            )}
            disabled={isOccupied}
            onClick={() => onSeatSelect(seatNumber)}
          >
            {seatNumber}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Seat {seatNumber}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium mb-4">Upper Floor</h4>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: seatsPerFloor }, (_, i) => renderSeat(i + seatsPerFloor + 1))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-4">Lower Floor</h4>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: seatsPerFloor }, (_, i) => renderSeat(i + 1))}
        </div>
      </div>

      <div className="flex gap-4 items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <span>Occupied</span>
        </div>
      </div>
    </div>
  )
} 