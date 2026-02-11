import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, UserCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Logo } from "@/components/ui/Logo";
import { getNotifications, subscribeNotifications } from "@/lib/notificationStore";
import { haptic } from "@/lib/haptics";

export function Navbar({ user }: { user: any }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useApp();
  
  const [unreadCount, setUnreadCount] = useState(0);

  const checkUnread = () => {
    const list = getNotifications();
    const count = list.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  useEffect(() => {
    checkUnread();
    const unsub = subscribeNotifications(() => checkUnread());
    return () => unsub();
  }, []);

  const isHome = location.pathname === "/";
  const isToolPage = location.pathname.startsWith("/tool/");
  const isNotificationPage = location.pathname === "/notifications";
  const isMorePage = location.pathname === "/more";

  const getTitle = () => {
    if (isToolPage) return language === "en" ? "Tool" : "उपकरण";
    const title = pageTitles[location.pathname];
    return title ? title[language] : "";
  };

  const showNotificationBell = !isToolPage && !isNotificationPage;

  const handleBack = () => {
    haptic.light(); 
    navigate(-1);
  };

  const handleNotifications = () => {
    haptic.light();
    navigate("/notifications");
  };

  const handleProfileClick = () => {
    haptic.medium();
    navigate("/more");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      {/* 1. STATUS BAR SPACER: Keeps background color behind system icons */}
      <div 
        className="w-full" 
        style={{ height: 'env(safe-area-inset-top)' }} 
      />
      
      <div className="max-w-md mx-auto relative">
        {/* 2. NAVBAR CONTENT: Fixed 56px height (h-14) */}
        <nav className="h-14 px-4 flex items-center justify-between">
          
          {/* LEFT SECTION */}
          <div className="flex-shrink-0 z-10 min-w-[40px]">
            {isHome ? (
              <Logo size="sm" />
            ) : (
              <button 
                onClick={handleBack}
                className="touch-target flex items-center justify-center touch-feedback rounded-full -ml-2"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* CENTER SECTION */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-16">
            {!isHome && (
              <span className="text-base font-semibold tracking-tight text-foreground truncate">
                {getTitle()}
              </span>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex-shrink-0 z-10 min-w-[40px] flex items-center gap-2 justify-end">
            {showNotificationBell && (
              <button 
                onClick={handleNotifications}
                className="touch-target flex items-center justify-center touch-feedback rounded-full relative"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full animate-pulse border border-background" />
                )}
              </button>
            )}

            {user && (
              <button 
                onClick={handleProfileClick}
                className={`flex items-center justify-center rounded-full overflow-hidden border-2 transition-all ${
                  isMorePage ? "border-primary" : "border-transparent"
                }`}
              >
                {user.photoUrl || user.photoURL ? (
                  <img 
                    src={user.photoUrl || user.photoURL} 
                    alt="Profile" 
                    className="w-7 h-7 object-cover bg-muted"
                  />
                ) : (
                  <UserCircle className="w-7 h-7 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

const pageTitles: Record<string, { en: string; np: string }> = {
  "/tools": { en: "Tools", np: "उपकरणहरू" },
  "/more": { en: "More", np: "थप" },
  "/about": { en: "About", np: "बारेमा" },
  "/contact": { en: "Contact", np: "सम्पर्क" },
  "/privacy": { en: "Privacy Policy", np: "गोपनीयता नीति" },
  "/notifications": { en: "Notifications", np: "सूचनाहरू" },
  "/feedback": { en: "Feedback & Request", np: "प्रतिक्रिया र अनुरोध" },
};