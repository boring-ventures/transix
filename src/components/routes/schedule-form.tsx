import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const scheduleSchema = z.object({
  routeId: z.string().uuid(),
  busId: z.string().uuid(),
  departureDate: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  price: z.number().positive(),
});

export function ScheduleForm() {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(scheduleSchema),
  });

  const onSubmit = async (data: z.infer<typeof scheduleSchema>) => {
    try {
      setIsChecking(true);
      
      // First check availability
      const availabilityResponse = await fetch(`/api/bus-availability?${new URLSearchParams({
        busId: data.busId,
        departureDate: data.departureDate,
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
      })}`);

      const { isAvailable } = await availabilityResponse.json();

      if (!isAvailable) {
        toast({
          title: "Bus no disponible",
          description: "El bus seleccionado ya está asignado a otra ruta en este horario.",
          variant: "destructive",
        });
        return;
      }

      // Proceed with schedule creation
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear el horario');
      }

      toast({
        title: "Horario creado",
        description: "El horario ha sido creado exitosamente.",
      });
      
      // Reset form or close modal
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // ... rest of the form JSX
} 