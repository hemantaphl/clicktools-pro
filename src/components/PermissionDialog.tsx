import { Bell, Camera, FolderOpen, Check, X } from "lucide-react";
import { usePermissions } from "@/contexts/PermissionsContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PermissionDialog() {
  const { 
    showPermissionDialog, 
    requestNotificationPermission,
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
      description: "Get updates about new tools and features",
      request: requestNotificationPermission,
    },
    {
      id: "camera",
      icon: Camera,
      title: "Camera Access",
      description: "Required for QR code scanning",
      request: requestCameraPermission,
    },
    {
      id: "storage",
      icon: FolderOpen,
      title: "Storage Access",
      description: "Upload files for QR scanning and hash generation",
      request: requestStoragePermission,
    },
  ];

  const handleAllow = async () => {
    const perm = permissions[step];
    const granted = await perm.request();
    setStatuses(prev => ({ ...prev, [perm.id]: granted ? "granted" : "denied" }));
    
    if (step < permissions.length - 1) {
      setStep(step + 1);
    } else {
      completeFirstTimeSetup();
    }
  };

  const handleSkip = () => {
    const perm = permissions[step];
    setStatuses(prev => ({ ...prev, [perm.id]: "denied" }));
    
    if (step < permissions.length - 1) {
      setStep(step + 1);
    } else {
      completeFirstTimeSetup();
    }
  };

  const handleSkipAll = () => {
    completeFirstTimeSetup();
  };

  const currentPerm = permissions[step];
  const IconComponent = currentPerm.icon;

  return (
    <div className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm bg-card rounded-xl p-6 shadow-2xl border border-border animate-scale-in">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {permissions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step 
                  ? "w-6 bg-primary" 
                  : i < step 
                    ? "w-1.5 bg-accent" 
                    : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <IconComponent className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {currentPerm.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentPerm.description}
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex justify-center gap-4 mb-6">
          {permissions.map((perm, i) => {
            const status = statuses[perm.id as keyof typeof statuses];
            const Icon = perm.icon;
            return (
              <div
                key={perm.id}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  status === "granted"
                    ? "bg-accent/20"
                    : status === "denied"
                      ? "bg-destructive/20"
                      : i === step
                        ? "bg-primary/20"
                        : "bg-muted"
                }`}
              >
                {status === "granted" ? (
                  <Check className="w-5 h-5 text-accent" />
                ) : status === "denied" ? (
                  <X className="w-5 h-5 text-destructive" />
                ) : (
                  <Icon className={`w-5 h-5 ${i === step ? "text-primary" : "text-muted-foreground"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleAllow}
            className="w-full h-12 text-base font-medium"
          >
            Allow
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="w-full h-10 text-muted-foreground"
          >
            Not Now
          </Button>
        </div>

        {/* Skip all */}
        <button 
          onClick={handleSkipAll}
          className="w-full mt-4 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          Skip all permissions
        </button>
      </div>
    </div>
  );
}
