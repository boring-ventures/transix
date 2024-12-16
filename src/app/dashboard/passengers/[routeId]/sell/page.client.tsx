'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Route } from '@/types/database.types'
import { SeatSelector } from "@/components/passengers/seat-selector"
import { format } from 'date-fns'
import { TooltipProvider } from "@/components/ui/tooltip"

interface PassengerDetails {
  seatNumber: number
  name: string
  idNumber: string
  phone: string
}

interface SellPageClientProps {
  routeId: string
}

export default function SellPageClient({ routeId }: SellPageClientProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  // States
  const [route, setRoute] = useState<Route | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails[]>([])
  const [formattedDate, setFormattedDate] = useState<string>('')

  // Fetch route details when routeId changes
  useEffect(() => {
    if (routeId) {
      fetchRouteDetails()
    }
  }, [routeId])

  useEffect(() => {
    if (route) {
      setFormattedDate(format(new Date(route.departure_date), 'PPP'))
    }
  }, [route])

  // Fetch route details from Supabase
  const fetchRouteDetails = async () => {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single()

    if (error) {
      console.error('Error fetching route:', error.message)
      setRoute(null)
      return
    }

    setRoute(data)
  }

  const handleSeatSelect = (seatNumber: number) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber))
      setPassengerDetails(passengerDetails.filter(p => p.seatNumber !== seatNumber))
    } else {
      setSelectedSeats([...selectedSeats, seatNumber])
      setPassengerDetails([...passengerDetails, {
        seatNumber,
        name: '',
        idNumber: '',
        phone: ''
      }])
    }
  }

  const updatePassengerDetails = (seatNumber: number, field: keyof PassengerDetails, value: string) => {
    setPassengerDetails(passengerDetails.map(passenger => 
      passenger.seatNumber === seatNumber 
        ? { ...passenger, [field]: value }
        : passenger
    ))
  }

  const handleSubmit = async () => {
    // TODO: Implement ticket sale logic
    console.log('Passenger Details:', passengerDetails)
    router.push('/dashboard/passengers')
  }

  // Display a loading state until the route is fetched
  if (!route) return <div className="text-center py-10">Loading...</div>

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 max-w-7xl" suppressHydrationWarning>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Ticket Sale</h2>
          <div className="text-muted-foreground">
            <p>Route: {route.name}</p>
            <p>Date: {formattedDate}</p>
            <p>Time: {route.departure_time}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">1. Select Seats</h3>
            <SeatSelector 
              capacity={route.capacity}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              occupiedSeats={route.seats_taken || 0}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">2. Passenger Details</h3>
            <div className="space-y-6">
              {passengerDetails.map((passenger) => (
                <div key={passenger.seatNumber} className="space-y-4 p-4 border rounded-lg">
                  <div className="font-medium">Seat {passenger.seatNumber}</div>
                  <div className="space-y-2">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={passenger.name}
                        onChange={(e) => updatePassengerDetails(passenger.seatNumber, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>ID Number</Label>
                      <Input
                        value={passenger.idNumber}
                        onChange={(e) => updatePassengerDetails(passenger.seatNumber, 'idNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={passenger.phone}
                        onChange={(e) => updatePassengerDetails(passenger.seatNumber, 'phone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedSeats.length > 0 && (
              <div className="mt-6 flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Complete Sale
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
