import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "accent" | "success" | "warning" | "info";
  iconColor?: string;
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = "default",
  iconColor 
}: StatCardProps) => {
  const iconBgVariants = {
    default: "bg-dashboard-bg",
    accent: "bg-gradient-to-br from-dashboard-accent to-purple-500",
    success: "bg-gradient-to-br from-dashboard-success to-emerald-400",
    warning: "bg-gradient-to-br from-dashboard-warning to-orange-400",
    info: "bg-gradient-to-br from-dashboard-info to-sky-400",
  };

  const iconTextVariants = {
    default: "text-muted-foreground",
    accent: "text-white",
    success: "text-white",
    warning: "text-white",
    info: "text-white",
  };

  return (
    <div className="relative overflow-hidden bg-dashboard-card rounded-2xl border border-dashboard-border p-6 transition-all duration-300 hover:shadow-soft-lg hover:border-dashboard-accent/20 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-lg",
                  trend.isPositive
                    ? "bg-dashboard-success/15 text-dashboard-success"
                    : "bg-destructive/15 text-destructive"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110",
          iconBgVariants[variant]
        )}>
          <Icon className={cn("h-6 w-6", iconTextVariants[variant], iconColor)} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;