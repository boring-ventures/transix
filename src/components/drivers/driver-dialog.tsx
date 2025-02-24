import { useEffect } from "react";
import { Driver } from "@/types/driver.types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDriverSchema } from "@/types/driver.types";
import type { CreateDriverInput } from "@/types/driver.types";
import type { Company } from "@/types/company.types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DriverDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateDriverInput) => Promise<void>;
    driver?: Driver;
    companies: Company[];
    defaultCompanyId?: string;
}

export function DriverDialog({
    open,
    onOpenChange,
    onSubmit,
    driver,
    companies,
    defaultCompanyId,
}: DriverDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateDriverInput>({
        resolver: zodResolver(createDriverSchema),
        defaultValues: {
            companyId: defaultCompanyId || "",
        },
    });

    const companyId = watch("companyId");

    useEffect(() => {
        if (driver) {
            reset({
                fullName: driver.fullName,
                licenseNumber: driver.licenseNumber,
                licenseCategory: driver.licenseCategory,
                companyId: driver.companyId,
            });
        } else {
            reset({
                fullName: "",
                licenseNumber: "",
                licenseCategory: "",
                companyId: defaultCompanyId || "",
            });
        }
    }, [driver, defaultCompanyId, reset]);

    const onSubmitForm = async (data: CreateDriverInput) => {
        try {
            await onSubmit(data);
            onOpenChange(false);
            reset();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {driver ? "Editar Conductor" : "Nuevo Conductor"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre Completo</Label>
                        <Input
                            id="fullName"
                            {...register("fullName")}
                            placeholder="Nombre completo del conductor"
                        />
                        {errors.fullName && (
                            <p className="text-sm text-red-500">{errors.fullName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="licenseNumber">Número de Licencia</Label>
                        <Input
                            id="licenseNumber"
                            {...register("licenseNumber")}
                            placeholder="Número de licencia de conducir"
                        />
                        {errors.licenseNumber && (
                            <p className="text-sm text-red-500">
                                {errors.licenseNumber.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="licenseCategory">Categoría de Licencia</Label>
                        <Input
                            id="licenseCategory"
                            {...register("licenseCategory")}
                            placeholder="Categoría de la licencia"
                        />
                        {errors.licenseCategory && (
                            <p className="text-sm text-red-500">
                                {errors.licenseCategory.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="companyId">Empresa</Label>
                        <Select
                            value={companyId}
                            onValueChange={(value) => setValue("companyId", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una empresa" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>
                                        {company.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.companyId && (
                            <p className="text-sm text-red-500">
                                {errors.companyId.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : driver ? "Guardar Cambios" : "Crear Conductor"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 