export interface Step {
  number: number;
  label: string;
}

export const SALES_STEPS: Step[] = [
  { number: 1, label: "Origen/Destino" },
  { number: 2, label: "Ruta" },
  { number: 3, label: "Horario" },
  { number: 4, label: "Viaje" },
  { number: 5, label: "Pasajeros" },
]; 