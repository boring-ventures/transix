'use client'

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

type Activity = {
  id: string
  description: string
  created_at: string
  type: 'ticket' | 'parcel' | 'user' | 'route'
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // TODO: Replace with actual activity fetch
    // For now, using mock data
    setActivities([
      {
        id: '1',
        description: 'New ticket issued for Route A',
        created_at: new Date().toISOString(),
        type: 'ticket'
      },
      {
        id: '2',
        description: 'Parcel delivered at Branch B',
        created_at: new Date().toISOString(),
        type: 'parcel'
      },
      {
        id: '3',
        description: 'New route added: City X to City Y',
        created_at: new Date().toISOString(),
        type: 'route'
      }
    ])
  }, [])

  return (
    <div className="space-y-4">
      <Table>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">
                    {activity.description}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 