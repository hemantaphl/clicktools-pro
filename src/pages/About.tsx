import { MapPin, Mail, Wrench } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { StaticFooter } from "@/components/common/StaticFooter";
import logo from "@/assets/logo.svg";

export default function About() {
  const { t } = useApp();

  return (
    <div className="px-4 py-6 animate-page-enter">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
          <img src={logo} alt="ClickTools Logo" className="w-full h-full object-contain scale-100 rounded-md"/>
        </div>
        <h1 className="text-2xl font-bold text-foreground">ClickTools</h1>
        <span className="text-sm font-semibold text-primary">Pro</span>
      </div>

      {/* About Section */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-3 text-foreground">{t("about.title")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("about.description")}
        </p>
      </section>

      {/* Developer Info */}
      <section className="bg-card rounded-2xl p-5 space-y-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
            {t("about.developer")}
          </p>
          <p className="font-bold text-xl text-foreground">{t("about.name")}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("about.location")}
            </p>
            <p className="font-semibold text-foreground">{t("about.address")}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center">
            <Mail className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("about.email")}
            </p>
            <a 
              href="mailto:hello@hemantaphuyal.com" 
              className="font-semibold text-primary"
            >
              app@hemantaphuyal.com
            </a>
          </div>
        </div>
      </section>

      {/* Version */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">Version 1.2.4</p>
      </div>

      <StaticFooter />
    </div>
  );
}
