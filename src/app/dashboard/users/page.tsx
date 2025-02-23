"use client";
import { useState, useEffect } from "react";
import {
  useUsers,
  useCreateUser,
  useUpdateProfile,
  useDeleteUser,
} from "@/hooks/useUsers";
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
  CreateUserInput,
  UpdateUserInput,
  createUserSchema,
  updateUserSchema,
  CreateUserRequest,
  UpdateProfileRequest,
} from "@/types/user.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { role_enum } from "@prisma/client";
import { Column } from "@/components/table/types";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CompanyResponse } from "@/types/company.types";
import { useUserRoutes } from "@/hooks/useUserRoutes";

export default function UsersPage() {
  const { userData } = useUserRoutes();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const createUser = useCreateUser();
  const updateProfile = useUpdateProfile();
  const deleteUser = useDeleteUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithProfile | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResponse | null>(null);
  const { toast } = useToast();

  const createForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: role_enum.seller,
      companyId: "",
    },
    mode: "onChange",
  });

  const editForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: role_enum.seller,
      companyId: "",
    },
    mode: "onChange",
  });

  const createRole = createForm.watch("role");
  const editRole = editForm.watch("role");

  // Validación del campo "companyId" en el formulario de creación
  useEffect(() => {
    if (createRole === role_enum.superadmin) {
      createForm.setValue("companyId", "");
      createForm.clearErrors("companyId");
    } else if (!createForm.getValues("companyId") && userData?.companyId === null) {
      createForm.setError("companyId", {
        type: "required",
        message: "La empresa es requerida para roles que no son superadmin",
      });
    } else {
      createForm.clearErrors("companyId");
    }
  }, [createRole, userData.companyId, createForm]);

  // Si el usuario autenticado tiene companyId definido, se asigna por defecto
  useEffect(() => {
    if (
      userData?.companyId &&
      createRole !== role_enum.superadmin
    ) {
      createForm.setValue("companyId", userData.companyId);
    }
  }, [userData?.companyId, createRole, createForm]);

  // Reset company field when role changes to superadmin in edit form
  useEffect(() => {
    if (editRole === role_enum.superadmin) {
      editForm.setValue("companyId", "");
      editForm.clearErrors("companyId");
    }
  }, [editRole, editForm]);

  const onCreateSubmit = async (data: CreateUserInput) => {
    try {
      const request: CreateUserRequest = {
        user: {
          email: data.email,
          password: data.password,
        },
        profile: {
          fullName: data.fullName,
          role: data.role,
          companyId: data.role === role_enum.superadmin ? null : data.companyId,
          active: true,
          branchId: null,
        },
      };
      
      await createUser.mutateAsync(request);
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

  const onEditSubmit = async (data: UpdateUserInput) => {
    if (!editingUser?.profile) return;

    try {
      const request: UpdateProfileRequest = {
        profileId: editingUser.id,
        data: {
          fullName: data.fullName,
          role: data.role,
          companyId: data.role === role_enum.superadmin ? null : data.companyId,
          active: true,
        },
      };
      
      await updateProfile.mutateAsync(request);
      setIsEditOpen(false);
      setEditingUser(null);
      editForm.reset();
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente.",
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Hubo un error al actualizar el usuario.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: UserWithProfile) => {
    if (!user.profile) return;
    setEditingUser(user);
    editForm.reset({
      email: user.email ?? "",
      fullName: user.profile.fullName ?? "",
      role: user.profile.role ?? role_enum.seller,
      companyId: user.profile.companyId || "",
    });
    setIsEditOpen(true);
  };

  const handleDelete = (user: UserWithProfile) => {
    if (user.profile?.role === role_enum.superadmin) {
      toast({
        title: "Error",
        description: "No se puede desactivar un usuario Superadmin",
        variant: "destructive",
      });
      return;
    }
    setDeletingUser(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser?.profile) return;

    try {
      await deleteUser.mutateAsync(deletingUser.id);
      setIsDeleteOpen(false);
      setDeletingUser(null);
      toast({
        title: "Usuario desactivado",
        description: "El usuario ha sido desactivado exitosamente.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Hubo un error al desactivar el usuario.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleOpenCompanyModal = (company: CompanyResponse) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
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
      header: "Nombre Completo",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as UserWithProfile;
        return data.profile?.fullName || "N/A";
      },
    },
    {
      id: "role",
      accessorKey: "profile",
      header: "Rol",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as UserWithProfile;
        const role = data.profile?.role;
        if (!role) return "N/A";

        const roleColorMap: Record<string, string> = {
          superadmin: "bg-red-100 text-red-700 border-red-600",
          company_admin: "bg-blue-100 text-blue-700 border-blue-600",
          branch_admin: "bg-green-100 text-green-700 border-green-600",
          seller: "bg-yellow-100 text-yellow-700 border-yellow-600",
        };

        const style =
          roleColorMap[role] || "bg-gray-100 text-gray-700 border-gray-600";

        return (
          <span
            className={`inline-block px-2 py-1 border rounded text-xs ${style}`}
          >
            {role
              .replace("_", " ")
              .replace(/\b\w/g, (letter) => letter.toUpperCase())}
          </span>
        );
      },
    },
    {
      id: "company",
      accessorKey: "company",
      header: "Empresa",
      cell: ({ row }) => {
        const data = row as unknown as UserWithProfile;

        // Intentamos usar data.company si viene del API.
        let companyInfo = data.company;
        // Si no está, buscamos la empresa en la lista de companies usando el companyId del perfil
        if (!companyInfo && data.profile?.companyId && companies) {
          companyInfo = companies.find(
            (comp) => comp.id === data.profile!.companyId
          ) || undefined;
        }
        
        if (!companyInfo) {
          return <span className="text-gray-400 italic">Sin empresa</span>;
        }
        return (
          <button
            className="cursor-pointer underline text-pink-600"
            onClick={() => handleOpenCompanyModal(companyInfo)}
          >
            {companyInfo.name}
          </button>
        );
      },
    },
    {
      id: "createdAt",
      accessorKey: "created_at",
      header: "Fecha de Creación",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as UserWithProfile;
        return data.created_at
          ? new Date(data.created_at).toLocaleDateString()
          : "N/A";
      },
    },
  ];

  if (usersLoading || companiesLoading) {
    return <LoadingTable columnCount={3} rowCount={10} />;
  }

  return (
    <div className="space-y-6">
      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Usuario</DialogTitle>
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
                    <FormLabel>Nombre Completo</FormLabel>
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
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(role_enum).map((role) => (
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
                    className={createRole === role_enum.superadmin ? "opacity-50" : ""}
                  >
                    <FormLabel>Empresa</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={createRole === role_enum.superadmin}
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
                    {createRole !== role_enum.superadmin && <FormMessage />}
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createUser.isPending}>
                Crear Usuario
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Editando usuario:{" "}
              <span className="font-mono">{editingUser?.id}</span>
            </DialogDescription>
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
                    <FormLabel>Nombre Completo</FormLabel>
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
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(role_enum).map((role) => (
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
                    className={editRole === role_enum.superadmin ? "opacity-50" : ""}
                  >
                    <FormLabel>Empresa</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={editRole === role_enum.superadmin}
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
                    {editRole !== role_enum.superadmin && <FormMessage />}
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateProfile.isPending}>
                Actualizar Usuario
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Usuario</DialogTitle>
            <DialogDescription>
              {deletingUser?.profile?.role === role_enum.superadmin ? (
                <span className="text-red-500">
                  No se puede desactivar un usuario Superadmin
                </span>
              ) : (
                <>
                  Desactivando usuario:{" "}
                  <span className="font-mono">{deletingUser?.id}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <p className="text-muted-foreground">
            {deletingUser?.profile?.role === role_enum.superadmin
              ? "Los usuarios Superadmin no pueden ser desactivados por seguridad."
              : "¿Está seguro que desea desactivar este usuario?"}
          </p>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                deleteUser.isPending ||
                deletingUser?.profile?.role === role_enum.superadmin
              }
              onClick={confirmDelete}
            >
              Desactivar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Details Dialog */}
      <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la empresa</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-2">
              <p className="font-mono text-sm">ID: {selectedCompany.id}</p>
              <p>Nombre: {selectedCompany.name}</p>
              <p>¿Está activa?: {selectedCompany.active ? "Sí" : "No"}</p>
              <p>
                Fecha de creación:{" "}
                {new Date(selectedCompany.createdAt).toLocaleDateString()}
              </p>
              <p>
                Fecha de actualización:{" "}
                {new Date(selectedCompany.updatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsCompanyModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTable
        title="Usuarios"
        description="Gestiona los usuarios del sistema."
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
