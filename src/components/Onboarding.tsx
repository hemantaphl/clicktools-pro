import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { ChevronRight, Sparkles } from "lucide-react";

export function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        {step === 1 && (
          <>
            <div className="mb-10 p-8 bg-card rounded-[2.5rem] border border-border shadow-sm">
              <Logo size="lg" />
            </div>
            
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary mb-3">
              Premium Utility
            </label>
            <h1 className="text-3xl font-black tracking-tight mb-4">ClickTools Pro</h1>
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              The ultimate toolkit for networking, security, and daily digital tasks.
            </p>

            <Button 
              className="mt-12 w-full h-14 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2" 
              onClick={() => setStep(2)}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-10 w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
            
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary mb-3">
              Everything Optimized
            </label>
            <h1 className="text-2xl font-black tracking-tight mb-4">One Unified Experience</h1>
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              Fast, reliable, and secure tools — all optimized for your mobile device.
            </p>

            <Button
              className="mt-12 w-full h-14 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 active:scale-95 transition-all"
              onClick={onFinish}
            >
              Get Started
            </Button>
          </>
        )}
      </div>
    </div>
  );
}