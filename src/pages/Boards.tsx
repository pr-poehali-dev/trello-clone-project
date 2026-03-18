import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "@/lib/api";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

const COLORS = [
  { key: "purple", from: "from-violet-600", to: "to-purple-800", label: "Фиолет" },
  { key: "cyan", from: "from-cyan-500", to: "to-blue-700", label: "Синий" },
  { key: "pink", from: "from-pink-500", to: "to-rose-700", label: "Розовый" },
  { key: "green", from: "from-emerald-500", to: "to-teal-700", label: "Зелёный" },
  { key: "orange", from: "from-orange-500", to: "to-red-700", label: "Оранжевый" },
];

const colorMap: Record<string, string> = {
  purple: "from-violet-600 to-purple-800",
  cyan: "from-cyan-500 to-blue-700",
  pink: "from-pink-500 to-rose-700",
  green: "from-emerald-500 to-teal-700",
  orange: "from-orange-500 to-red-700",
};

interface Board {
  id: number;
  title: string;
  description?: string;
  cover_color: string;
  is_starred: boolean;
  created_at: string;
}

export default function Boards() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", cover_color: "purple" });

  const { data: boards = [], isLoading } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: boardsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: boardsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      setOpen(false);
      setForm({ title: "", description: "", cover_color: "purple" });
    },
  });

  const starMutation = useMutation({
    mutationFn: ({ id, is_starred }: { id: number; is_starred: boolean }) =>
      boardsApi.star(id, is_starred),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: boardsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });

  const starred = boards.filter((b) => b.is_starred);
  const all = boards.filter((b) => !b.is_starred);

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gradient-purple">Мои доски</h1>
            <p className="text-muted-foreground mt-1">{boards.length} досок в вашем пространстве</p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Новая доска
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 rounded-xl glass animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {starred.length > 0 && (
              <section className="mb-8 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Star" size={16} className="text-yellow-400" />
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Избранные</h2>
                </div>
                <BoardGrid
                  boards={starred}
                  onOpen={(id) => navigate(`/board/${id}`)}
                  onStar={(b) => starMutation.mutate({ id: b.id, is_starred: !b.is_starred })}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              </section>
            )}

            <section className="animate-slide-in-left">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="LayoutDashboard" size={16} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Все доски</h2>
              </div>
              {all.length === 0 && starred.length === 0 ? (
                <div className="text-center py-16 animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl glass mx-auto flex items-center justify-center mb-4 animate-float">
                    <Icon name="LayoutDashboard" size={28} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Досок пока нет. Создайте первую!</p>
                </div>
              ) : (
                <BoardGrid
                  boards={all}
                  onOpen={(id) => navigate(`/board/${id}`)}
                  onStar={(b) => starMutation.mutate({ id: b.id, is_starred: !b.is_starred })}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              )}
            </section>
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle className="text-gradient-purple">Новая доска</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Название доски"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-secondary border-border focus:border-primary"
            />
            <Input
              placeholder="Описание (необязательно)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-secondary border-border focus:border-primary"
            />
            <div>
              <p className="text-sm text-muted-foreground mb-3">Цвет обложки</p>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setForm({ ...form, cover_color: c.key })}
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.from} ${c.to} transition-all duration-200 ${
                      form.cover_color === c.key ? "ring-2 ring-white scale-110" : "hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className={`h-16 rounded-xl bg-gradient-to-br ${colorMap[form.cover_color]} flex items-end p-3 transition-all duration-300`}>
              <span className="text-white font-semibold text-sm">{form.title || "Название доски"}</span>
            </div>

            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.title || createMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0"
            >
              {createMutation.isPending ? "Создание..." : "Создать доску"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function BoardGrid({
  boards,
  onOpen,
  onStar,
  onDelete,
}: {
  boards: Board[];
  onOpen: (id: number) => void;
  onStar: (b: Board) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {boards.map((board, i) => (
        <div
          key={board.id}
          className="group relative rounded-xl overflow-hidden cursor-pointer hover-scale animate-fade-in"
          style={{ animationDelay: `${i * 0.05}s` }}
          onClick={() => onOpen(board.id)}
        >
          <div className={`h-36 bg-gradient-to-br ${colorMap[board.cover_color] || colorMap.purple} p-4 flex flex-col justify-between`}>
            <div className="flex items-start justify-between">
              <h3 className="text-white font-bold text-lg leading-tight">{board.title}</h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => { e.stopPropagation(); onStar(board); }}
                  className="w-7 h-7 rounded-lg bg-black/20 backdrop-blur flex items-center justify-center hover:bg-black/40 transition-colors"
                >
                  <Icon name="Star" size={12} className={board.is_starred ? "text-yellow-300 fill-yellow-300" : "text-white"} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(board.id); }}
                  className="w-7 h-7 rounded-lg bg-black/20 backdrop-blur flex items-center justify-center hover:bg-red-500/60 transition-colors"
                >
                  <Icon name="Trash2" size={12} className="text-white" />
                </button>
              </div>
            </div>
            {board.description && (
              <p className="text-white/70 text-xs line-clamp-2">{board.description}</p>
            )}
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={11} className="text-white/50" />
              <span className="text-white/50 text-xs">
                {new Date(board.created_at).toLocaleDateString("ru")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
