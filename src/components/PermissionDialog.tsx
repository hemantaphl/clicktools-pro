import { useState } from "react";
import { Bell, Camera, FolderOpen, Check, X, ShieldCheck } from "lucide-react";
import { usePermissions } from "@/contexts/PermissionsContext";
import { Button } from "@/components/ui/button";
import { requestAndRegisterPush } from "@/lib/push";
import { haptic } from "@/lib/haptics";

export function PermissionDialog() {
  const { 
    showPermissionDialog, 
    requestCameraPermission,
    requestStoragePermission,
    completeFirstTimeSetup 
  } = usePermissions();
  
  const [step, setStep] = useState(0);
  const [statuses, setStatuses] = useState({
    notifications: "pending" as "pending" | "granted" | "denied",
    camera: "pending" as "pending" | "granted" | "denied",
    storage: "pending" as "pending" | "granted" | "denied",
  });

  if (!showPermissionDialog) return null;

  const permissions = [
    {
      id: "notifications",
      icon: Bell,
      title: "Notifications",
      description: "Get updates about new tools and security features.",
      request: requestAndRegisterPush, 
    },
    {
      id: "camera",
      icon: Camera,
      title: "Camera Access",
      description: "Required for instant QR code scanning and detection.",
      request: requestCameraPermission,
    },
    {
      id: "storage",
      icon: FolderOpen,
      title: "Storage Access",
      description: "Upload files for QR scanning and hash generation.",
      request: requestStoragePermission,
    },
  ];

  const handleAllow = async () => {
    const perm = permissions[step];
    haptic.medium();
    const granted = await perm.request();
    
    setStatuses(prev => ({ ...prev, [perm.id]: granted ? "granted" : "denied" }));
    
    if (granted) haptic.success();

    setTimeout(() => {
      if (step < permissions.length - 1) {
        setStep(step + 1);
      } else {
        haptic.notification();
        completeFirstTimeSetup();
      }
    }, 400);
  };

  const handleSkip = () => {
    haptic.light();
    const perm = permissions[step];
    setStatuses(prev => ({ ...prev, [perm.id]: "denied" }));
    
    if (step < permissions.length - 1) {
      setStep(step + 1);
    } else {
      completeFirstTimeSetup();
    }
  };

  const currentPerm = permissions[step];
  const IconComponent = currentPerm.icon;

  return (
    <div className="fixed inset-0 z-[250] bg-background/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-card rounded-[2.5rem] p-8 shadow-2xl border border-border/50 animate-in zoom-in-95 duration-300">
        
        {/* Progress Header */}
        <div className="flex flex-col items-center mb-10">
          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary mb-4">
            Security Setup • {step + 1} of {permissions.length}
          </label>
          <div className="flex gap-1.5">
            {permissions.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/40" : "w-2 bg-muted"
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Feature Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/10 relative">
            <IconComponent className="w-10 h-10 text-primary" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center">
               <ShieldCheck className="w-3 h-3 text-primary" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-10">
          <h2 className="text-xl font-black text-foreground mb-3 tracking-tight">
            {currentPerm.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed px-2">
            {currentPerm.description}
          </p>
        </div>

        {/* Status Indicators (Matches your Port Checker Results) */}
        <div className="flex justify-center gap-4 mb-10">
          {permissions.map((perm, i) => {
            const status = statuses[perm.id as keyof typeof statuses];
            const IsActive = i === step;
            return (
              <div
                key={perm.id}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                  status === "granted" 
                    ? "bg-green-500/10 border-green-500/20 text-green-500" 
                    : status === "denied"
                      ? "bg-red-500/10 border-red-500/20 text-red-500"
                      : IsActive 
                        ? "bg-primary border-primary shadow-lg shadow-primary/20 text-primary-foreground scale-110" 
                        : "bg-secondary/40 border-border text-muted-foreground/40"
                }`}
              >
                {status === "granted" ? <Check className="w-5 h-5" /> : 
                 status === "denied" ? <X className="w-5 h-5" /> : 
                 <perm.icon className="w-5 h-5" />}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleAllow}
            className="w-full h-14 rounded-2xl text-base font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Allow Access
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="w-full h-12 rounded-2xl text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground hover:bg-secondary/50"
          >
            Not Now
          </Button>
        </div>

        <button 
          onClick={() => {
            haptic.heavy();
            completeFirstTimeSetup();
          }}
          className="w-full mt-6 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/30 hover:text-primary transition-colors"
        >
          Skip All Permissions
        </button>
      </div>
    </div>
  );
}