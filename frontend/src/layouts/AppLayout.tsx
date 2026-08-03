import { Link, Outlet } from "react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Lucide React icons are installed by default with Shadcn
import { BookOpen, Menu, Bookmark, LayoutDashboard } from "lucide-react";

export function AppLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        
        {/* Mobile Navigation Drawer (Shadcn Sheet) */}
        <Sheet>
          <SheetTrigger >
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-4 text-lg font-medium p-4">
              <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                <BookOpen className="h-6 w-6" />
                <span>Scripture Journal</span>
              </Link>
              <Link to="/" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <LayoutDashboard className="h-5 w-5" />
                All Scriptures
              </Link>
              <Link to="/favorites" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <Bookmark className="h-5 w-5" />
                Favorites
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Brand / Logo */}
        <Link to="/" className="hidden md:flex items-center gap-2 text-lg font-semibold md:text-base">
          <BookOpen className="h-6 w-6" />
          <span className="sr-only">Scripture Journal</span>
        </Link>

        {/* User Menu (Shadcn DropdownMenu & Avatar) */}
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  {/* AvatarImage would take the user's Google profile pic URL */}
                  <AvatarImage src="" alt="User profile" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Logout logic will be attached here later */}
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden border-r bg-muted/40 md:block h-[calc(100vh-4rem)] sticky top-16">
          <div className="flex h-full max-h-screen flex-col gap-2 p-4">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                to="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary bg-muted transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                All Scriptures
              </Link>
              <Link
                to="/favorites"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Bookmark className="h-4 w-4" />
                Favorites
              </Link>
            </nav>
          </div>
        </aside>

        {/* Dynamic Route Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}