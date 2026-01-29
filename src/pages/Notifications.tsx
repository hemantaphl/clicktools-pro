import { Bell, Sparkles, Wrench, Info } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface NotificationItem {
  id: string;
  type: "update" | "new-tool" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const notifications: NotificationItem[] = [
  {
    id: "1",
    type: "new-tool",
    title: "QR Scanner is Live!",
    message: "Scan QR codes using your camera or upload from gallery.",
    time: "Just now",
    read: false,
  },
  {
    id: "2",
    type: "update",
    title: "EMI Calculator Updated",
    message: "New features: Monthly/Yearly tenure toggle, payment breakdown visualization.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "Welcome to ClickTools Pro",
    message: "Your premium utility toolbox. More tools coming soon!",
    time: "1 day ago",
    read: true,
  },
];

const iconMap = {
  "update": Sparkles,
  "new-tool": Wrench,
  "info": Info,
};

const colorMap = {
  "update": "bg-primary/10 text-primary",
  "new-tool": "bg-accent/10 text-accent",
  "info": "bg-muted text-muted-foreground",
};

export default function Notifications() {
  const { t } = useApp();
  
  return (
    <div className="px-4 py-6 animate-page-enter">
      {/* Empty state or list */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            No Notifications
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            You're all caught up! Check back later for updates.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => {
            const Icon = iconMap[notification.type];
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-lg bg-card border border-border transition-all duration-300 ${
                  !notification.read ? "border-l-2 border-l-primary" : ""
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[notification.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground/60 mt-2 block">
                      {notification.time}
                    </span>
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
