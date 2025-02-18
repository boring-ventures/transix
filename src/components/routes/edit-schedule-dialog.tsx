import { useState } from "react";
import { Schedule } from "@/types/route.types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";

const editScheduleSchema = z.object({
    departureDate: z.string().min(1, "La fecha de salida es requerida"),
    departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "La hora debe estar en formato HH:MM",
    }),
    price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
});

type EditScheduleInput = z.infer<typeof editScheduleSchema>;

interface EditScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: Schedule;
    onSubmit: (scheduleId: string, data: EditScheduleInput) => Promise<void>;
}

export function EditScheduleDialog({
    open,
    onOpenChange,
    schedule,
    onSubmit,
}: EditScheduleDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EditScheduleInput>({
        resolver: zodResolver(editScheduleSchema),
        defaultValues: {
            departureDate: format(new Date(schedule.departureDate), "yyyy-MM-dd"),
            departureTime: format(new Date(schedule.departureDate), "HH:mm"),
            price: schedule.price,
        },
    });

    const handleSubmit = async (data: EditScheduleInput) => {
        try {
            setIsSubmitting(true);
            await onSubmit(schedule.id, data);
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating schedule:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Horario</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del horario programado
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="departureDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de Salida</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="departureTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hora de Salida</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Precio</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            value={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 