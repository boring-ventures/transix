"use client";

import { useState, useEffect } from "react";
import { useUsers, useCreateUser, useUpdateProfile } from "@/hooks/useUsers";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/table/data-table";
import { LoadingTable } from "@/components/table/loading-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  UserWithProfile,
  createUserFormSchema,
  editUserFormSchema,
  CreateUserFormData,
  EditUserFormData,
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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";

export default function UsersPage() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const createUser = useCreateUser();
  const updateProfile = useUpdateProfile();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithProfile | null>(
    null
  );
  const { toast } = useToast();

  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "seller",
      companyId: "",
    },
    mode: "onChange",
  });

  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "seller",
      companyId: "",
    },
    mode: "onChange",
  });

  // Watch the role field to conditionally show company field
  const createRole = createForm.watch("role");
  const editRole = editForm.watch("role");

  // Handle role changes for create form
  useEffect(() => {
    if (createRole === "superadmin") {
      createForm.setValue("companyId", null);
      createForm.clearErrors("companyId");
    } else if (!createForm.getValues("companyId")) {
      createForm.setError("companyId", {
        type: "required",
        message: "La empresa es requerida para roles que no son superadmin",
      });
    }
  }, [createRole, createForm]);

  // Handle role changes for edit form
  useEffect(() => {
    if (editRole === "superadmin") {
      editForm.setValue("companyId", null);
      editForm.clearErrors("companyId");
    } else if (!editForm.getValues("companyId")) {
      editForm.setError("companyId", {
        type: "required",
        message: "La empresa es requerida para roles que no son superadmin",
      });
    }
  }, [editRole, editForm]);

  const onCreateSubmit = async (data: CreateUserFormData) => {
    try {
      await createUser.mutateAsync({
        user: {
          email: data.email,
          password: data.password,
        },
        profile: {
          fullName: data.fullName,
          role: data.role,
          companyId:
            data.role === "superadmin"
              ? null
              : data.companyId || null,
          active: true,
          branchId: null,
        },
      });
      setIsCreateOpen(false);
      createForm.reset();
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Hubo un error al crear el usuario.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: EditUserFormData) => {
    if (!editingUser?.profile) return;

    try {
      await updateProfile.mutateAsync({
        profileId: editingUser.id,
        data: {
          fullName: data.fullName,
          role: data.role,
          companyId:
            data.role === "superadmin"
              ? null
              : data.companyId || null,
        },
      });
      setIsEditOpen(false);
      setEditingUser(null);
      editForm.reset();
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Hubo un error al actualizar el usuario.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: UserWithProfile) => {
    if (!user.profile) return;

    setEditingUser(user);
    editForm.reset({
      email: user.email || "",
      fullName: user.profile.fullName || "",
      role: user.profile.role,
      companyId: user.profile.companyId || "",
    });
    setIsEditOpen(true);
  };

  const handleDelete = (user: UserWithProfile) => {
    if (!user.profile || user.profile.role === "superadmin") return;

    setDeletingUser(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser?.profile) return;

    try {
      await updateProfile.mutateAsync({
        profileId: deletingUser.profile.id,
        data: { active: false },
      });
      setIsDeleteOpen(false);
      setDeletingUser(null);
      toast({
        title: "Usuario desactivado",
        description: "El usuario ha sido desactivado exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Hubo un error al desactivar el usuario.",
        variant: "destructive",
      });
    }
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: "ID",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as UserWithProfile;
        return (
          <span className="font-mono text-[10px] text-muted-foreground truncate w-20 inline-block">
            {data.id.slice(0, 8)}...
          </span>
        );
      },
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as UserWithProfile;
        return <div className="font-medium min-w-[200px]">{data.email}</div>;
      },
    },
    {
      id: "fullName",
      accessorKey: "profile",
      header: "Nombre",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as UserWithProfile;
        return <div className="min-w-[200px]">{data.profile?.fullName}</div>;
      },
    },
    {
      id: "role",
      accessorKey: "profile",
      header: "Rol",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as UserWithProfile;
        return (
          <div className="min-w-[150px]">
            {data.profile?.role
              .replace("_", " ")
              .replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
          </div>
        );
      },
    },
    {
      id: "company",
      accessorKey: "profile",
      header: "Empresa",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as UserWithProfile;
        return (
          <span className="font-mono text-[10px] text-muted-foreground truncate w-20 inline-block">
            {data.profile?.companyId
              ? data.profile.companyId.slice(0, 8) + "..."
              : "N/A"}
          </span>
        );
      },
    },
    {
      id: "status",
      accessorKey: "profile",
      header: "Estado",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as UserWithProfile;
        const active = data.profile?.active;
        return (
          <span
            className={`font-medium w-24 inline-block ${
              active ? "text-green-600" : "text-red-600"
            }`}
          >
            {active ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
  ];

  if (usersLoading || companiesLoading)
    return <LoadingTable columnCount={5} rowCount={10} />;

  return (
    <div className="p-4">
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
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
                control={createForm.control}
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
                control={createForm.control}
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
                control={createForm.control}
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
              <FormField
                control={createForm.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem
                    className={createRole === "superadmin" ? "opacity-50" : ""}
                  >
                    <FormLabel>Empresa</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={createRole === "superadmin"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {createRole !== "superadmin" && <FormMessage />}
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
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
              <FormField
                control={editForm.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem
                    className={editRole === "superadmin" ? "opacity-50" : ""}
                  >
                    <FormLabel>Empresa</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={editRole === "superadmin"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editRole !== "superadmin" && <FormMessage />}
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateProfile.isPending}>
                Update User
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this user?
          </DialogDescription>
          <DialogFooter>
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              onClick={confirmDelete}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTable
        title="Usuarios"
        data={users || []}
        columns={columns}
        searchable
        searchField="email"
        onAdd={() => setIsCreateOpen(true)}
        onEdit={(user: UserWithProfile) => {
          if (user.profile) {
            handleEdit(user);
          }
        }}
        onDelete={(user: UserWithProfile) => {
          if (user.profile) {
            handleDelete(user);
          }
        }}
      />
    </div>
  );
}
