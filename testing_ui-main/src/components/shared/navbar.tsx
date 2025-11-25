"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Building2, Search, TrendingUp, User, Moon, Sun, LogOut, LayoutDashboard, Network, Bookmark, BookmarkCheck, Filter, Database, HelpCircle, Briefcase } from "lucide-react"
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
    { name: "Saved", href: "/saved-searches", icon: Bookmark },
    { name: "Insights", href: "/insights", icon: TrendingUp },
    { name: "Entity Graph", href: "/graph-linkage", icon: Network },
    { name: "My Workspace", href: "/my-workspace", icon: Briefcase },
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
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => {
                      // Smooth scroll to top on navigation
                      if (typeof window !== 'undefined') {
                        const lenis = (window as any).lenis
                        if (lenis) {
                          lenis.scrollTo(0, {
                            duration: 1.0,
                            easing: (t: number) => 1 - Math.pow(1 - t, 3),
                          })
                        }
                      }
                    }}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "gap-2 font-medium transition-all duration-200 ease-out",
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

          {/* Right side: Notifications + Help + Theme toggle + Auth/User */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user && (
              <NotificationCenter />
            )}
            
            {/* Help / Tour Button - Styled with circle background */}
            <Button
              variant="ghost"
              size="icon"
              onClick={startTour}
              className="h-9 w-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-100 transition-all duration-200"
              title="Start Platform Tour"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            
            {/* Theme Toggle - Styled with circle background */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-100 transition-all duration-200 relative"
              title="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg border-2 border-primary-500 bg-primary-50 hover:bg-primary-100 text-primary-700 hover:text-primary-800 dark:border-primary-400 dark:bg-primary-950/50 dark:hover:bg-primary-900/50 dark:text-primary-300 dark:hover:text-primary-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    title="User menu"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400">
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

