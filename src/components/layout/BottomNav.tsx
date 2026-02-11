import { useLocation, useNavigate } from "react-router-dom";
import { Home, Wrench, MoreHorizontal } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

const navItems = [
  { path: "/", icon: Home, labelKey: "nav.home" },
  { path: "/tools", icon: Wrench, labelKey: "nav.tools" },
  { path: "/more", icon: MoreHorizontal, labelKey: "nav.more" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useApp();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    haptic.light();
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border">
      <div className="max-w-md mx-auto">
        <div className="h-16 px-4 flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 touch-target touch-feedback rounded-2xl px-4 py-2 transition-all",
                  active && "bg-primary/10"
                )}
              >
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* SAFE AREA SPACER: Important for Android 15 bottom gesture bar */}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </nav>
  );
}