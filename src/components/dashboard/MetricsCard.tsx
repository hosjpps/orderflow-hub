import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}

export const MetricsCard = ({ title, value, change, icon: Icon, trend = "neutral", loading }: MetricsCardProps) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-success";
    if (trend === "down") return "text-destructive";
    return "text-muted-foreground";
  };

  const getTrendIcon = () => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-glow hover:scale-[1.02] bg-gradient-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
            )}
            {change !== undefined && !loading && (
              <p className={cn("text-sm font-medium flex items-center gap-1", getTrendColor())}>
                <span className="text-lg">{getTrendIcon()}</span>
                <span>{Math.abs(change)}%</span>
                <span className="text-muted-foreground text-xs">vs предыдущий период</span>
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        </div>
      </CardContent>
      
      {/* Декоративный градиент */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
    </Card>
  );
};
