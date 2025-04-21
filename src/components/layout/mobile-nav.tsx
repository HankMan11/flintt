
import { Link, useLocation } from "react-router-dom";
import { Home, BarChart, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

export function MobileNav() {
  const location = useLocation();
  const { activeGroup } = useApp();

  const isGroupSelected = !!activeGroup;

  const links = [
    {
      to: "/",
      label: "Feed",
      icon: Home,
      active: location.pathname === "/"
    },
    {
      to: "/stats",
      label: "Stats",
      icon: BarChart,
      active: location.pathname === "/stats",
      disabled: !isGroupSelected
    },
    {
      to: "/groups",
      label: "Groups",
      icon: Users,
      active: location.pathname === "/groups"
    },
    {
      to: "/settings",
      label: "Settings", 
      icon: Settings,
      active: location.pathname === "/settings"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {links.map((link) => (
          <NavItem
            key={link.to}
            to={link.to}
            label={link.label}
            icon={link.icon}
            active={link.active}
            disabled={link.disabled}
          />
        ))}
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  disabled?: boolean;
}

function NavItem({ to, label, icon: Icon, active, disabled }: NavItemProps) {
  return (
    <Link
      to={disabled ? "#" : to}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full",
        active ? "text-primary" : "text-muted-foreground",
        disabled ? "opacity-50 pointer-events-none" : "hover:text-primary"
      )}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}
