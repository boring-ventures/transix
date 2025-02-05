import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRouteInput, Location } from "@/types/route.types";

// Creates a form to create a new route

interface CreateRouteFormProps {
  newRoute: CreateRouteInput;
  locations: Location[];
  onSubmit: (e: React.FormEvent) => void;
  onRouteChange: (route: Partial<CreateRouteInput>) => void;
}

export function CreateRouteForm({
  newRoute,
  locations,
  onSubmit,
  onRouteChange,
}: CreateRouteFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Ruta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Ruta</Label>
              <Input
                id="name"
                name="name"
                value={newRoute.name}
                onChange={(e) =>
                  onRouteChange({ name: e.target.value })
                }
                placeholder="Ej: La Paz - Santa Cruz"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={newRoute.capacity || ""}
                onChange={(e) =>
                  onRouteChange({ capacity: parseInt(e.target.value) })
                }
                placeholder="Capacidad total"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Origen</Label>
              <Select
                value={newRoute.originId}
                onValueChange={(value) =>
                  onRouteChange({ originId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar origen" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destino</Label>
              <Select
                value={newRoute.destinationId}
                onValueChange={(value) =>
                  onRouteChange({ destinationId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar destino" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit">Crear Ruta</Button>
        </form>
      </CardContent>
    </Card>
  );
}
