import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Mail,
  Home,
  ChevronLeft,
  Sparkles,
  X,
} from "lucide-react";
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
    href: "/manage",
  },
  {
    title: "Users",
    icon: Users,
    href: "/manage?tab=users",
  },
  {
    title: "Subscribers",
    icon: Mail,
    href: "/manage?tab=subscribers",
  },
];

const bottomItems = [
  {
    title: "Back to Site",
    icon: Home,
    href: "/",
  },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const DashboardSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: DashboardSidebarProps) => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href.includes("?")) {
      return location.pathname + location.search === href;
    }
    return location.pathname === href && !location.search;
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-dashboard-sidebar border-r border-dashboard-border transition-all duration-300 flex flex-col",
          // Desktop behavior
          "lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-64",
          // Mobile behavior
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 h-16 border-b border-dashboard-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-dashboard-accent to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-glow">
              <img src={logo} alt="PeakFlow" className="h-7 w-7 object-contain" />
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="font-semibold text-lg tracking-tight">
                PeakFlow
              </span>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-dashboard-bg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {(!collapsed || mobileOpen) && (
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
              Main Menu
            </p>
          )}
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive(item.href)
                  ? "bg-dashboard-accent text-white shadow-lg shadow-dashboard-accent/30"
                  : "text-muted-foreground hover:bg-dashboard-bg hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive(item.href) ? "text-white" : "group-hover:text-foreground"
                )}
              />
              {(!collapsed || mobileOpen) && (
                <span className="font-medium text-sm">{item.title}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Pro Upgrade Card */}
        {(!collapsed || mobileOpen) && (
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
              onClick={handleNavClick}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-dashboard-bg hover:text-foreground transition-all duration-200"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || mobileOpen) && (
                <span className="font-medium text-sm">{item.title}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 rounded-full bg-dashboard-card border border-dashboard-border items-center justify-center shadow-soft hover:shadow-soft-lg transition-all"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </aside>
    </>
  );
};

export default DashboardSidebar;