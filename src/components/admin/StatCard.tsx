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
  variant?: "default" | "accent" | "muted";
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  const variants = {
    default: "bg-card border-border/50",
    accent: "bg-accent/10 border-accent/20",
    muted: "bg-muted/50 border-border/30",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-serif tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  trend.isPositive
                    ? "bg-accent/20 text-accent"
                    : "bg-destructive/20 text-destructive"
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-background/80">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-accent/10 to-transparent blur-2xl" />
    </div>
  );
};

export default StatCard;
