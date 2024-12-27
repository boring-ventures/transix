"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  Calendar,
  BarChart,
  CreditCard,
  FileText,
} from "lucide-react";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav/nav-user";
import { NavMain } from "@/components/nav/nav-main";
import { Header } from "../dashboard/Header";

const data = {
  user: {
    name: "Admin",
    email: "admin@transix.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Panel Principal",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Gestión de Pasajeros",
      url: "/dashboard/passengers",
      icon: Users,
      items: [
        {
          title: "Lista de Pasajeros",
          url: "/dashboard/passengers",
        },
        {
          title: "Reservaciones",
          url: "/dashboard/passengers/bookings",
        },
        {
          title: "Historial",
          url: "/dashboard/passengers/history",
        },
      ],
    },
    {
      title: "Gestión de Paquetes",
      url: "/dashboard/parcels",
      icon: Package,
      items: [
        {
          title: "Envíos",
          url: "/dashboard/parcels/shipments",
        },
        {
          title: "Seguimiento",
          url: "/dashboard/parcels/tracking",
        },
      ],
    },
    {
      title: "Operaciones",
      url: "/dashboard/operations",
      icon: Calendar,
      items: [
        {
          title: "Horarios",
          url: "/dashboard/operations/schedules",
        },
        {
          title: "Rutas",
          url: "/dashboard/operations/routes",
        },
      ],
    },
    {
      title: "Análisis",
      url: "/dashboard/analytics",
      icon: BarChart,
    },
    {
      title: "Facturación",
      url: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Informes",
      url: "/dashboard/reports",
      icon: FileText,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/dashboard" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md">
                    <Image
                      src="/images/transix.svg"
                      alt="Transix Logo"
                      width={50}
                      height={50}
                      className="text-primary-foreground"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold font-neutro">
                      TRANSIX
                    </span>
                    <span className="truncate text-xs">
                      Sistema de Transporte
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-6">{props.children}</main>
      </SidebarInset>
    </>
  );
}
