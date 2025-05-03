
import { Home, Users, BarChart2, Settings, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navItems = [
    {
      title: "Feed",
      icon: Home,
      href: "/",
    },
    {
      title: "Groups",
      icon: Users,
      href: "/groups",
    },
    {
      title: "Create",
      icon: Plus,
      href: "/create",
      special: true,
    },
    {
      title: "Stats",
      icon: BarChart2,
      href: "/stats",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  const handleClick = (href: string, special?: boolean) => {
    if (special) {
      // Handle post creation - scroll to create post section
      navigate("/");
      setTimeout(() => {
        const createPostElement = document.getElementById("create-post");
        if (createPostElement) {
          createPostElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      navigate(href);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <nav className="grid h-16 grid-cols-5 items-center">
        {navItems.map((item) => (
          <button
            key={item.title}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs",
              currentPath === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => handleClick(item.href, item.special)}
          >
            {item.special ? (
              <div className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <item.icon className="h-6 w-6" />
              </div>
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            <span>{item.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
