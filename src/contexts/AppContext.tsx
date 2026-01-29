import React, { createContext, useContext, useEffect, useState } from "react";

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
  "section.top": { en: "Top Tools", np: "शीर्ष उपकरणहरू" },
  "section.new": { en: "New Tools", np: "नयाँ उपकरणहरू" },
  "section.other": { en: "Other Tools", np: "अन्य उपकरणहरू" },
  "status.available": { en: "Available", np: "उपलब्ध" },
  "status.coming": { en: "Coming Soon", np: "चाँडै आउँदैछ" },
  "button.launch": { en: "Launch Tool", np: "उपकरण सुरु गर्नुहोस्" },
  "search.placeholder": { en: "Search tools...", np: "उपकरणहरू खोज्नुहोस्..." },
  "more.theme": { en: "Theme", np: "थीम" },
  "more.language": { en: "Language", np: "भाषा" },
  "more.about": { en: "About", np: "बारेमा" },
  "more.privacy": { en: "Privacy Policy", np: "गोपनीयता नीति" },
  "theme.system": { en: "System", np: "प्रणाली" },
  "theme.light": { en: "Light", np: "उज्यालो" },
  "theme.dark": { en: "Dark", np: "अँध्यारो" },
  "error.title": { en: "Oops! Something went wrong", np: "उफ्! केही गलत भयो" },
  "error.retry": { en: "Retry", np: "पुन: प्रयास गर्नुहोस्" },
  "error.back": { en: "Go Back", np: "पछाडि जानुहोस्" },
  "about.title": { en: "About ClickTools Pro", np: "क्लिकटूल्स प्रो बारेमा" },
  "about.description": { en: "ClickTools Pro is a comprehensive tools directory designed to provide useful utilities for security professionals, network administrators, and everyday users. Our mission is to make powerful tools accessible and easy to use.", np: "क्लिकटूल्स प्रो एक व्यापक उपकरण निर्देशिका हो जुन सुरक्षा पेशेवरहरू, नेटवर्क प्रशासकहरू र दैनिक प्रयोगकर्ताहरूका लागि उपयोगी उपयोगिताहरू प्रदान गर्न डिजाइन गरिएको हो।" },
  "about.developer": { en: "Developed by", np: "विकासकर्ता" },
  "about.location": { en: "Location", np: "स्थान" },
  "about.email": { en: "Email", np: "इमेल" },
  "footer.copyright": { en: "© 2026 Hemanta Phuyal", np: "© २०२६ हेमन्त फुयाल" },
  "footer.rights": { en: "All rights reserved.", np: "सर्वाधिकार सुरक्षित।" },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as Theme) || "system";
  });
  
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem("language", newLang);
    document.body.setAttribute("data-lang", newLang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    document.body.setAttribute("data-lang", language);
  }, [language]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

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
