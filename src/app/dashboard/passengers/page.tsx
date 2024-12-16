'use client'

import { useState, useEffect, use } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Clock, Users } from "lucide-react"
import { SellTicketsDialog } from "@/components/passengers/sell-tickets-dialog"
import type { Route } from '@/types/database.types'
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from 'next/navigation'

export default function PassengersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [isSellTicketsOpen, setIsSellTicketsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchRoutes()
  }, [currentPage, searchQuery])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('routes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      // Enhanced search functionality
      if (searchQuery.trim()) {
        query = query.or(
          `name.ilike.%${searchQuery}%,` +
          `origin.ilike.%${searchQuery}%,` +
          `destination.ilike.%${searchQuery}%`
        )
      }

      const { data, count, error } = await query

      if (error) {
        throw error
      }

      setRoutes(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error fetching routes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoutes()
    }, 300) // Debounce search for 300ms

    return () => clearTimeout(timer)
  }, [searchQuery, currentPage])

  const getAvailableSeats = (route: Route) => {
    return route.capacity - (route.seats_taken || 0)
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
          <TableCell>
            <div className="flex justify-end gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Passenger Management</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Section */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by route name, origin, or destination..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* Routes Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Available Times</TableHead>
                  <TableHead>Seats Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <LoadingSkeleton />
                ) : routes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery
                        ? "No routes found matching your search"
                        : "No routes available"}
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell>{route.name}</TableCell>
                      <TableCell>{route.origin}</TableCell>
                      <TableCell>{route.destination}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{route.departure_time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{getAvailableSeats(route)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              router.push(`/dashboard/passengers/${route.id}/sell`)
                            }}
                          >
                            Sell Tickets
                          </Button>
                          <Button 
                            className="bg-green-600 hover:bg-green-700"
                            disabled={getAvailableSeats(route) === route.capacity}
                          >
                            Finalize Sale
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {routes.length > 0 && `Showing ${routes.length} of ${totalPages * itemsPerPage} routes`}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {selectedRoute && (
        <SellTicketsDialog
          open={isSellTicketsOpen}
          onOpenChange={setIsSellTicketsOpen}
          routeId={selectedRoute.id}
          availableSeats={getAvailableSeats(selectedRoute)}
          departureTime={selectedRoute.departure_time}
        />
      )}
    </div>
  )
}