import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Route } from "@/types/route.types";

interface RouteSelectionStepProps {
  availableRoutes: Route[];
  selectedRoute: Route | null;
  onRouteSelect: (route: Route) => void;
}

export function RouteSelectionStep({
  availableRoutes,
  selectedRoute,
  onRouteSelect,
}: RouteSelectionStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Seleccionar Ruta</h2>
      {availableRoutes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No hay rutas disponibles para el origen y destino seleccionados
            </p>
          </CardContent>
        </Card>
      ) : (
        availableRoutes.map((route) => (
          <Card
            key={route.id}
            className={`cursor-pointer transition-colors hover:border-primary
              ${selectedRoute?.id === route.id ? "border-primary bg-primary/5" : ""}`}
            onClick={() => onRouteSelect(route)}
          >
            <CardHeader>
              <CardTitle>{route.name}</CardTitle>
              <CardDescription>
                Duración estimada: {route.estimatedDuration} minutos
              </CardDescription>
            </CardHeader>
          </Card>
        ))
      )}
    </div>
  );
} 