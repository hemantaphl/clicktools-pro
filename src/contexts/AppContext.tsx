import React, { createContext, useContext, useEffect, useState } from "react";
import { Preferences } from '@capacitor/preferences';
import { Device } from '@capacitor/device';

type Theme = "system" | "light" | "dark";
type Language = "en" | "np";

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  "app.name": { en: "ClickTools Pro", np: "क्लिकटूल्स प्रो" },
  "app.tagline": { en: "Tools Directory", np: "उपकरण निर्देशिका" },
  "app.subtitle": { en: "Useful tools for security and networking", np: "सुरक्षा र नेटवर्किङका लागि उपयोगी उपकरणहरू" },
  "tools.found": { en: "tools found", np: "उपकरणहरू फेला परे" },
  "nav.home": { en: "Home", np: "गृह" },
  "nav.tools": { en: "Tools", np: "उपकरणहरू" },
  "nav.more": { en: "More", np: "थप" },
  "index.welcome": {en: "Welcome back", np: "स्वागत छ"},
  "section.top": { en: "Top Tools", np: "शीर्ष उपकरणहरू" },
  "section.new": { en: "New Tools", np: "नयाँ उपकरणहरू" },
  "section.other": { en: "Other Tools", np: "अन्य उपकरणहरू" },
  "status.available": { en: "Available", np: "उपलब्ध" },
  "status.coming": { en: "Coming Soon", np: "चाँडै आउँदैछ" },
  "button.launch": { en: "Launch Tool", np: "उपकरण सुरु गर्नुहोस्" },
  "search.placeholder": { en: "Search tools...", np: "उपकरणहरू खोज्नुहोस्..." },
  "tools.all": {en: "All Tools", np: "सबै उपकरणहरू"},
  "more.theme": { en: "Theme", np: "थीम" },
  "more.language": { en: "Language", np: "भाषा" },
  "more.about": { en: "About", np: "बारेमा" },
  "more.contact": { en: "Contact", np: "सम्पर्क" },
  "more.privacy": { en: "Privacy Policy", np: "गोपनीयता नीति" },
  "more.help&support": {en: "Help & Support", np: "सहायता र समर्थन"},
  "more.shareapp": {en: "Share App", np: "एप शेयर गर्नुहोस्"},
  "more.rateapp": {en: "Rate App", np: "एपलाई मूल्याङ्कन गर्नुहोस्"},
  "more.checkforupdates": {en: "Check for Updates", np: "अपडेट जाँच गर्नुहोस्"},
  "more.signin": {en: "Sign in to ClickTools Pro", np: "ClickTools Pro मा साइन इन गर्नुहोस्"},
  "more.signout": {en: "Sign Out", np: "साइन आउट गर्नुहोस्"},
  "theme.system": { en: "System", np: "प्रणाली" },
  "theme.light": { en: "Light", np: "उज्यालो" },
  "theme.dark": { en: "Dark", np: "अँध्यारो" },
  "about.title": { en: "About ClickTools Pro", np: "क्लिकटूल्स प्रो बारेमा" },
  "about.name": { en: "Hemanta Phuyal", np: "हेमन्त फूयाल" },
  "about.location": { en: "Location", np: "स्थान" },
  "about.address": { en: "Biratnagar, Nepal", np: "विराटनगर, नेपाल" },
  "about.email": { en: "Email", np: "इमेल" },
  "about.developer": { en: "App Developer", np: "एप विकासकर्ता" },
  "about.description": { en: "ClickTools Pro is a comprehensive tools directory designed to provide useful utilities for security professionals, network administrators, and everyday users.", np: "क्लिकटूल्स प्रो एक व्यापक उपकरण निर्देशिका हो जुन सुरक्षा पेशेवरहरू, नेटवर्क प्रशासकहरू र दैनिक प्रयोगकर्ताहरूका लागि उपयोगी उपयोगिताहरू प्रदान गर्न डिजाइन गरिएको हो।" },
  "footer.copyright": { en: "© 2026 Hemanta Phuyal", np: "© २०२६ हेमन्त फूयाल" },
  "footer.rights": { en: "All Rights Reserved", np: "सर्वाधिकार सुरक्षित" },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Fetch saved preferences
        const { value: savedTheme } = await Preferences.get({ key: 'user-theme' });
        const { value: savedLang } = await Preferences.get({ key: 'user-lang' });

        if (savedTheme) setThemeState(savedTheme as Theme);

        // 2. Language Detection Logic
        if (savedLang) {
          setLanguageState(savedLang as Language);
        } else {
          // First launch: Detect Device Language
          const info = await Device.getLanguageCode(); // e.g., "en" or "ne"
          const detectedLang: Language = (info.value === 'ne' || info.value === 'np') ? 'np' : 'en';
          
          setLanguageState(detectedLang);
          // Save detected language so it persists
          await Preferences.set({ key: 'user-lang', value: detectedLang });
        }
      } catch (error) {
        console.error("Initialization Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // 3. Persist Theme on change
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await Preferences.set({ key: 'user-theme', value: newTheme });
  };

  // 4. Persist Language on change
  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang);
    document.body.setAttribute("data-lang", newLang);
    await Preferences.set({ key: 'user-lang', value: newLang });
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  // ✅ Effect to handle Theme class changes on the HTML element
  useEffect(() => {
    if (isLoading) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    document.body.setAttribute("data-lang", language);
  }, [theme, language, isLoading]);

  // ✅ Prevent rendering until settings are ready to avoid visual glitches
  if (isLoading) return null;

  return (
    <AppContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}