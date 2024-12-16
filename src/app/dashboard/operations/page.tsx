import { Card } from "@/components/ui/card"
import { CreateRouteDialog } from "@/components/routes/create-route-dialog"
import { RouteTable } from "@/components/routes/route-table"

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Operations</h2>
        <div className="flex items-center space-x-2">
          <CreateRouteDialog />
        </div>
      </div>

      {/* Routes Section */}
      <div className="grid gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Routes Management</h3>
          </div>
          <RouteTable />
        </Card>
      </div>
    </div>
  )
} 