// Haptic feedback utility for native-like experience
export const haptic = {
  // Light tap - for button presses, toggles
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Medium tap - for selections, confirmations
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  
  // Heavy tap - for important actions, errors
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },
  
  // Success pattern - for successful operations
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 20]);
    }
  },
  
  // Error pattern - for errors or warnings
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30, 50, 30]);
    }
  },
  
  // Notification pattern - for alerts
  notification: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 100, 20]);
    }
  }
};
