import { useState } from "react";
import { Search, Bell, Settings, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface DashboardTopBarProps {
  onMenuClick: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const DashboardTopBar = ({ onMenuClick, searchQuery = "", onSearchChange }: DashboardTopBarProps) => {
  const { user, signOut } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD";

  const handleSearchChange = (value: string) => {
    onSearchChange?.(value);
  };

  const clearSearch = () => {
    onSearchChange?.("");
  };

  return (
    <header className="h-14 sm:h-16 bg-dashboard-card border-b border-dashboard-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Section - Menu & Search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-10 w-10 rounded-xl hover:bg-dashboard-bg"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Desktop Search */}
        <div className="hidden sm:block flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, users, subscribers..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10 bg-dashboard-bg border-dashboard-border rounded-xl h-10 focus:ring-2 focus:ring-dashboard-accent/20 focus:border-dashboard-accent transition-all"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-dashboard-border"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Expanded */}
        {mobileSearchOpen && (
          <div className="absolute inset-x-0 top-0 h-14 bg-dashboard-card border-b border-dashboard-border px-4 flex items-center gap-2 sm:hidden z-50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
                className="pl-10 pr-10 bg-dashboard-bg border-dashboard-border rounded-xl h-10 focus:ring-2 focus:ring-dashboard-accent/20 focus:border-dashboard-accent transition-all"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-dashboard-border"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSearchOpen(false)}
              className="h-10 w-10 rounded-xl hover:bg-dashboard-bg"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 ml-4 sm:ml-6">
        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden h-10 w-10 rounded-xl hover:bg-dashboard-bg"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-xl hover:bg-dashboard-bg"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-dashboard-accent" />
        </Button>

        {/* Settings - Hidden on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex h-10 w-10 rounded-xl hover:bg-dashboard-bg"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-10 px-2 rounded-xl hover:bg-dashboard-bg"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-dashboard-accent to-purple-500 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-dashboard-card border-dashboard-border rounded-xl p-2">
            <div className="px-2 py-1.5 mb-1">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <DropdownMenuSeparator className="bg-dashboard-border" />
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link to="/">Back to Site</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link to="/manage">Content Manager</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-dashboard-border" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardTopBar;