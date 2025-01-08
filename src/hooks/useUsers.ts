import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { UserWithProfile, CreateUserInput, CreateProfileInput } from "@/types/user.types";

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
    mutationFn: async ({
      user,
      profile,
    }: {
      user: CreateUserInput;
      profile: CreateProfileInput;
    }) => {
      const { data } = await axios.post(API_URL, { user, profile });
      return data;
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
      const response = await axios.patch(`${API_URL}/profile/${profileId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
} 