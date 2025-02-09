"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  Bus,
  CreditCard,
  Ticket,
  Map,
  ChevronDown,
  List,
  Building,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
      title: "Tickets",
      icon: Ticket,
      items: [
        {
          title: "Vender Tickets",
          url: "/dashboard/tickets/sales",
          icon: Ticket,
        },
        {
          title: "Lista de Tickets",
          url: "/dashboard/tickets",
          icon: List,
        },
      ],
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
      title: "Buses",
      url: "/dashboard/buses",
      icon: Bus,
      items: [
        {
          title: "Lista de Buses",
          url: "/dashboard/buses",
          icon: List,
        },
        {
          title: "Plantillas",
          url: "/dashboard/buses/bus-templates",
          icon: Bus,
        },
      ],
    },
    {
      title: "Usuarios",
      url: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Empresas",
      url: "/dashboard/companies",
      icon: Building,
    },
    {
      title: "Finanzas",
      url: "/dashboard/finances",
      icon: CreditCard,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);
  const [userData, setUserData] = React.useState(data.user);
  const supabase = createClientComponentClient();

  React.useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserData({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email || '',
          avatar: user.user_metadata?.avatar_url || '/avatars/admin.jpg',
        });
      }
    };

    getUserData();
  }, []);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

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
            {data.navMain.map((item, index) => {
              const isActive = item.url
                ? pathname === item.url
                : item.items?.some((subItem) => pathname === subItem.url);
              const isOpen = openMenus.includes(item.title);

              return (
                <React.Fragment key={item.title + index}>
                  <SidebarMenuItem>
                    {item.items ? (
                      <SidebarMenuButton
                        onClick={() => toggleMenu(item.title)}
                        className={cn(
                          "w-full justify-start gap-2",
                          isActive && "font-bold bg-card"
                        )}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 ml-auto transition-transform",
                              isOpen && "transform rotate-180"
                            )}
                          />
                        </div>
                      </SidebarMenuButton>
                    ) : (
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
                    )}
                  </SidebarMenuItem>

                  {item.items && isOpen && (
                    <div className="pl-6 space-y-1">
                      {item.items.map((subItem, subIndex) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuItem key={subItem.title + subIndex}>
                            <SidebarMenuButton
                              asChild
                              className={cn(
                                "w-full justify-start gap-2",
                                isSubActive && "font-bold bg-card"
                              )}
                            >
                              <a
                                href={subItem.url}
                                className="flex items-center gap-2"
                              >
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-6">{props.children}</main>
      </SidebarInset>
    </>
  );
}
