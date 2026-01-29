import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PermissionsState {
  notifications: "granted" | "denied" | "prompt" | "not-asked";
  camera: "granted" | "denied" | "prompt" | "not-asked";
  storage: "granted" | "denied" | "prompt" | "not-asked";
  firstTimeSetup: boolean;
}

interface PermissionsContextType {
  permissions: PermissionsState;
  requestNotificationPermission: () => Promise<boolean>;
  requestCameraPermission: () => Promise<boolean>;
  requestStoragePermission: () => Promise<boolean>;
  completeFirstTimeSetup: () => void;
  showPermissionDialog: boolean;
  setShowPermissionDialog: (show: boolean) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<PermissionsState>(() => {
    const saved = localStorage.getItem("app-permissions");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      notifications: "not-asked",
      camera: "not-asked",
      storage: "not-asked",
      firstTimeSetup: false,
    };
  });
  
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  useEffect(() => {
    localStorage.setItem("app-permissions", JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    // Show permission dialog on first app launch
    if (!permissions.firstTimeSetup) {
      const timer = setTimeout(() => {
        setShowPermissionDialog(true);
      }, 2500); // After splash screen
      return () => clearTimeout(timer);
    }
  }, [permissions.firstTimeSetup]);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      setPermissions(prev => ({ ...prev, notifications: "denied" }));
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      const status = result === "granted" ? "granted" : result === "denied" ? "denied" : "prompt";
      setPermissions(prev => ({ ...prev, notifications: status }));
      return result === "granted";
    } catch {
      setPermissions(prev => ({ ...prev, notifications: "denied" }));
      return false;
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, camera: "granted" }));
      return true;
    } catch {
      setPermissions(prev => ({ ...prev, camera: "denied" }));
      return false;
    }
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    // Storage permission is implicit in web - we just track that we asked
    setPermissions(prev => ({ ...prev, storage: "granted" }));
    return true;
  };

  const completeFirstTimeSetup = () => {
    setPermissions(prev => ({ ...prev, firstTimeSetup: true }));
    setShowPermissionDialog(false);
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        requestNotificationPermission,
        requestCameraPermission,
        requestStoragePermission,
        completeFirstTimeSetup,
        showPermissionDialog,
        setShowPermissionDialog,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return context;
}
