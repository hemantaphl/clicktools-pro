export type NotificationType = "update" | "new-tool" | "info";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
}

const KEY = "app_notifications";
const EVENT_NAME = "app-notifications-updated";

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const getNotifications = (): AppNotification[] => {
  const list = safeParse<AppNotification[]>(localStorage.getItem(KEY), []);
  return list.sort((a, b) => b.timestamp - a.timestamp);
};

export const emitNotificationsUpdated = () => {
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const subscribeNotifications = (callback: () => void) => {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
};

export const addNotification = (n: AppNotification) => {
  const list = getNotifications();
  
  // --- DEDUPLICATION LOGIC ---
  // If a notification with this ID already exists, do nothing.
  const alreadyExists = list.some((item) => item.id === n.id);
  if (alreadyExists) return;

  list.unshift(n);
  localStorage.setItem(KEY, JSON.stringify(list));
  emitNotificationsUpdated();
};

export const markAsRead = (id: string) => {
  const list = getNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem(KEY, JSON.stringify(list));
  emitNotificationsUpdated();
};

export const markAllRead = () => {
  const list = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(KEY, JSON.stringify(list));
  emitNotificationsUpdated();
};

export const deleteNotification = (id: string) => {
  const list = getNotifications().filter((n) => n.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  emitNotificationsUpdated();
};

export const clearNotifications = () => {
  localStorage.removeItem(KEY);
  emitNotificationsUpdated();
};