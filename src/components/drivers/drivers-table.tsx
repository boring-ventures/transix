import { Driver } from "@/types/driver.types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface DriversTableProps {
    drivers: Driver[];
    onEdit: (driver: Driver) => void;
    onDelete: (driverId: string) => void;
}

export function DriversTable({ drivers, onEdit, onDelete }: DriversTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre Completo</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Licencia</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                            <TableCell>{driver.fullName}</TableCell>
                            <TableCell>{driver.documentId}</TableCell>
                            <TableCell>{driver.licenseNumber}</TableCell>
                            <TableCell>{driver.licenseCategory}</TableCell>
                            <TableCell>
                                <Badge variant={driver.active ? "default" : "secondary"}>
                                    {driver.active ? "Activo" : "Inactivo"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(driver)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(driver.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {drivers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No hay conductores registrados
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
} 