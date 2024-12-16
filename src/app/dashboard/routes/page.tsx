import { Card } from "@/components/ui/card"
import { CreateRouteDialog } from "@/components/routes/create-route-dialog"
import { RouteTable } from "@/components/routes/route-table"

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Routes</h2>
        <CreateRouteDialog />
      </div>
      <Card className="p-6">
        <RouteTable />
      </Card>
    </div>
  )
} 