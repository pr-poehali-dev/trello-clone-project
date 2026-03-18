import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";

const NAV = [
  { path: "/", label: "Доски", icon: "LayoutDashboard" },
  { path: "/team", label: "Команда", icon: "Users" },
  { path: "/profile", label: "Профиль", icon: "User" },
  { path: "/settings", label: "Настройки", icon: "Settings" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const qc = useQueryClient();

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getAll(1),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number | "all") => notificationsApi.markRead(id, 1),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unread_count || 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border glass shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center animate-pulse-glow">
              <Icon name="Zap" size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gradient-purple">TaskFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? "bg-primary/20 text-primary neon-border-purple border"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon
                  name={item.icon as never}
                  size={18}
                  className={active ? "text-primary" : "group-hover:text-foreground"}
                />
                <span className="text-sm font-medium">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg glass">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-400 text-white text-xs font-bold">
                АП
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Алексей Петров</p>
              <p className="text-xs text-muted-foreground truncate">admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border glass shrink-0 flex items-center justify-end px-6 gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-secondary transition-all duration-200 hover-scale"
            >
              <Icon name="Bell" size={16} className="text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-violet-500 border-0">
                  {unreadCount}
                </Badge>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 glass border border-border rounded-xl shadow-2xl z-50 animate-notification-drop">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="font-semibold text-sm">Уведомления</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markReadMutation.mutate("all")}
                      className="text-xs text-primary hover:underline"
                    >
                      Прочитать все
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      Нет уведомлений
                    </div>
                  ) : (
                    notifications.map((n: {id: number; title: string; message: string; type: string; is_read: boolean; created_at: string}) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                        className={`p-4 border-b border-border/50 cursor-pointer transition-all duration-200 hover:bg-secondary/50 ${
                          !n.is_read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            n.type === "task" ? "bg-violet-400" :
                            n.type === "comment" ? "bg-cyan-400" :
                            "bg-pink-400"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                          {!n.is_read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Avatar className="w-8 h-8 cursor-pointer hover-scale">
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-400 text-white text-xs font-bold">
              АП
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto scrollbar-thin mesh-bg">
          {children}
        </main>
      </div>

      {/* Overlay for closing notifications */}
      {notifOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
      )}
    </div>
  );
}
