import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type BusAssignment = {
  id: string;
  busId: string;
  routeId: string;
  scheduleId: string;
  startTime: Date;
  endTime: Date;
  assignedAt: Date;
  status: 'active' | 'completed' | 'cancelled';
  bus?: {
    id: string;
    plateNumber: string;
    maintenanceStatus: string;
  };
  route?: {
    id: string;
    name: string;
  };
};

export function useBusAssignments() {
  return useQuery<BusAssignment[]>({
    queryKey: ["bus-assignments"],
    queryFn: async () => {
      const { data } = await axios.get("/api/bus-assignments");
      return data;
    },
  });
} 