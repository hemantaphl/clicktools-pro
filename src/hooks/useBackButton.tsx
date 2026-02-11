import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = useCallback(() => {
    // If we're on the home page, let the default behavior happen
    if (location.pathname === "/") {
      return true; // Allow default (minimize app or close)
    }
    
    // Navigate back within the app
    navigate(-1);
    return false; // Prevent default
  }, [navigate, location.pathname]);

  useEffect(() => {
    // Handle hardware back button on Android (Capacitor/WebView)
    const handleBackButton = (event: Event) => {
      const shouldDefault = handleBack();
      if (!shouldDefault) {
        event.preventDefault();
      }
    };

    // For Android WebView / Capacitor
    document.addEventListener("backbutton", handleBackButton);

    return () => {
      document.removeEventListener("backbutton", handleBackButton);
    };
  }, [handleBack]);
}

