import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, Users, Tag, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Дашборд", icon: LayoutDashboard },
  { to: "/clients", label: "Клиенты", icon: Users },
  { to: "/promo-codes", label: "Промокоды", icon: Tag },
];

export const Navigation = () => {
  return (
    <nav className="border-b border-border/50 bg-card/50 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                "hover:text-foreground hover:bg-muted/50 rounded-t-lg"
              )}
              activeClassName="text-primary border-b-2 border-primary bg-muted/30"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
