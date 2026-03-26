import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNotifications, markNotificationRead } from "@/services/notificationService";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Notification load error", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleClick = async (id: string) => {
    await markNotificationRead(id);

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">

      <div className="flex items-center gap-2">
        <Bell className="w-6 h-6 text-primary" />
        <h1 className="font-bold text-2xl">Notifications</h1>
      </div>

      {loading && (
        <p className="text-center text-muted-foreground">
          Loading notifications...
        </p>
      )}

      {!loading && notifications.length === 0 && (
        <p className="text-center text-muted-foreground">
          No notifications yet.
        </p>
      )}

      <div className="space-y-3">

        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => handleClick(n.id)}
            className={cn(
              "p-4 rounded-2xl border flex gap-3 cursor-pointer transition",
              n.is_read
                ? "bg-card"
                : "bg-primary/5 border-primary/20"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold">
              {n.actor?.full_name?.charAt(0) || "U"}
            </div>

            <div className="flex-1">
              <p className="text-sm">{n.message}</p>

              <span className="text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleString()}
              </span>
            </div>

          </motion.div>
        ))}

      </div>
    </div>
  );
};

export default NotificationsPage;