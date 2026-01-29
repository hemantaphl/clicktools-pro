import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Logo } from "@/components/ui/Logo";

const pageTitles: Record<string, { en: string; np: string }> = {
  "/tools": { en: "Tools", np: "उपकरणहरू" },
  "/more": { en: "More", np: "थप" },
  "/about": { en: "About", np: "बारेमा" },
  "/contact": { en: "Contact", np: "सम्पर्क" },
  "/privacy": { en: "Privacy Policy", np: "गोपनीयता नीति" },
  "/notifications": { en: "Notifications", np: "सूचनाहरू" },
};

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = useApp();
  const isHome = location.pathname === "/";
  const isToolPage = location.pathname.startsWith("/tool/");
  const isNotificationPage = location.pathname === "/notifications";

  const getTitle = () => {
    if (isToolPage) {
      return "Tool";
    }
    const title = pageTitles[location.pathname];
    return title ? title[language] : "";
  };

  // Hide notification bell on tool pages and notification page
  const showNotificationBell = !isToolPage && !isNotificationPage;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background safe-area-top">
      <div className="max-w-md mx-auto">
        <nav className="h-14 px-4 flex items-center justify-between">
          {isHome ? (
            <>
              <Logo size="sm" />
              <span className="text-base font-semibold tracking-tight">{t("nav.home")}</span>
              {showNotificationBell ? (
                <button 
                  onClick={() => navigate("/notifications")}
                  className="touch-target flex items-center justify-center touch-feedback rounded-full relative"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {/* Notification badge */}
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                </button>
              ) : (
                <div className="w-12" />
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate(-1)}
                  className="touch-target flex items-center justify-center touch-feedback rounded-full -ml-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-base font-semibold tracking-tight">{getTitle()}</span>
              </div>
              {showNotificationBell ? (
                <button 
                  onClick={() => navigate("/notifications")}
                  className="touch-target flex items-center justify-center touch-feedback rounded-full relative"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                </button>
              ) : (
                <div className="w-12" />
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
