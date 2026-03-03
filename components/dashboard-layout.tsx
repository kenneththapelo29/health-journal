use client;
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Pill,
  Dumbbell,
  Brain,
  Moon,
  UtensilsCrossed,
  Calendar,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  User,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/vitals", label: "Vitals", icon: Activity },
  { href: "/dashboard/medications", label: "Medications", icon: Pill },
  { href: "/dashboard/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/dashboard/mood", label: "Mood", icon: Brain },
  { href: "/dashboard/sleep", label: "Sleep", icon: Moon },
  { href: "/dashboard/nutrition", label: "Nutrition", icon: UtensilsCrossed },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border", className)}>
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Health Journal</span>
        </Link>
      </div>
      <NavLinks />
      <div className="p-4 border-t border-sidebar-border">
        <ThemeToggle />
      </div>
    </div>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}

function Header() {
  const { data: session } = useSession();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4 px-4 lg:px-8">
        <MobileSidebar />
        <div className="flex flex-1 items-center justify-end gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{session?.user?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <Sidebar />
      </aside>
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}