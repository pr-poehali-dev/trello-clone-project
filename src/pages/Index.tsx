import { useState } from "react";
import Icon from "@/components/ui/icon";

// ───── Types ─────
type CardLabel = "urgent" | "feature" | "bug" | "design" | "review";
type Card = {
  id: string;
  title: string;
  labels?: CardLabel[];
  assignee?: string;
  dueDate?: string;
  comments?: number;
  attachments?: number;
};
type Column = { id: string; title: string; color: string; cards: Card[] };
type Board = { id: string; title: string; gradient: string; members: number; cards: number };
type Notification = { id: string; text: string; time: string; read: boolean; icon: string; color: string };
type View = "boards" | "board-detail" | "profile" | "team" | "settings";

// ───── Static data ─────
const LABEL_CONFIG: Record<CardLabel, { color: string; text: string }> = {
  urgent:  { color: "bg-rose-500/20 text-rose-300 border border-rose-500/30",       text: "Срочно" },
  feature: { color: "bg-violet-500/20 text-violet-300 border border-violet-500/30", text: "Фича" },
  bug:     { color: "bg-red-500/20 text-red-300 border border-red-500/30",          text: "Баг" },
  design:  { color: "bg-pink-500/20 text-pink-300 border border-pink-500/30",       text: "Дизайн" },
  review:  { color: "bg-amber-500/20 text-amber-300 border border-amber-500/30",    text: "Ревью" },
};

const INITIAL_BOARDS: Board[] = [
  { id: "b1", title: "Редизайн сайта",         gradient: "from-violet-600 to-purple-800", members: 5, cards: 12 },
  { id: "b2", title: "Мобильное приложение",   gradient: "from-cyan-500 to-blue-700",     members: 3, cards: 8 },
  { id: "b3", title: "Маркетинг Q2",           gradient: "from-pink-500 to-rose-700",     members: 4, cards: 15 },
  { id: "b4", title: "Бэкенд API v2",          gradient: "from-emerald-500 to-teal-700",  members: 2, cards: 6 },
  { id: "b5", title: "Аналитика и данные",      gradient: "from-orange-500 to-amber-700",  members: 3, cards: 9 },
];

const INITIAL_COLUMNS: Column[] = [
  {
    id: "c1", title: "Бэклог", color: "from-slate-500 to-slate-600",
    cards: [
      { id: "k1", title: "Исследование конкурентов",    labels: ["feature"], assignee: "АК", dueDate: "25 мар", comments: 3, attachments: 1 },
      { id: "k2", title: "Настроить CI/CD пайплайн",   labels: ["feature"], assignee: "МВ", comments: 1 },
      { id: "k3", title: "Документация API",                                 assignee: "ДС", dueDate: "30 мар", attachments: 2 },
    ],
  },
  {
    id: "c2", title: "В работе", color: "from-violet-600 to-purple-700",
    cards: [
      { id: "k4", title: "Редизайн главной страницы",  labels: ["design"],          assignee: "АК", dueDate: "22 мар", comments: 5, attachments: 3 },
      { id: "k5", title: "Баг с авторизацией OAuth",   labels: ["bug", "urgent"],   assignee: "МВ", dueDate: "20 мар", comments: 8 },
      { id: "k6", title: "Оптимизация запросов БД",    labels: ["feature"],          assignee: "ДС" },
    ],
  },
  {
    id: "c3", title: "Ревью", color: "from-amber-500 to-orange-600",
    cards: [
      { id: "k7", title: "Компонент навигации",        labels: ["review", "design"], assignee: "АК", comments: 2 },
      { id: "k8", title: "Тесты модуля оплаты",        labels: ["review"],           assignee: "МВ", dueDate: "21 мар", attachments: 1 },
    ],
  },
  {
    id: "c4", title: "Готово", color: "from-emerald-500 to-teal-600",
    cards: [
      { id: "k9",  title: "Онбординг пользователей",   labels: ["feature"], assignee: "ДС", comments: 4, attachments: 2 },
      { id: "k10", title: "Email-шаблоны",             labels: ["design"],  assignee: "АК" },
      { id: "k11", title: "Интеграция со Slack",        labels: ["feature"], assignee: "МВ", comments: 1 },
    ],
  },
];

