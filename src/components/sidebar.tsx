import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Calendar, 
  BarChart, 
  CreditCard,
  FileText,
  Settings
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            
            <Button
              variant={pathname === "/dashboard/passengers" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/passengers">
                <Users className="mr-2 h-4 w-4" />
                Passenger Management
              </Link>
            </Button>

            <Button
              variant={pathname === "/dashboard/parcels" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/parcels">
                <Package className="mr-2 h-4 w-4" />
                Parcel Management
              </Link>
            </Button>

            <Button
              variant={pathname === "/dashboard/operations" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/operations">
                <Calendar className="mr-2 h-4 w-4" />
                Operations
              </Link>
            </Button>

            <Button
              variant={pathname === "/dashboard/analytics" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/analytics">
                <BarChart className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>

            <Button
              variant={pathname === "/dashboard/billing" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </Link>
            </Button>

            <Button
              variant={pathname === "/dashboard/reports" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/reports">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>

            <Button
              variant={pathname === "/dashboard/settings" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}