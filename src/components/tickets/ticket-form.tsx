import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { seat_status_enum, ticket_status_enum } from "@prisma/client";

interface TicketFormProps {
  seatNumber: string;
  seatTier: {
    name: string;
    basePrice: number;
  };
  onSubmit: (data: {
    customerName: string;
    documentId: string;
    phone?: string;
    email?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export function TicketForm({ seatNumber, seatTier, onSubmit, onCancel }: TicketFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    onSubmit({
      customerName: form.customerName.value,
      documentId: form.documentId.value,
      phone: form.phone.value,
      email: form.email.value,
      notes: form.notes.value,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Asiento {seatNumber}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {seatTier.name} - ${seatTier.basePrice}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nombre del Pasajero</Label>
            <Input id="customerName" name="customerName" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentId">Documento de Identidad</Label>
            <Input id="documentId" name="documentId" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input id="email" name="email" type="email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Input id="notes" name="notes" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Reservar Asiento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 