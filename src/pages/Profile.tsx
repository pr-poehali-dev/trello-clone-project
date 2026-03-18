import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { boardsApi, cardsApi } from "@/lib/api";
import Icon from "@/components/ui/icon";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "Алексей Петров", email: "alex@example.com" });

  const { data: boards = [] } = useQuery({
    queryKey: ["boards"],
    queryFn: boardsApi.getAll,
  });

  const { data: cards = [] } = useQuery({
    queryKey: ["cards-all"],
    queryFn: () => cardsApi.getByBoard(1),
  });

  const stats = [
    { label: "Досок", value: (boards as {id:number}[]).length, icon: "LayoutDashboard", color: "text-violet-400" },
    { label: "Задач", value: (cards as {id:number}[]).length, icon: "CreditCard", color: "text-cyan-400" },
    { label: "Команд", value: 1, icon: "Users", color: "text-pink-400" },
    { label: "Дней активности", value: 12, icon: "Calendar", color: "text-emerald-400" },
  ];

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto">
        {/* Hero */}
        <div className="relative glass border border-border rounded-2xl overflow-hidden mb-6 animate-fade-in">
          <div className="h-24 bg-gradient-to-r from-violet-600 via-purple-700 to-cyan-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-4 border-background">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-400 text-white text-xl font-bold">
                    АП
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
              <Button
                variant={editing ? "default" : "outline"}
                size="sm"
                onClick={() => setEditing(!editing)}
                className={editing ? "bg-primary text-white" : "glass border-border"}
              >
                <Icon name={editing ? "Check" : "Pencil"} size={14} className="mr-1.5" />
                {editing ? "Сохранить" : "Редактировать"}
              </Button>
            </div>

            {editing ? (
              <div className="space-y-3 animate-scale-in">
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-secondary border-border"
                />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold">{form.name}</h1>
                  <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 border text-xs">
                    Администратор
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">{form.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-slide-in-right">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="glass border border-border rounded-xl p-4 text-center hover-scale transition-all duration-200"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <Icon name={stat.icon as never} size={20} className={`mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="glass border border-border rounded-2xl p-5 animate-slide-in-left">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="Activity" size={16} className="text-primary" />
            Последняя активность
          </h2>
          <div className="space-y-3">
            {[
              { action: "Создал доску", target: "Разработка продукта", time: "2 часа назад", icon: "Plus", color: "text-violet-400" },
              { action: "Завершил задачу", target: "Запуск MVP", time: "5 часов назад", icon: "CheckCircle", color: "text-emerald-400" },
              { action: "Обновил карточку", target: "Разработка API авторизации", time: "Вчера", icon: "Pencil", color: "text-cyan-400" },
              { action: "Пригласил в команду", target: "Мария Сидорова", time: "3 дня назад", icon: "UserPlus", color: "text-pink-400" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="w-7 h-7 rounded-lg glass flex items-center justify-center shrink-0">
                  <Icon name={item.icon as never} size={13} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="text-muted-foreground">{item.action} </span>
                    <span className="font-medium">"{item.target}"</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
