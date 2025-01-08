'use client'

import { useUsers, useCreateUser, useUpdateProfile } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/table/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  CreateProfileInput,
  CreateUserInput,
  UserWithProfile,
} from "@/types/user.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleEnum } from "@/db/schema";
import { Column } from "@/components/table/types";

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateProfile = useUpdateProfile();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CreateUserInput & CreateProfileInput>({
    defaultValues: {
      email: "",
      fullName: "",
      role: "seller",
      active: true,
      companyId: "",
      branchId: "",
    },
  });

  const onSubmit = async (data: CreateUserInput & CreateProfileInput) => {
    await createUser.mutateAsync({
      user: {
        email: data.email,
        password: data.password,
      },
      profile: {
        fullName: data.fullName,
        role: data.role,
        active: data.active,
        companyId: data.companyId,
        branchId: data.branchId,
      },
    });
    setIsOpen(false);
    form.reset();
  };

  console.log(users);

  const columns: Column<UserWithProfile>[] = [
    { id: "email", accessorKey: "email", header: "Email" },
    {
      id: "fullName",
      accessorKey: "profile",
      header: "Full Name",
      cell: ({ row }) => row.profile?.fullName,
    },
    {
      id: "role",
      accessorKey: "profile",
      header: "Role",
      cell: ({ row }) => {
        const role = row.profile?.role;
        switch (role) {
          case "superadmin":
            return (
              <span className="font-medium text-purple-600 bg-purple-50 rounded-md p-1">
                Superadmin
              </span>
            );
          case "company_admin":
            return (
              <span className="font-medium text-blue-600 bg-blue-50 rounded-md p-1">
                Company Admin
              </span>
            );
          case "branch_admin":
            return (
              <span className="font-medium text-green-600 bg-green-50 rounded-md p-1">
                Branch Admin
              </span>
            );
          case "seller":
            return (
              <span className="font-medium text-orange-600 bg-orange-50 rounded-md p-1">
                Seller
              </span>
            );
          default:
            return <span className="text-gray-500 bg-gray-50">Unknown</span>;
        }
      },
    },
    {
      id: "status",
      accessorKey: "profile",
      header: "Status",
      cell: ({ row }) =>
        row.profile?.active ? (
          <span className="text-green-600">Active</span>
        ) : (
          <span className="text-red-600">Inactive</span>
        ),
    },
  ];

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleEnum.enumValues.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createUser.isPending}>
                Create User
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DataTable
        title="Users"
        data={users || []}
        columns={columns}
        searchable
        searchField="email"
        onAdd={() => setIsOpen(true)}
        onEdit={(user: UserWithProfile) => {
          if (user.profile) {
            updateProfile.mutate({
              profileId: user.profile.id,
              data: { active: !user.profile.active },
            });
          }
        }}
      />
    </div>
  );
}