import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Location } from "@/types/route.types";
import Link from "next/link";

interface OriginDestinationStepProps {
  locations: Location[];
  selectedOrigin: Location | null;
  selectedDestination: Location | null;
  onOriginChange: (location: Location | null) => void;
  onDestinationChange: (location: Location | null) => void;
}

export function OriginDestinationStep({
  locations,
  selectedOrigin,
  selectedDestination,
  onOriginChange,
  onDestinationChange,
}: OriginDestinationStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Seleccionar Origen y Destino</h2>
      
      {locations.length === 0 ? (
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-2">No hay ubicaciones registradas en el sistema.</p>
          <Link 
            href="/dashboard/locations" 
            className="text-primary hover:underline font-medium"
          >
            Ir a registrar ubicaciones →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Origen</Label>
            <Select
              value={selectedOrigin?.id}
              onValueChange={(value) => {
                const origin = locations.find(loc => loc.id === value);
                onOriginChange(origin || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione origen" />
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
            <Label>Destino</Label>
            <Select
              value={selectedDestination?.id}
              onValueChange={(value) => {
                const destination = locations.find(loc => loc.id === value);
                onDestinationChange(destination || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione destino" />
              </SelectTrigger>
              <SelectContent>
                {locations
                  .filter(loc => loc.id !== selectedOrigin?.id)
                  .map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
} 