const NOTIFICATIONS: Notification[] = [
  { id: "n1", text: "Алекс назначил вас исполнителем задачи «Баг с авторизацией»",   time: "2 мин",  read: false, icon: "UserCheck",    color: "text-violet-400" },
  { id: "n2", text: "Мария добавила комментарий к «Редизайн главной страницы»",      time: "15 мин", read: false, icon: "MessageCircle", color: "text-cyan-400" },
  { id: "n3", text: "Задача «CI/CD пайплайн» переведена в Ревью",                    time: "1 ч",    read: false, icon: "ArrowRight",    color: "text-emerald-400" },
  { id: "n4", text: "Дмитрий прикрепил файл к «Документация API»",                   time: "3 ч",    read: true,  icon: "Paperclip",     color: "text-amber-400" },
  { id: "n5", text: "Срок «Баг с авторизацией OAuth» истекает завтра",               time: "5 ч",    read: true,  icon: "Clock",         color: "text-rose-400" },
];

const TEAM_MEMBERS = [
  { name: "Алекс Климов",    role: "Тимлид",    initials: "АК", color: "from-violet-500 to-purple-600",  tasks: 8, online: true },
  { name: "Мария Волкова",   role: "Дизайнер",  initials: "МВ", color: "from-pink-500 to-rose-600",      tasks: 5, online: true },
  { name: "Дмитрий Соколов", role: "Бэкенд",    initials: "ДС", color: "from-cyan-500 to-blue-600",      tasks: 6, online: false },
  { name: "Ольга Нева",      role: "Фронтенд",  initials: "ОН", color: "from-emerald-500 to-teal-600",   tasks: 4, online: true },
  { name: "Иван Лебедь",     role: "QA-инженер",initials: "ИЛ", color: "from-amber-500 to-orange-600",   tasks: 3, online: false },
];

// ───── KanbanCard ─────
function KanbanCard({ card, onDelete }: { card: Card; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`card-drag glass rounded-xl p-3 mb-2 group relative transition-all duration-200
        ${hovered ? "neon-border-purple shadow-lg shadow-violet-900/20" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map(l => (
            <span key={l} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${LABEL_CONFIG[l].color}`}>
              {LABEL_CONFIG[l].text}
            </span>
          ))}
        </div>
      )}
      <p className="text-sm font-medium text-foreground leading-snug mb-2">{card.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {card.dueDate && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Icon name="Calendar" size={11} /> {card.dueDate}
            </span>
          )}
          {(card.comments ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Icon name="MessageCircle" size={11} /> {card.comments}
            </span>
          )}
          {(card.attachments ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Icon name="Paperclip" size={11} /> {card.attachments}
            </span>
          )}
        </div>
        {card.assignee && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600
            flex items-center justify-center text-[9px] font-bold text-white">
            {card.assignee}
          </div>
        )}
      </div>
      <button
        onClick={() => onDelete(card.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
          w-5 h-5 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center"
      >
        <Icon name="X" size={10} className="text-muted-foreground" />
      </button>
    </div>
  );
}

// ───── KanbanColumn ─────
function KanbanColumn({ column, onDeleteCard, onAddCard }: {
  column: Column;
  onDeleteCard: (colId: string, cardId: string) => void;
  onAddCard: (colId: string, title: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddCard(column.id, newTitle.trim());
      setNewTitle("");
      setAdding(false);
    }
  };

  return (
    <div className="flex-shrink-0 w-72 flex flex-col" style={{ maxHeight: "calc(100vh - 180px)" }}>
      <div className={`rounded-t-xl p-3 bg-gradient-to-r ${column.color}`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white text-sm">{column.title}</span>
          <span className="bg-white/20 text-white text-xs font-bold w-6 h-6 rounded-full
            flex items-center justify-center">{column.cards.length}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin bg-white/[0.02] rounded-b-xl p-2
        border border-t-0 border-white/5 min-h-[60px]">
        {column.cards.map((card, i) => (
          <div key={card.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <KanbanCard card={card} onDelete={(cid) => onDeleteCard(column.id, cid)} />
          </div>
        ))}
        {adding ? (
          <div className="glass rounded-xl p-3 mt-1 animate-scale-in">
            <textarea
              autoFocus
              className="w-full bg-transparent text-sm text-foreground placeholder-muted-foreground
                resize-none outline-none border-none h-16"
              placeholder="Название задачи..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
                if (e.key === "Escape") setAdding(false);
              }}
            />
            <div className="flex gap-2 mt-1">
              <button onClick={handleAdd}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium
                  py-1.5 rounded-lg transition-colors">
                Добавить
              </button>
              <button onClick={() => { setAdding(false); setNewTitle(""); }}
                className="px-3 text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full mt-1 flex items-center gap-2 text-muted-foreground hover:text-foreground
              text-xs py-2 px-2 rounded-lg hover:bg-white/5 transition-all group">
            <Icon name="Plus" size={14} className="group-hover:text-violet-400 transition-colors" />
            Добавить карточку
          </button>
        )}
      </div>
    </div>
  );
}

