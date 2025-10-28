"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Building2, Search, TrendingUp, User, Moon, Sun, LogOut, LayoutDashboard, Network, Bookmark, BookmarkCheck, Filter, Database, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/auth-store"
import { useTheme } from "next-themes"
import { NotificationCenter } from "@/components/shared/notification-center"
import { useOnboardingStore } from "@/stores/onboarding-store"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const { startTour } = useOnboardingStore()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Search", href: "/search", icon: Search },
    { name: "Filtering", href: "/filtering", icon: Filter },
    { name: "Data Catalog", href: "/data-catalog", icon: Database },
    { name: "Bookmarks", href: "/bookmarks", icon: BookmarkCheck },
    { name: "Saved", href: "/saved-searches", icon: Bookmark },
    { name: "Insights", href: "/insights", icon: TrendingUp },
    { name: "Entity Graph", href: "/graph-linkage", icon: Network },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/95">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Logo + Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8">
                <Building2 className="h-6 w-6 text-primary-700 dark:text-primary-500" />
              </div>
              <span className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                HealthData AI
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "gap-2 font-medium transition-all duration-150",
                        isActive 
                          ? "bg-primary-700 text-white hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700" 
                          : "text-neutral-600 hover:text-primary-700 hover:bg-accent-50 dark:text-neutral-400 dark:hover:text-primary-400 dark:hover:bg-neutral-800"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side: Help + Theme toggle + Auth/User */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user && (
              <NotificationCenter />
            )}
            
            {/* Help / Tour Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={startTour}
              className="text-neutral-600 hover:text-primary-700 hover:bg-accent-50 dark:text-neutral-400 dark:hover:text-primary-400 dark:hover:bg-neutral-800"
              title="Start Platform Tour"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-neutral-700 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-800"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    size="sm"
                    className="bg-primary-700 text-white hover:bg-primary-800 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-primary-600 dark:hover:bg-primary-700"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

