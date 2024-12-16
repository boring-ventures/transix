import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Users,
  Ticket,
  Package,
  Calendar,
  BarChart,
  Settings,
  CreditCard,
  LineChart
} from "lucide-react"

const navigation = [
  { name: 'Passenger Management', href: '/dashboard/passengers', icon: Users },
  { name: 'Parcel Management', href: '/dashboard/parcels', icon: Package },
  { name: 'Operations', href: '/dashboard/operations', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Reports', href: '/dashboard/reports', icon: LineChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-card border-r">
      <nav className="space-y-2 p-4">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  )
} 