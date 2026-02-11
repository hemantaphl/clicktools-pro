import { useNavigate } from "react-router-dom";
import { 
  Sun, Moon, Monitor, Globe, Info, Shield, 
  MessageCircle, ChevronRight, LogIn, LogOut, 
  Star, Share2, RefreshCw, Trash2, Mail, MessageSquarePlus 
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { toast } from "@/components/ui/use-toast";
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';

// Flag Icons CSS
import "flag-icons/css/flag-icons.min.css";

export default function More({ user, onLogin }: { user: any; onLogin: () => void }) {
  const navigate = useNavigate();
  const { theme, setTheme, language, setLanguage, t } = useApp();

  const APP_ID = "com.hemantaphuyal.clicktoolspro"; 

  // --- Logic Functions ---

  const handleLogout = async () => {
    try {
      await FirebaseAuthentication.signOut();
      toast({ title: "Signed out successfully" });
    } catch (error) {
      toast({ title: "Logout failed", variant: "destructive" });
    }
  };

  const handleCheckUpdates = async () => {
    await Browser.open({ 
      url: `https://play.google.com/store/apps/details?id=${APP_ID}` 
    });
  };

  const handleRateUs = async () => {
    const info = await Device.getInfo();
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${APP_ID}`;
    const marketUrl = `market://details?id=${APP_ID}`;

    try {
      if (info.platform === 'android') {
        await Browser.open({ url: marketUrl }).catch(async () => {
          await Browser.open({ url: playStoreUrl });
        });
      } else {
        await Browser.open({ url: playStoreUrl });
      }
    } catch (error) {
      await Browser.open({ url: playStoreUrl });
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'ClickTools Pro',
        text: 'Check out this awesome tools directory for security and networking!',
        url: `https://play.google.com/store/apps/details?id=${APP_ID}`,
        dialogTitle: 'Share ClickTools Pro',
      });
    } catch (error) {
      console.error("Error sharing", error);
    }
  };

  const handleEmailSupport = async () => {
    const info = await Device.getInfo();
    const battery = await Device.getBatteryInfo();
    const email = "support@hemantaphuyal.com.np";
    const subject = encodeURIComponent("Support Request: ClickTools Pro");
    const body = encodeURIComponent(
      `Hi Support Team,\n\n[Describe your issue here]\n\n` + 
      `--- Device Info ---\n` +
      `Model: ${info.model}\n` +
      `OS: ${info.operatingSystem} ${info.osVersion}\n` +
      `Battery: ${Math.round((battery.batteryLevel || 0) * 100)}%\n` +
      `Version: 1.0.0`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleClearCache = async () => {
    const confirmClear = window.confirm("Reset all settings, theme, and language preferences?");
    if (confirmClear) {
      await Preferences.clear();
      toast({ title: "Cache cleared. Restarting..." });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // --- UI Options ---

  const themeOptions = [
    { value: "system", icon: Monitor, label: t("theme.system") },
    { value: "light", icon: Sun, label: t("theme.light") },
    { value: "dark", icon: Moon, label: t("theme.dark") },
  ] as const;

  // Updated with country codes for flags
  const languageOptions = [
    { value: "en", label: "English", country: "gb" },
    { value: "np", label: "नेपाली", country: "np" },
  ] as const;

  const Flag = ({ country, className }: { country: string; className?: string }) => (
    <span className={cn(`fi fi-${country.toLowerCase()} rounded-sm`, className)} />
  );

  return (
    <div className="px-4 py-6 animate-page-enter pb-20">
      {/* Profile Section */}
      <section className="mb-8">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/40">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img 
                  src={user.photoUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full border-2 border-primary/10 shadow-sm"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-card rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-foreground truncate">{user.displayName}</h2>
                <p className="text-xs text-muted-foreground truncate mb-2">{user.email}</p>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-destructive px-3 py-1.5 bg-destructive/5 rounded-lg active:scale-95 transition-transform">
                  <LogOut className="w-3 h-3" /> {t("more.signout")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0">
                <LogIn className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold mb-1">{t("more.signin")}</h2>
                <button onClick={onLogin} className="text-xs font-bold text-primary active:opacity-70 transition-opacity">
                  Continue with Google →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Theme & Language */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">{t("more.theme")}</h3>
          <div className="bg-card rounded-2xl p-1.5 flex gap-1 border border-border/40">
            {themeOptions.map((opt) => (
              <button key={opt.value} onClick={() => setTheme(opt.value)} className={cn("flex-1 flex flex-col items-center gap-2 py-3 rounded-xl transition-all", theme === opt.value ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground")}>
                <opt.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">{t("more.language")}</h3>
          <div className="bg-card rounded-2xl p-1.5 flex gap-1 border border-border/40">
            {languageOptions.map((opt) => (
              <button 
                key={opt.value} 
                onClick={() => setLanguage(opt.value)} 
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-3 rounded-xl transition-all", 
                  language === opt.value ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground"
                )}
              >
                <Flag country={opt.country} className="w-5 h-3.5 shadow-sm" />
                <span className="text-sm font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Actions & Information */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">App Actions</h3>
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm divide-y divide-border/50 border border-border/40">
          <MenuButton icon={RefreshCw} iconColor="text-green-600" bgColor="bg-green-500/10" label={t("more.checkforupdates")} subLabel="v1.2.4" onClick={handleCheckUpdates} />
          <MenuButton icon={Star} iconColor="text-yellow-500" bgColor="bg-yellow-500/10" label={t("more.rateapp")} onClick={handleRateUs} />
          <MenuButton icon={Share2} iconColor="text-blue-500" bgColor="bg-blue-500/10" label={t("more.shareapp")} onClick={handleShareApp} />
          <MenuButton icon={Mail} iconColor="text-purple-600" bgColor="bg-purple-500/10" label={t("more.help&support")} subLabel="Device info will be attached" onClick={handleEmailSupport} />
          <MenuButton icon={MessageSquarePlus} iconColor="text-teal-600" bgColor="bg-teal-500/10" label="Feedback & Requests" subLabel="Share ideas or request tools" onClick={() => navigate("/feedback")} />
          <MenuButton icon={Info} iconColor="text-primary" bgColor="bg-primary/10" label={t("more.about")} onClick={() => navigate("/about")} />
          <MenuButton icon={MessageCircle} iconColor="text-accent" bgColor="bg-accent/10" label={t("more.contact")} onClick={() => navigate("/contact")} />
          <MenuButton icon={Shield} iconColor="text-muted-foreground" bgColor="bg-muted" label={t("more.privacy")} onClick={() => navigate("/privacy")} />
          <MenuButton icon={Trash2} iconColor="text-destructive" bgColor="bg-destructive/10" label="Clear App Cache" subLabel="Reset preferences" onClick={handleClearCache} />
        </div>
      </section>

      <div className="mt-12 text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] opacity-50">© 2026 Hemanta Phuyal</p>
      </div>
    </div>
  );
}

function MenuButton({ icon: Icon, label, subLabel, onClick, iconColor, bgColor }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-4 transition-colors active:bg-muted/50 group">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-active:scale-90", bgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="font-medium text-sm text-foreground">{label}</span>
          {subLabel && <span className="text-[10px] text-muted-foreground">{subLabel}</span>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}