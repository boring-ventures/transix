import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { UserWithProfile, CreateProfileInput, CreateUserRequest } from "@/types/user.types";

const API_URL = "/api/users";

export function useUsers() {
  return useQuery<UserWithProfile[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return data;
    },
  });
}

export function useUser(userId: string) {
  return useQuery<UserWithProfile>({
    queryKey: ["users", userId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}?userId=${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserRequest) => {
      const response = await axios.post(API_URL, payload);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.message);
      }
      throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      data,
    }: {
      profileId: string;
      data: Partial<CreateProfileInput>;
    }) => {
      const response = await axios.patch(`${API_URL}/${profileId}`, data);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.message);
      }
      throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await axios.delete(`${API_URL}/${userId}`);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || "Error al desactivar el usuario");
      }
      throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
} 