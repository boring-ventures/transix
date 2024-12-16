import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Map } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
          <div className="space-y-1">
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/routes">
              <Button
                variant={pathname === "/routes" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Map className="mr-2 h-4 w-4" />
                Routes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}