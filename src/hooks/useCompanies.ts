import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { CompanyResponse, CreateCompanyInput, UpdateCompanyInput, Company } from "@/types/company.types";

const API_URL = "/api/companies";

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies");
      if (!response.ok) {
        throw new Error("Error fetching companies");
      }
      return response.json();
    },
  });
}

export function useCompany(companyId: string) {
  return useQuery<CompanyResponse>({
    queryKey: ["companies", companyId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}?companyId=${companyId}`);
      return data;
    },
    enabled: !!companyId,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompanyInput) => {
      const { data: response } = await axios.post(API_URL, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: string;
      data: UpdateCompanyInput;
    }) => {
      const response = await axios.patch(`${API_URL}/${companyId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const response = await axios.delete(`${API_URL}/${companyId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
} 