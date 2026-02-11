import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hemantaphuyal.clicktoolspro",
  appName: "ClickTools Pro",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      // We set a long duration as a safety net, 
      // but we will hide it manually in App.tsx
      launchShowDuration: 30000, 
      
      // ✅ CRITICAL: This stops the blank screen. 
      // The native splash stays until React tells it to hide.
      launchAutoHide: false, 
      
      // ✅ Match your brand purple (#8026d9) instead of white
      backgroundColor: "#8026d9", 
      
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
  },
};

export default config;