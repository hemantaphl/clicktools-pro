import { useNavigate } from "react-router-dom";
import { Sun, Moon, Monitor, Globe, Info, Shield, MessageCircle, ChevronRight } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export default function More() {
  const navigate = useNavigate();
  const { theme, setTheme, language, setLanguage, t } = useApp();

  const themeOptions = [
    { value: "system", icon: Monitor, label: t("theme.system") },
    { value: "light", icon: Sun, label: t("theme.light") },
    { value: "dark", icon: Moon, label: t("theme.dark") },
  ] as const;

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "np", label: "नेपाली" },
  ] as const;

  return (
    <div className="px-4 py-6 animate-page-enter">
      {/* Theme Section */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">
          {t("more.theme")}
        </h3>
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
          <div className="flex p-1.5 gap-1">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const active = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 py-4 rounded-xl transition-all duration-200",
                    "active:scale-95",
                    active ? "bg-primary/10 shadow-sm" : "bg-transparent"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-xs font-semibold transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Language Section */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">
          {t("more.language")}
        </h3>
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
          <div className="flex p-1.5 gap-1">
            {languageOptions.map((option) => {
              const active = language === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setLanguage(option.value)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl transition-all duration-200",
                    "active:scale-95",
                    active ? "bg-primary/10 shadow-sm" : "bg-transparent"
                  )}
                >
                  <Globe className={cn(
                    "w-5 h-5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-semibold transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">
          Information
        </h3>
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm divide-y divide-border/50">
          <button
            onClick={() => navigate("/about")}
            className="w-full flex items-center justify-between px-4 py-4 transition-colors active:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{t("more.about")}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="w-full flex items-center justify-between px-4 py-4 transition-colors active:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium text-foreground">Contact</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate("/privacy")}
            className="w-full flex items-center justify-between px-4 py-4 transition-colors active:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="font-medium text-foreground">{t("more.privacy")}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </section>
    </div>
  );
}