// ───── Boards View ─────
function BoardsView({ boards, onSelect }: { boards: Board[]; onSelect: (b: Board) => void }) {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient-purple mb-1">Мои доски</h1>
        <p className="text-muted-foreground text-sm">Управляй проектами в одном месте</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {boards.map((board, i) => (
          <button key={board.id} onClick={() => onSelect(board)}
            className="glass-hover glass rounded-2xl overflow-hidden text-left group animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`h-24 bg-gradient-to-br ${board.gradient} relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)" }} />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-base leading-tight">{board.title}</h3>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Icon name="Users" size={12} /> {board.members}</span>
                <span className="flex items-center gap-1"><Icon name="LayoutList" size={12} /> {board.cards}</span>
              </div>
              <Icon name="ArrowRight" size={14}
                className="text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
        <button className="glass-hover glass rounded-2xl flex flex-col items-center justify-center
          gap-2 text-muted-foreground hover:text-violet-400 transition-colors border-dashed"
          style={{ minHeight: "140px" }}>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <Icon name="Plus" size={20} />
          </div>
          <span className="text-sm font-medium">Новая доска</span>
        </button>
      </div>
    </div>
  );
}

// ───── Board Detail View ─────
function BoardDetailView({ board, columns, setColumns }: {
  board: Board;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
}) {
  const handleDeleteCard = (colId: string, cardId: string) => {
    setColumns(cols => cols.map(c =>
      c.id === colId ? { ...c, cards: c.cards.filter(k => k.id !== cardId) } : c
    ));
  };
  const handleAddCard = (colId: string, title: string) => {
    setColumns(cols => cols.map(c =>
      c.id === colId ? { ...c, cards: [...c.cards, { id: `k${Date.now()}`, title }] } : c
    ));
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className={`px-8 py-4 bg-gradient-to-r ${board.gradient} flex items-center gap-4`}>
        <h2 className="text-white font-bold text-xl">{board.title}</h2>
        <div className="flex items-center gap-2 ml-auto">
          {["АК","МВ","ДС"].map((init, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40
              flex items-center justify-center text-white text-xs font-bold -ml-2 first:ml-0">
              {init}
            </div>
          ))}
          <button className="ml-2 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5
            rounded-lg transition-colors flex items-center gap-1">
            <Icon name="UserPlus" size={12} /> Пригласить
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin">
        <div className="flex gap-4 p-6 h-full items-start">
          {columns.map(col => (
            <KanbanColumn key={col.id} column={col}
              onDeleteCard={handleDeleteCard} onAddCard={handleAddCard} />
          ))}
          <div className="flex-shrink-0 w-72">
            <button className="w-full glass rounded-xl p-3 flex items-center gap-2 text-muted-foreground
              hover:text-foreground hover:bg-white/5 transition-all text-sm">
              <Icon name="Plus" size={16} /> Добавить список
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───── Profile View ─────
function ProfileView() {
  const stats = [
    { label: "Выполнено",    value: "47",  icon: "CheckSquare",   color: "text-emerald-400" },
    { label: "В процессе",   value: "8",   icon: "Clock",         color: "text-amber-400" },
    { label: "Проектов",     value: "5",   icon: "Layout",        color: "text-violet-400" },
    { label: "Комментариев", value: "124", icon: "MessageCircle", color: "text-cyan-400" },
  ];
  return (
    <div className="p-8 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-bold text-gradient-purple mb-8">Профиль</h1>
      <div className="glass rounded-2xl p-6 mb-6 flex items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700
          flex items-center justify-center text-white text-2xl font-bold animate-float flex-shrink-0">
          АК
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">Алекс Климов</h2>
          <p className="text-violet-400 font-medium text-sm mb-1">Тимлид</p>
          <p className="text-muted-foreground text-sm">a.klimov@company.ru</p>
          <div className="flex gap-2 mt-3">
            <button className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-4 py-2
              rounded-lg transition-colors font-medium">Редактировать</button>
            <button className="glass text-muted-foreground hover:text-foreground text-xs px-4 py-2
              rounded-lg transition-colors">Сменить фото</button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 text-center animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}>
            <Icon name={s.icon} size={20} className={`${s.color} mx-auto mb-2`} fallback="Square" />
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Последняя активность</h3>
        {NOTIFICATIONS.slice(0, 4).map((n, i) => (
          <div key={n.id} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0
            animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon name={n.icon} size={14} className={n.color} fallback="Bell" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{n.text}</p>
              <span className="text-xs text-muted-foreground">{n.time} назад</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───── Team View ─────
function TeamView() {
  return (
    <div className="p-8 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient-purple mb-1">Команда</h1>
          <p className="text-muted-foreground text-sm">5 участников · 3 онлайн</p>
        </div>
        <button className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2.5
          rounded-xl transition-colors flex items-center gap-2 font-medium">
          <Icon name="UserPlus" size={16} /> Пригласить
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEAM_MEMBERS.map((m, i) => (
          <div key={i} className="glass glass-hover rounded-2xl p-5 animate-fade-in"
            style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color}
                flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative`}>
                {m.initials}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2
                  border-background ${m.online ? "bg-emerald-400" : "bg-slate-500"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{m.name}</h3>
                <p className="text-xs text-muted-foreground">{m.role}</p>
                <p className={`text-xs mt-0.5 font-medium ${m.online ? "text-emerald-400" : "text-slate-500"}`}>
                  {m.online ? "Онлайн" : "Офлайн"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">{m.tasks}</span> активных задач
              </div>
              <button className="glass text-muted-foreground hover:text-foreground text-xs px-3 py-1.5
                rounded-lg transition-colors">Задачи</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───── Settings View ─────
function SettingsView() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif]   = useState(true);
  const [mentions, setMentions]     = useState(true);
  const [deadlines, setDeadlines]   = useState(true);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative
        ${value ? "bg-violet-600" : "bg-white/10"}`}>
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300
        ${value ? "left-6" : "left-1"}`} />
    </button>
  );

  const toggleItems = [
    { label: "Email-уведомления",           desc: "Получать дайджест на почту",                 val: emailNotif, fn: () => setEmailNotif(v => !v) },
    { label: "Push-уведомления",            desc: "Мгновенные оповещения в браузере",           val: pushNotif,  fn: () => setPushNotif(v => !v) },
    { label: "Упоминания",                  desc: "Когда вас упоминают в комментариях",         val: mentions,   fn: () => setMentions(v => !v) },
    { label: "Дедлайны",                    desc: "Напоминания о срочных задачах",              val: deadlines,  fn: () => setDeadlines(v => !v) },
  ];

  return (
    <div className="p-8 animate-fade-in max-w-2xl">
      <h1 className="text-3xl font-bold text-gradient-purple mb-8">Настройки</h1>

      <div className="glass rounded-2xl p-6 mb-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Bell" size={16} className="text-violet-400" /> Уведомления
        </h3>
        {toggleItems.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Toggle value={item.val} onChange={item.fn} />
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 mb-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Palette" size={16} className="text-pink-400" /> Внешний вид
        </h3>
        <div className="flex gap-2">
          {[{ label: "Тёмная", icon: "Moon" }, { label: "Светлая", icon: "Sun" }, { label: "Авто", icon: "Monitor" }].map((t, i) => (
            <button key={i}
              className={`flex-1 glass rounded-xl py-3 text-xs font-medium flex flex-col items-center gap-1.5
                transition-all ${i === 0 ? "border-violet-500/50 text-violet-400" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon name={t.icon} size={18} fallback="Circle" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Shield" size={16} className="text-emerald-400" /> Безопасность
        </h3>
        <div className="space-y-2">
          {["Сменить пароль", "Двухфакторная аутентификация"].map((item, i) => (
            <button key={i} className="w-full text-left glass text-sm text-foreground hover:text-violet-400
              px-4 py-3 rounded-xl transition-colors flex items-center justify-between group">
              {item}
              <Icon name="ChevronRight" size={14} className="text-muted-foreground group-hover:text-violet-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───── Notification Panel ─────
function NotificationPanel({ notifications, onClose, onMarkAll }: {
  notifications: Notification[];
  onClose: () => void;
  onMarkAll: () => void;
}) {
  return (
    <div className="absolute top-14 right-4 w-80 glass rounded-2xl shadow-2xl shadow-black/50
      border border-white/10 z-50 animate-notification-drop overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="font-semibold text-foreground text-sm">Уведомления</span>
        <div className="flex items-center gap-2">
          <button onClick={onMarkAll} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            Все прочитаны
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {notifications.map((n, i) => (
          <div key={n.id}
            className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0
              hover:bg-white/5 transition-colors animate-fade-in ${!n.read ? "bg-violet-500/5" : ""}`}
            style={{ animationDelay: `${i * 40}ms` }}>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon name={n.icon} size={14} className={n.color} fallback="Bell" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-snug">{n.text}</p>
              <span className="text-[11px] text-muted-foreground">{n.time} назад</span>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1 animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ───── Main App ─────
export default function Index() {
  const [view, setView] = useState<View>("boards");
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [boards] = useState<Board[]>(INITIAL_BOARDS);
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [showNotif, setShowNotif] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: "boards",   label: "Доски",     icon: "Layout" },
    { id: "team",     label: "Команда",   icon: "Users" },
    { id: "profile",  label: "Профиль",   icon: "User" },
    { id: "settings", label: "Настройки", icon: "Settings" },
  ] as const;

  return (
    <div className="h-screen flex flex-col bg-background mesh-bg overflow-hidden">

      {/* ── Top Nav ── */}
      <header className="flex-shrink-0 h-14 glass border-b border-white/5 flex items-center px-4 gap-3 relative z-40">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700
            flex items-center justify-center animate-float">
            <Icon name="Zap" size={16} className="text-white" />
          </div>
          <span className="font-bold text-gradient-purple text-lg hidden sm:block">FlowBoard</span>
        </div>

        <nav className="flex items-center gap-1 flex-1">
          {navItems.map(item => (
            <button key={item.id}
              onClick={() => { setView(item.id as View); setSelectedBoard(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${view === item.id || (item.id === "boards" && view === "board-detail")
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
              <Icon name={item.icon} size={14} fallback="Circle" />
              <span className="hidden sm:block">{item.label}</span>
            </button>
          ))}
          {view === "board-detail" && selectedBoard && (
            <>
              <span className="text-white/20 mx-1">/</span>
              <span className="text-sm text-foreground font-medium truncate max-w-[160px]">
                {selectedBoard.title}
              </span>
            </>
          )}
        </nav>

        <div className="relative hidden md:flex items-center">
          <Icon name="Search" size={14} className="absolute left-3 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Поиск задач..."
            className="glass text-sm pl-8 pr-4 py-1.5 rounded-lg w-48 focus:w-64 transition-all
              placeholder-muted-foreground text-foreground outline-none" />
        </div>

        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all
              ${showNotif ? "bg-violet-600/20 text-violet-300" : "glass text-muted-foreground hover:text-foreground"}`}>
            <Icon name="Bell" size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-600
                flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotif && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setShowNotif(false)}
              onMarkAll={() => setNotifications(ns => ns.map(n => ({ ...n, read: true })))}
            />
          )}
        </div>

        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700
          flex items-center justify-center text-white text-xs font-bold cursor-pointer
          hover:scale-105 transition-transform">
          АК
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 overflow-auto scrollbar-thin">
        {view === "boards" && (
          <BoardsView boards={boards} onSelect={b => { setSelectedBoard(b); setView("board-detail"); }} />
        )}
        {view === "board-detail" && selectedBoard && (
          <BoardDetailView board={selectedBoard} columns={columns} setColumns={setColumns} />
        )}
        {view === "profile"  && <ProfileView />}
        {view === "team"     && <TeamView />}
        {view === "settings" && <SettingsView />}
      </main>

      {showNotif && <div className="fixed inset-0 z-30" onClick={() => setShowNotif(false)} />}
    </div>
  );
}
