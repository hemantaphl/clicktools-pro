import { useEffect, useState } from "react";
import { Bell, Sparkles, Wrench, Info, CheckCheck, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import {
  getNotifications,
  subscribeNotifications,
  markAsRead,
  markAllRead,
  clearNotifications,
  AppNotification,
} from "@/lib/notificationStore";

const iconMap = {
  update: Sparkles,
  "new-tool": Wrench,
  info: Info,
};

const colorMap = {
  update: "bg-primary/10 text-primary",
  "new-tool": "bg-accent/10 text-accent",
  info: "bg-muted text-muted-foreground",
};

export default function Notifications() {
  const { t } = useApp();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const load = () => setNotifications(getNotifications());

  useEffect(() => {
    load();
    const unsub = subscribeNotifications(() => load());
    return () => unsub();
  }, []);

  const handleMarkRead = (id: string) => {
    markAsRead(id);
    load(); // Force immediate state update
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="px-4 py-6 animate-page-enter">
      {notifications.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => markAllRead()} className="px-3 py-2 rounded-lg bg-surface border border-border text-xs font-medium text-foreground flex items-center gap-1 touch-feedback">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
            <button onClick={() => clearNotifications()} className="px-3 py-2 rounded-lg bg-surface border border-border text-xs font-medium text-destructive flex items-center gap-1 touch-feedback">
              <Trash2 className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No Notifications</h3>
          <p className="text-sm text-muted-foreground text-center">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => {
            const Icon = iconMap[notification.type] || Info;
            return (
              <div
                key={notification.id}
                onClick={() => handleMarkRead(notification.id)}
                className={`p-4 rounded-lg bg-card border border-border transition-all duration-300 cursor-pointer touch-feedback ${
                  !notification.read ? "border-l-2 border-l-primary" : ""
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[notification.type] || "bg-muted"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                    <span className="text-xs text-muted-foreground/60 mt-2 block">{notification.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}