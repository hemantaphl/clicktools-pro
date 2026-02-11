import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

// ✅ Send push to single device token
export const sendPushToToken = onCall(async (request) => {
  const { token, title, body, type, route } = request.data as {
    token: string;
    title?: string;
    body?: string;
    type?: string;
    route?: string;
  };

  if (!token) {
    throw new HttpsError("invalid-argument", "FCM token is required");
  }

  const message: admin.messaging.Message = {
    token,
    notification: {
      title: title || "ClickTools Pro",
      body: body || "You have a new notification",
    },
    data: {
      type: type || "info",
      route: route || "#/notifications",
    },
    android: {
      priority: "high",
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (err: any) {
    throw new HttpsError("internal", err.message);
  }
});

// ✅ Send push to topic (ALL users)
export const sendPushToTopic = onCall(async (request) => {
  const { topic, title, body, type, route } = request.data as {
    topic?: string;
    title?: string;
    body?: string;
    type?: string;
    route?: string;
  };

  const message: admin.messaging.Message = {
    topic: topic || "all",
    notification: {
      title: title || "ClickTools Pro",
      body: body || "New update available",
    },
    data: {
      type: type || "info",
      route: route || "#/notifications",
    },
    android: {
      priority: "high",
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (err: any) {
    throw new HttpsError("internal", err.message);
  }
});
