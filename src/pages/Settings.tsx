import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const SECTIONS = ["Профиль", "Уведомления", "Внешний вид", "Безопасность"];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("Профиль");
  const [notifications, setNotifications] = useState({
    newTask: true,
    comments: true,
    teamInvites: true,
    dueDates: false,
    digest: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient-purple">Настройки</h1>
          <p className="text-muted-foreground mt-1">Управляйте параметрами вашего аккаунта</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 shrink-0 animate-slide-in-left">
            <nav className="space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    activeSection === section
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {section}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 animate-fade-in">
            {activeSection === "Профиль" && (
              <div className="glass border border-border rounded-2xl p-6 space-y-5">
                <h2 className="font-semibold flex items-center gap-2">
                  <Icon name="User" size={16} className="text-primary" />
                  Данные профиля
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Имя</label>
                    <Input defaultValue="Алексей" className="bg-secondary border-border" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Фамилия</label>
                    <Input defaultValue="Петров" className="bg-secondary border-border" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                  <Input defaultValue="alex@example.com" type="email" className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">О себе</label>
                  <Input placeholder="Расскажите о себе..." className="bg-secondary border-border" />
                </div>
                <Button
                  onClick={handleSave}
                  className={`transition-all duration-300 ${saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gradient-to-r from-violet-600 to-cyan-500"} text-white border-0`}
                >
                  {saved ? (
                    <>
                      <Icon name="Check" size={14} className="mr-2" />
                      Сохранено!
                    </>
                  ) : "Сохранить изменения"}
                </Button>
              </div>
            )}

            {activeSection === "Уведомления" && (
              <div className="glass border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Icon name="Bell" size={16} className="text-primary" />
                  Уведомления
                </h2>
                {[
                  { key: "newTask", label: "Новые задачи", desc: "Оповещать при назначении задачи" },
                  { key: "comments", label: "Комментарии", desc: "Оповещать при новых комментариях" },
                  { key: "teamInvites", label: "Приглашения", desc: "Оповещать при приглашении в команду" },
                  { key: "dueDates", label: "Дедлайны", desc: "Напоминать о приближающихся дедлайнах" },
                  { key: "digest", label: "Дайджест", desc: "Еженедельный отчёт об активности" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
                    />
                  </div>
                ))}
                <Button onClick={handleSave} className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0">
                  {saved ? "Сохранено!" : "Сохранить"}
                </Button>
              </div>
            )}

            {activeSection === "Внешний вид" && (
              <div className="glass border border-border rounded-2xl p-6 space-y-5">
                <h2 className="font-semibold flex items-center gap-2">
                  <Icon name="Palette" size={16} className="text-primary" />
                  Внешний вид
                </h2>
                <div>
                  <p className="text-sm font-medium mb-3">Тема оформления</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Тёмная (по умолч.)", "Светлая"].map((theme) => (
                      <button
                        key={theme}
                        className={`p-3 rounded-xl border text-sm transition-all duration-200 ${
                          theme.includes("Тёмная")
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-3">Акцентный цвет</p>
                  <div className="flex gap-3">
                    {[
                      { name: "Фиолетовый", class: "bg-violet-500" },
                      { name: "Синий", class: "bg-cyan-500" },
                      { name: "Розовый", class: "bg-pink-500" },
                      { name: "Зелёный", class: "bg-emerald-500" },
                    ].map((color) => (
                      <button
                        key={color.name}
                        className={`w-8 h-8 rounded-full ${color.class} hover:scale-110 transition-transform ${
                          color.name === "Фиолетовый" ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "Безопасность" && (
              <div className="glass border border-border rounded-2xl p-6 space-y-5">
                <h2 className="font-semibold flex items-center gap-2">
                  <Icon name="Shield" size={16} className="text-primary" />
                  Безопасность
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Текущий пароль</label>
                    <Input type="password" placeholder="••••••••" className="bg-secondary border-border" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Новый пароль</label>
                    <Input type="password" placeholder="••••••••" className="bg-secondary border-border" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Повторите пароль</label>
                    <Input type="password" placeholder="••••••••" className="bg-secondary border-border" />
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-border">
                  <div>
                    <p className="text-sm font-medium">Двухфакторная аутентификация</p>
                    <p className="text-xs text-muted-foreground">Повышенная защита аккаунта</p>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground border-border">
                    Скоро
                  </Badge>
                </div>
                <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0">
                  Обновить пароль
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
