import { useQuery } from "@tanstack/react-query";

type Location = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await fetch("/api/locations");
      if (!response.ok) {
        throw new Error("Error fetching locations");
      }
      return response.json();
    },
  });
} 