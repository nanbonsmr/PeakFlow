import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Mail,
  Settings,
  ChevronLeft,
  LogOut,
  Home,
  BarChart3,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Articles",
    icon: FileText,
    href: "/admin",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/dashboard",
    disabled: true,
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin?tab=users",
  },
  {
    title: "Subscribers",
    icon: Mail,
    href: "/admin?tab=subscribers",
  },
];

const bottomItems = [
  {
    title: "Back to Site",
    icon: Home,
    href: "/",
  },
];

const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (href: string) => {
    if (href.includes("?")) {
      return location.pathname + location.search === href;
    }
    return location.pathname === href;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border/50 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-border/50">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden flex-shrink-0">
          <img src={logo} alt="PeakFlow" className="h-8 w-8 object-contain" />
        </div>
        {!collapsed && (
          <span className="font-serif font-bold text-xl tracking-tight">
            PeakFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Menu
            </p>
          )}
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive(item.href) ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <span className="font-medium text-sm">{item.title}</span>
              )}
              {item.disabled && !collapsed && (
                <span className="ml-auto text-[10px] bg-muted px-2 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border/50 space-y-2">
        {bottomItems.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium text-sm">{item.title}</span>
            )}
          </Link>
        ))}
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </aside>
  );
};

export default DashboardSidebar;
