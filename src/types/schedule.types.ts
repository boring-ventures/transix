export type Schedule = {
  id: string;
  routeId: string;
  routeName: string;
  busId: string;
  bus: {
    id: string;
    plateNumber: string;
    maintenanceStatus: string;
    template: {
      id: string;
      name: string;
      type: string;
      totalCapacity: number;
      seatsLayout: string;
    };
    seats: string[]; // Array de números de asiento
  };
  departureDate: string;
  estimatedArrivalTime: Date;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}; 