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
  Ticket,
  Map,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
    },
    {
      title: "Venta de Tickets",
      url: "/dashboard/tickets",
      icon: Ticket,
    },
    {
      title: "Encomiendas",
      url: "/dashboard/parcels",
      icon: Package,
    },
    {
      title: "Rutas",
      url: "/dashboard/routes",
      icon: Map,
    },
    {
      title: "Operaciones",
      url: "/dashboard/operations",
      icon: Calendar,
    },
    {
      title: "Usuarios",
      url: "/dashboard/users",
      icon: Users,
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
  const pathname = usePathname();

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
          <SidebarMenu>
            {data.navMain.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "w-full justify-start gap-2",
                      isActive && "font-bold bg-card"
                    )}
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
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
