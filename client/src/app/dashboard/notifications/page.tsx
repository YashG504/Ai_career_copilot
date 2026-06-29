'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { notificationsAPI } from '@/lib/api';
import { Bell, CheckCircle2, AlertCircle, Info, CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) { console.error(error); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) { console.error(error); }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Notifications 
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-sm font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Stay updated on your career copilot progress.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead} className="rounded-full">
            <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">You're all caught up!</p>
            <p className="text-muted-foreground text-sm mt-1">We'll notify you when there's something new.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.div 
                key={n._id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={\`border-border/50 transition-colors \${n.isRead ? 'bg-background' : 'bg-card border-primary/20 shadow-sm'}\`}>
                  <CardContent className="p-5 flex gap-4">
                    <div className="shrink-0 mt-1">{getIcon(n.type)}</div>
                    <div className="flex-1">
                      <h4 className={\`font-semibold text-lg \${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}\`}>{n.title}</h4>
                      <p className={\`text-sm mt-1 \${!n.isRead ? 'text-muted-foreground' : 'text-muted-foreground/70'}\`}>{n.message}</p>
                      <p className="text-xs text-muted-foreground/50 mt-3">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {!n.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(n._id)} className="h-8">Mark Read</Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(n._id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
