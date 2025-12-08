import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Mail,
  BarChart3,
  Home,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import logo from "@/assets/logo.png";

const menuItems = [
  {
    title: "Overview",
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

  const isActive = (href: string) => {
    if (href.includes("?")) {
      return location.pathname + location.search === href;
    }
    return location.pathname === href && !location.search;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-dashboard-sidebar border-r border-dashboard-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 h-16 border-b border-dashboard-border">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-glow">
          <img src={logo} alt="PeakFlow" className="h-7 w-7 object-contain" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-lg tracking-tight">
            PeakFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
            Main Menu
          </p>
        )}
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.disabled ? "#" : item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
              isActive(item.href)
                ? "bg-dashboard-accent text-white shadow-lg shadow-dashboard-accent/30"
                : "text-muted-foreground hover:bg-dashboard-bg hover:text-foreground",
              item.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                isActive(item.href) ? "text-white" : "group-hover:text-foreground"
              )}
            />
            {!collapsed && (
              <>
                <span className="font-medium text-sm">{item.title}</span>
                {item.disabled && (
                  <span className="ml-auto text-[10px] bg-dashboard-accent-light text-dashboard-accent px-2 py-0.5 rounded-full font-medium">
                    Soon
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Pro Upgrade Card */}
      {!collapsed && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-dashboard-accent/10 to-purple-500/10 border border-dashboard-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-dashboard-accent" />
            <span className="text-sm font-semibold">Pro Features</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock analytics, AI insights, and more.
          </p>
          <button className="w-full py-2 px-3 rounded-xl bg-dashboard-accent text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-dashboard-accent/25">
            Upgrade Now
          </button>
        </div>
      )}

      {/* Bottom Section */}
      <div className="p-4 border-t border-dashboard-border space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-dashboard-bg hover:text-foreground transition-all duration-200"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium text-sm">{item.title}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-dashboard-card border border-dashboard-border flex items-center justify-center shadow-soft hover:shadow-soft-lg transition-all"
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