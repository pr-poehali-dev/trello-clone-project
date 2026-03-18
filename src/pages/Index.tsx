/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import * as api from "@/api";

// ───── Types ─────
type CardLabel = "urgent" | "feature" | "bug" | "design" | "review";
type View = "boards" | "board-detail" | "profile" | "team" | "settings";

const LABEL_CONFIG: Record<CardLabel, { color: string; text: string }> = {
  urgent:  { color: "bg-rose-500/20 text-rose-300 border border-rose-500/30",       text: "Срочно" },
  feature: { color: "bg-violet-500/20 text-violet-300 border border-violet-500/30", text: "Фича" },
  bug:     { color: "bg-red-500/20 text-red-300 border border-red-500/30",          text: "Баг" },
  design:  { color: "bg-pink-500/20 text-pink-300 border border-pink-500/30",       text: "Дизайн" },
  review:  { color: "bg-amber-500/20 text-amber-300 border border-amber-500/30",    text: "Ревью" },
};

const COLOR_GRADIENTS: Record<string, string> = {
  purple: "from-violet-600 to-purple-800",
  cyan:   "from-cyan-500 to-blue-700",
  pink:   "from-pink-500 to-rose-700",
  green:  "from-emerald-500 to-teal-700",
  orange: "from-orange-500 to-amber-700",
  blue:   "from-blue-500 to-indigo-700",
};

const COL_COLORS = [
  "from-slate-500 to-slate-600",
  "from-violet-600 to-purple-700",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-500 to-blue-600",
];

// ───── Skeleton ─────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

