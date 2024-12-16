'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, DollarSign } from "lucide-react"
import { EditRouteDialog } from "./edit-route-dialog"
import { UpdatePriceDialog } from "./update-price-dialog"
import { CreateRouteDialog } from "./create-route-dialog"
import type { Database } from '@/types/database.types'

type Route = Database['public']['Tables']['routes']['Row']

export function RouteTable() {
  const [mounted, setMounted] = useState(false)
  const [routes, setRoutes] = useState<Route[]>([])
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [updatingPriceRoute, setUpdatingPriceRoute] = useState<Route | null>(null)
  const supabase = createClientComponentClient()

  const fetchRoutes = async () => {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching routes:', error)
      return
    }

    if (data) {
      setRoutes(data)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchRoutes()
  }, [])

  if (!mounted) {
    return null
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting route:', error)
      return
    }

    await fetchRoutes()
  }

  const canUpdatePrice = (departureDate: string) => {
    const now = new Date()
    const departure = new Date(departureDate)
    const hoursDiff = (departure.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Routes</h2>
        <CreateRouteDialog />
      </div>
      
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Origin</th>
              <th className="text-left p-4">Destination</th>
              <th className="text-left p-4">Base Price</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} className="border-t">
                <td className="p-4">{route.name}</td>
                <td className="p-4">{route.origin}</td>
                <td className="p-4">{route.destination}</td>
                <td className="p-4">${route.price.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <EditRouteDialog route={route} open={false} onOpenChange={() => {}} onSave={() => {}} />
                    <UpdatePriceDialog route={route} open={false} onOpenChange={() => {}} onSave={() => {}} />
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}