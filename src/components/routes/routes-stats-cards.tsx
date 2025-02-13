import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Route, Schedule } from "@/types/route.types";

// Shows cards with the stats of the routes and schedules

interface RoutesStatsCardsProps {
  routes: Route[];
  schedules: Schedule[];
}

export function RoutesStatsCards({ routes, schedules }: RoutesStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Rutas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{routes.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {routes.filter(r => r.active).length} activas
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Horarios Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{schedules.length}</div>
        </CardContent>
      </Card>
    </div>
  );
}