// ───── KanbanCard ─────
function KanbanCard({ card, onDelete }: { card: any; onDelete: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const labels: string[] = card.labels || [];
  return (
    <div
      className={`card-drag glass rounded-xl p-3 mb-2 group relative transition-all duration-200
        ${hovered ? "neon-border-purple shadow-lg shadow-violet-900/20" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {labels.map((l: string) => {
            const cfg = LABEL_CONFIG[l as CardLabel];
            return cfg ? (
              <span key={l} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                {cfg.text}
              </span>
            ) : null;
          })}
        </div>
      )}
      <p className="text-sm font-medium text-foreground leading-snug mb-2">{card.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {card.due_date && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Icon name="Calendar" size={11} />
              {new Date(card.due_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
            </span>
          )}
          {card.priority === "high" && (
            <span className="flex items-center gap-1 text-[11px] text-rose-400">
              <Icon name="Flame" size={11} /> Высокий
            </span>
          )}
        </div>
        {card.assignee_id && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600
            flex items-center justify-center text-[9px] font-bold text-white">
            {card.assignee_id}
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
function KanbanColumn({ column, cards, boardId, onDeleteCard, onAddCard }: {
  column: any;
  cards: any[];
  boardId: number;
  onDeleteCard: (cardId: number) => void;
  onAddCard: (listId: number, title: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const colorIdx = (column.position ?? 0) % COL_COLORS.length;

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setLoading(true);
    await onAddCard(column.id, newTitle.trim());
    setNewTitle("");
    setAdding(false);
    setLoading(false);
  };

  return (
    <div className="flex-shrink-0 w-72 flex flex-col" style={{ maxHeight: "calc(100vh - 180px)" }}>
      <div className={`rounded-t-xl p-3 bg-gradient-to-r ${column.color || COL_COLORS[colorIdx]}`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white text-sm">{column.title}</span>
          <span className="bg-white/20 text-white text-xs font-bold w-6 h-6 rounded-full
            flex items-center justify-center">{cards.length}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin bg-white/[0.02] rounded-b-xl p-2
        border border-t-0 border-white/5 min-h-[60px]">
        {cards.map((card, i) => (
          <div key={card.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
            <KanbanCard card={card} onDelete={onDeleteCard} />
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
              <button onClick={handleAdd} disabled={loading}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white
                  text-xs font-medium py-1.5 rounded-lg transition-colors">
                {loading ? "..." : "Добавить"}
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
function BoardsView({ boards, loading, onSelect, onCreateBoard }: {
  boards: any[];
  loading: boolean;
  onSelect: (b: any) => void;
  onCreateBoard: () => void;
}) {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient-purple mb-1">Мои доски</h1>
        <p className="text-muted-foreground text-sm">Управляй проектами в одном месте</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
        ) : (
          <>
            {boards.map((board, i) => {
              const gradient = board.gradient || COLOR_GRADIENTS[board.cover_color] || COLOR_GRADIENTS.purple;
              return (
                <button key={board.id} onClick={() => onSelect(board)}
                  className="glass-hover glass rounded-2xl overflow-hidden text-left group animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`h-24 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-30"
                      style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)" }} />
                    {board.is_starred && (
                      <div className="absolute top-2 right-2">
                        <Icon name="Star" size={14} className="text-amber-300 fill-amber-300" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-base leading-tight">{board.title}</h3>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Users" size={12} /> {board.members ?? 1}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="LayoutList" size={12} /> {board.cards ?? 0}
                      </span>
                    </div>
                    <Icon name="ArrowRight" size={14}
                      className="text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
            <button onClick={onCreateBoard}
              className="glass-hover glass rounded-2xl flex flex-col items-center justify-center
                gap-2 text-muted-foreground hover:text-violet-400 transition-colors border-dashed"
              style={{ minHeight: "140px" }}>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <Icon name="Plus" size={20} />
              </div>
              <span className="text-sm font-medium">Новая доска</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ───── Board Detail View ─────
function BoardDetailView({ board }: { board: any }) {
  const [lists, setLists] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const gradient = board.gradient || COLOR_GRADIENTS[board.cover_color] || COLOR_GRADIENTS.purple;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ls, cs] = await Promise.all([api.getLists(board.id), api.getCards(board.id)]);
      setLists(ls);
      setCards(cs);
    } finally { setLoading(false); }
  }, [board.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDeleteCard = async (cardId: number) => {
    await api.deleteCard(cardId);
    setCards(cs => cs.filter(c => c.id !== cardId));
  };

  const handleAddCard = async (listId: number, title: string) => {
    const newCard = await api.createCard({ list_id: listId, board_id: board.id, title });
    setCards(cs => [...cs, newCard]);
  };

  const handleAddList = async () => {
    const title = prompt("Название нового списка:");
    if (!title?.trim()) return;
    const newList = await api.createList({ board_id: board.id, title: title.trim(), position: lists.length });
    setLists(ls => [...ls, newList]);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className={`px-8 py-4 bg-gradient-to-r ${gradient} flex items-center gap-4 flex-shrink-0`}>
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
      {loading ? (
        <div className="flex gap-4 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72">
              <Skeleton className="h-10 rounded-t-xl" />
              <div className="bg-white/[0.02] rounded-b-xl p-2 border border-t-0 border-white/5">
                {Array.from({ length: 3 }).map((__, j) => <Skeleton key={j} className="h-20 mb-2 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin">
          <div className="flex gap-4 p-6 h-full items-start">
            {lists.map(col => (
              <KanbanColumn
                key={col.id}
                column={{ ...col, color: COL_COLORS[(col.position ?? 0) % COL_COLORS.length] }}
                cards={cards.filter(c => c.list_id === col.id)}
                boardId={board.id}
                onDeleteCard={handleDeleteCard}
                onAddCard={handleAddCard}
              />
            ))}
            <div className="flex-shrink-0 w-72">
              <button onClick={handleAddList}
                className="w-full glass rounded-xl p-3 flex items-center gap-2 text-muted-foreground
                  hover:text-foreground hover:bg-white/5 transition-all text-sm">
                <Icon name="Plus" size={16} /> Добавить список
              </button>
            </div>
          </div>
        </div>
      )}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 text-center animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}>
            <Icon name={s.icon} size={20} className={`${s.color} mx-auto mb-2`} fallback="Square" />
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───── Team View ─────
function TeamView() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const FALLBACK = [
    { name: "Алекс Климов",    role: "Тимлид",    initials: "АК", color: "from-violet-500 to-purple-600", tasks_count: 8,  is_online: true },
    { name: "Мария Волкова",   role: "Дизайнер",  initials: "МВ", color: "from-pink-500 to-rose-600",     tasks_count: 5,  is_online: true },
    { name: "Дмитрий Соколов", role: "Бэкенд",    initials: "ДС", color: "from-cyan-500 to-blue-600",     tasks_count: 6,  is_online: false },
    { name: "Ольга Нева",      role: "Фронтенд",  initials: "ОН", color: "from-emerald-500 to-teal-600",  tasks_count: 4,  is_online: true },
    { name: "Иван Лебедь",     role: "QA",        initials: "ИЛ", color: "from-amber-500 to-orange-600",  tasks_count: 3,  is_online: false },
  ];

  useEffect(() => {
    api.getTeam().then(data => setMembers(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const display = members.length > 0 ? members : FALLBACK;
  const online = display.filter(m => m.is_online).length;

  return (
    <div className="p-8 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient-purple mb-1">Команда</h1>
          <p className="text-muted-foreground text-sm">{display.length} участников · {online} онлайн</p>
        </div>
        <button className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2.5
          rounded-xl transition-colors flex items-center gap-2 font-medium">
          <Icon name="UserPlus" size={16} /> Пригласить
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
        ) : display.map((m: any, i: number) => (
          <div key={i} className="glass glass-hover rounded-2xl p-5 animate-fade-in"
            style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color || "from-violet-500 to-purple-600"}
                flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative`}>
                {m.initials || (m.name || "?")[0]}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2
                  border-background ${m.is_online ? "bg-emerald-400" : "bg-slate-500"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{m.name}</h3>
                <p className="text-xs text-muted-foreground">{m.role}</p>
                <p className={`text-xs mt-0.5 font-medium ${m.is_online ? "text-emerald-400" : "text-slate-500"}`}>
                  {m.is_online ? "Онлайн" : "Офлайн"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">{m.tasks_count ?? 0}</span> активных задач
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
  const [pushNotif,  setPushNotif]  = useState(true);
  const [mentions,   setMentions]   = useState(true);
  const [deadlines,  setDeadlines]  = useState(true);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative ${value ? "bg-violet-600" : "bg-white/10"}`}>
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${value ? "left-6" : "left-1"}`} />
    </button>
  );

  const toggleItems = [
    { label: "Email-уведомления", desc: "Дайджест на почту",                  val: emailNotif, fn: () => setEmailNotif(v => !v) },
    { label: "Push-уведомления",  desc: "Мгновенные оповещения в браузере",   val: pushNotif,  fn: () => setPushNotif(v => !v) },
    { label: "Упоминания",        desc: "Когда вас упоминают в комментариях", val: mentions,   fn: () => setMentions(v => !v) },
    { label: "Дедлайны",          desc: "Напоминания о срочных задачах",      val: deadlines,  fn: () => setDeadlines(v => !v) },
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
function NotificationPanel({ notifications, unreadCount, onClose, onMarkAll }: {
  notifications: any[];
  unreadCount: number;
  onClose: () => void;
  onMarkAll: () => void;
}) {
  const iconMap: Record<string, string> = {
    assignment: "UserCheck", comment: "MessageCircle", move: "ArrowRight",
    attachment: "Paperclip", deadline: "Clock", info: "Bell",
  };
  const colorMap: Record<string, string> = {
    assignment: "text-violet-400", comment: "text-cyan-400", move: "text-emerald-400",
    attachment: "text-amber-400",  deadline: "text-rose-400",  info: "text-slate-400",
  };

  return (
    <div className="absolute top-14 right-4 w-80 glass rounded-2xl shadow-2xl shadow-black/50
      border border-white/10 z-50 animate-notification-drop overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="font-semibold text-foreground text-sm">
          Уведомления {unreadCount > 0 && <span className="text-violet-400">({unreadCount})</span>}
        </span>
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
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">Нет уведомлений</div>
        ) : notifications.map((n: any, i: number) => (
          <div key={n.id}
            className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0
              hover:bg-white/5 transition-colors animate-fade-in ${!n.is_read ? "bg-violet-500/5" : ""}`}
            style={{ animationDelay: `${i * 40}ms` }}>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon name={iconMap[n.type] || "Bell"} size={14}
                className={colorMap[n.type] || "text-slate-400"} fallback="Bell" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-snug">{n.message || n.title}</p>
              <span className="text-[11px] text-muted-foreground">
                {new Date(n.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {!n.is_read && <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1 animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ───── Create Board Modal ─────
function CreateBoardModal({ onClose, onCreate }: { onClose: () => void; onCreate: (b: any) => void }) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("purple");
  const [loading, setLoading] = useState(false);

  const colors = [
    { key: "purple", cls: "bg-gradient-to-br from-violet-600 to-purple-800" },
    { key: "cyan",   cls: "bg-gradient-to-br from-cyan-500 to-blue-700" },
    { key: "pink",   cls: "bg-gradient-to-br from-pink-500 to-rose-700" },
    { key: "green",  cls: "bg-gradient-to-br from-emerald-500 to-teal-700" },
    { key: "orange", cls: "bg-gradient-to-br from-orange-500 to-amber-700" },
  ];

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const board = await api.createBoard({ title: title.trim(), cover_color: color });
      onCreate({ ...board, gradient: COLOR_GRADIENTS[color] });
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass rounded-2xl p-6 w-full max-w-sm animate-scale-in border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-foreground text-lg">Новая доска</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className={`h-20 rounded-xl mb-4 bg-gradient-to-br ${COLOR_GRADIENTS[color]} flex items-end p-3`}>
          <span className="text-white font-bold text-sm">{title || "Название доски"}</span>
        </div>
        <input autoFocus type="text" placeholder="Название доски"
          value={title} onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          className="w-full glass rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground
            outline-none border border-white/10 focus:border-violet-500/50 mb-4" />
        <div className="flex gap-2 mb-5">
          {colors.map(c => (
            <button key={c.key} onClick={() => setColor(c.key)}
              className={`flex-1 h-8 rounded-lg ${c.cls} transition-all
                ${color === c.key ? "ring-2 ring-white/60 scale-105" : "opacity-60 hover:opacity-100"}`} />
          ))}
        </div>
        <button onClick={handleCreate} disabled={!title.trim() || loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium
            py-2.5 rounded-xl transition-colors">
          {loading ? "Создаём..." : "Создать доску"}
        </button>
      </div>
    </div>
  );
}

// ───── Main App ─────
export default function Index() {
  const [view, setView] = useState<View>("boards");
  const [selectedBoard, setSelectedBoard] = useState<any>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  useEffect(() => {
    api.getBoards().then(data => setBoards(data)).finally(() => setBoardsLoading(false));
    api.getNotifications(1).then(data => setNotifications(data.notifications || [])).catch(() => {});
  }, []);

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
              unreadCount={unreadCount}
              onClose={() => setShowNotif(false)}
              onMarkAll={() => {
                api.markAllRead(1).catch(() => {});
                setNotifications(ns => ns.map(n => ({ ...n, is_read: true })));
              }}
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
          <BoardsView boards={boards} loading={boardsLoading}
            onSelect={b => { setSelectedBoard(b); setView("board-detail"); }}
            onCreateBoard={() => setShowCreateBoard(true)} />
        )}
        {view === "board-detail" && selectedBoard && <BoardDetailView board={selectedBoard} />}
        {view === "profile"  && <ProfileView />}
        {view === "team"     && <TeamView />}
        {view === "settings" && <SettingsView />}
      </main>

      {showNotif && <div className="fixed inset-0 z-30" onClick={() => setShowNotif(false)} />}
      {showCreateBoard && (
        <CreateBoardModal
          onClose={() => setShowCreateBoard(false)}
          onCreate={b => setBoards(prev => [b, ...prev])}
        />
      )}
    </div>
  );
}
