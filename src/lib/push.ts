import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";
import { addNotification, AppNotification } from "./notificationStore";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

/**
 * Build notification object for in-app storage
 * Improved to handle fallback titles better
 */
function buildNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  read = false,
  remoteId?: string
): AppNotification {
  const now = Date.now();
  
  // Deep extraction: If title is empty, check the data payload (common in Firebase background messages)
  const finalTitle = title || data?.title || data?.gcm_title || "New Update";
  const finalBody = body || data?.body || data?.gcm_body || "";

  return {
    id: remoteId || data?.id || now.toString(),
    type: (data?.type as any) || "info",
    title: finalTitle,
    message: finalBody,
    time: new Date(now).toLocaleString(),
    timestamp: now,
    read,
    data,
  };
}

const handleNotificationNavigation = (data: any) => {
  if (data?.route) {
    window.location.hash = data.route;
    return;
  }
  if (data?.toolId) {
    window.location.hash = `#/tool/${data.toolId}`;
    return;
  }
  window.location.hash = "#/notifications";
};

/**
 * Syncs notifications that arrived while the app was closed
 */
export const syncMissedNotifications = async () => {
  try {
    const { notifications } = await FirebaseMessaging.getDeliveredNotifications();
    for (const n of notifications) {
       // Using the improved buildNotification logic to extract hidden titles
       addNotification(buildNotification(n.title || "", n.body || "", n.data, false, n.id));
    }
  } catch (e) {
    console.error("Sync failed", e);
  }
};

/**
 * START PUSH SERVICE
 */
export const initPush = async () => {
  try {
    const permStatus = await PushNotifications.checkPermissions();
    
    // 1. Firebase Foreground Listener
    FirebaseMessaging.addListener("notificationReceived", (event) => {
      const { title, body, data } = event.notification;
      addNotification(buildNotification(title || "", body || "", data, false, event.notification.id));
    });

    // 2. Capacitor Push Received Listener
    PushNotifications.addListener("pushNotificationReceived", async (notification) => {
      const title = notification.title || notification.data?.title || "";
      const body = notification.body || notification.data?.body || "";
      const data = (notification.data || {}) as any;

      addNotification(buildNotification(title, body, data, false, notification.id));

      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: Math.floor(Math.random() * 1000000),
            title: title || "ClickTools Pro",
            body,
            extra: data,
            channelId: 'messages',
            smallIcon: "ic_notification", 
            largeIcon: "res://ic_launcher", 
            iconColor: "#4834d4", 
          }],
        });
      } catch (err) { console.error(err); }
    });

    // 3. Action Listener (Crucial fix for tapping status bar)
    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const { notification } = action;
      
      // When tapped, we force 'read' to true and use our deep extraction
      addNotification(
        buildNotification(
          notification.title || "", 
          notification.body || "", 
          notification.data, 
          true, 
          notification.id
        )
      );
      
      handleNotificationNavigation(notification.data);
    });

    LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
      handleNotificationNavigation(event.notification.extra || {});
    });

    if (permStatus.receive === 'granted') {
      await finishPushRegistration();
    }

  } catch (err) {
    console.error("❌ initPush error:", err);
  }
};

export const requestAndRegisterPush = async () => {
  try {
    const result = await PushNotifications.requestPermissions();
    if (result.receive === 'granted') {
      await finishPushRegistration();
      return true;
    }
    return false;
  } catch (err) {
    console.error("Permission request failed", err);
    return false;
  }
};

async function finishPushRegistration() {
  await LocalNotifications.createChannel({
    id: 'messages',
    name: 'App Messages',
    importance: 5,
    visibility: 1,
    vibration: true,
  });

  await PushNotifications.register();
  
  try {
    await FirebaseMessaging.subscribeToTopic({ topic: "all" });
  } catch (err) {
    console.error("Topic subscribe failed:", err);
  }

  await syncMissedNotifications();
}