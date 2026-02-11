import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";

interface SplashScreenProps {
  onComplete: () => void;
  isReady: boolean; // Signal from the AppController
}

export function SplashScreen({ onComplete, isReady }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // 1. Minimum time the splash should show (for branding/consistency)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1800); // Show for at least 1.8 seconds

    return () => clearTimeout(timer);
  }, []);

  // 2. Logic to actually hide the splash screen
  useEffect(() => {
    // Only fade out if both the timer is done AND the home page is ready
    if (minTimeElapsed && isReady) {
      setFadeOut(true);
      const timer = setTimeout(onComplete, 400); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [minTimeElapsed, isReady, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[500] bg-background flex flex-col items-center justify-center transition-opacity duration-400 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-splash-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <Logo size="lg" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-medium">
            Premium Utility Tools
          </p>
        </div>
      </div>
      
      {/* Loading indicator */}
      <div className="absolute bottom-20 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}