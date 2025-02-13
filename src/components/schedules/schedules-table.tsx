import { Route, Schedule } from "@/types/route.types";

interface SchedulesTableProps {
  schedules: Schedule[];
  routes: Route[];
  onScheduleSelect: (schedule: Schedule) => void;
}

export function SchedulesTable({ schedules, routes, onScheduleSelect }: SchedulesTableProps) {
  // ... resto del componente
} 