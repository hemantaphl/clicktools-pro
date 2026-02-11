import { useState, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, HashRouter, useNavigate, useLocation } from "react-router-dom";

import { AppProvider } from "@/contexts/AppContext";
import { PermissionsProvider, usePermissions } from "@/contexts/PermissionsContext";
import { AppShell } from "@/components/layout/AppShell";
import { SplashScreen } from "@/components/SplashScreen";
import { PermissionDialog } from "@/components/PermissionDialog";

import Index from "./pages/Index";
import Tools from "./pages/Tools";
import More from "./pages/More";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Feedback from "./pages/Feedback";
import Notifications from "./pages/Notifications";
import ToolPage from "./pages/ToolPage";
import NotFound from "./pages/NotFound";
import { initPush } from "@/lib/push";

import { Onboarding } from "@/components/Onboarding";
import { App as CapacitorApp } from "@capacitor/app";
import { SplashScreen as NativeSplash } from "@capacitor/splash-screen";
import { toast } from "@/components/ui/use-toast";
import { haptic } from "@/lib/haptics";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const queryClient = new QueryClient();

/**
 * Back Button Handler
 */
const BackButtonHandler = ({ isOverlayVisible }: { isOverlayVisible: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    let lastBack = 0;
    let handler: any;
    const setupBackButton = async () => {
      handler = await CapacitorApp.addListener("backButton", () => {
        if (isOverlayVisible) return;
        if (location.pathname !== "/") {
          haptic.light();
          navigate(-1);
        } else {
          const now = Date.now();
          if (now - lastBack < 2000) {
            haptic.notification();
            CapacitorApp.exitApp();
          } else {
            lastBack = now;
            haptic.heavy();
            toast({ title: "Press back again to exit" });
          }
        }
      });
    };
    setupBackButton();
    return () => { if (handler) handler.remove(); };
  }, [isOverlayVisible, location.pathname, navigate]);
  return null;
};

/**
 * Strict Sequence Controller
 */
const AppContent = ({ user, handleLogin }: { user: any, handleLogin: () => void }) => {
  const { showPermissionDialog } = usePermissions();
  
  const [currentStep, setCurrentStep] = useState<"onboarding" | "permissions" | "main">(() => {
    const onboardingDone = localStorage.getItem("onboarding_done") === "true";
    return onboardingDone ? "main" : "onboarding";
  });

  const [isMainReady, setIsMainReady] = useState(false);
  const [isSplashDone, setIsSplashDone] = useState(() => !!sessionStorage.getItem("splashShown"));
  const hasPermissionDialogOpened = useRef(false);

  useEffect(() => {
    if (currentStep === "onboarding") return;

    if (showPermissionDialog) {
      hasPermissionDialogOpened.current = true;
      if (currentStep !== "permissions") setCurrentStep("permissions");
    } 
    else if (!showPermissionDialog && currentStep === "permissions") {
       if (hasPermissionDialogOpened.current) {
         setCurrentStep("main");
       }
    }
  }, [showPermissionDialog, currentStep]);

  const handleFinishOnboarding = () => {
    localStorage.setItem("onboarding_done", "true");
    haptic.light();
    hasPermissionDialogOpened.current = true; 
    setCurrentStep("permissions"); 
  };

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShown", "true");
    setIsSplashDone(true);
  };

  if (currentStep === "onboarding") {
    return <Onboarding onFinish={handleFinishOnboarding} />;
  }

  if (currentStep === "permissions") {
    return <PermissionDialog />;
  }

  return (
    <>
      {!isSplashDone && (
        <SplashScreen 
          onComplete={handleSplashComplete} 
          isReady={isMainReady} 
        />
      )}
      
      <HashRouter>
        <BackButtonHandler isOverlayVisible={!isSplashDone} />
        {/* The AppShell wraps the routes. Ensure AppShell uses calculated margins */}
        <AppShell user={user}>
          <Routes>
            <Route path="/" element={<Index user={user} onReady={() => setIsMainReady(true)} />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/more" element={<More user={user} onLogin={handleLogin} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/tool/:id" element={<ToolPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </HashRouter>
    </>
  );
};

const App = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        const { user: currentUser } = await FirebaseAuthentication.getCurrentUser();
        if (currentUser) setUser(currentUser);
        await initPush();
        
        // Hide Native Splash with a slight delay to allow React to mount
        setTimeout(async () => {
          await NativeSplash.hide({ fadeOutDuration: 400 });
        }, 600);
      } catch (e) {
        await NativeSplash.hide();
      }
    };
    prepareApp();

    const listener = FirebaseAuthentication.addListener("authStateChange", (result) => {
      setUser(result.user);
      if (result.user) haptic.success();
    });

    return () => { listener.then(l => l.remove()); };
  }, []);

  const handleLogin = async () => {
    try {
      haptic.medium();
      await FirebaseAuthentication.signInWithGoogle();
    } catch (error) {
      haptic.error();
      toast({ title: "Login Failed", variant: "destructive" });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <PermissionsProvider>
            <Toaster />
            <Sonner />
            <AppContent user={user} handleLogin={handleLogin} />
          </PermissionsProvider>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;