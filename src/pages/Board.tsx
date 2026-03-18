import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi, listsApi, cardsApi } from "@/lib/api";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";

const colorMap: Record<string, string> = {
  purple: "from-violet-600 to-purple-800",
  cyan: "from-cyan-500 to-blue-700",
  pink: "from-pink-500 to-rose-700",
  green: "from-emerald-500 to-teal-700",
  orange: "from-orange-500 to-red-700",
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Высокий" },
  medium: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Средний" },
  low: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Низкий" },
};

interface Card {
  id: number;
  list_id: number;
  board_id: number;
  title: string;
  description?: string;
  position: number;
  priority: string;
  due_date?: string;
  labels?: string[];
}

interface List {
  id: number;
  board_id: number;
  title: string;
  position: number;
}

interface CardModalData extends Card {
  list_title?: string;
}

export default function Board() {
  const { id } = useParams<{ id: string }>();
  const boardId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [newListTitle, setNewListTitle] = useState("");
  const [addingList, setAddingList] = useState(false);
  const [addingCardListId, setAddingCardListId] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardModalData | null>(null);
  const [editCard, setEditCard] = useState<Partial<Card>>({});

  const { data: board } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => boardsApi.getById(boardId),
    enabled: !!boardId,
  });

  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ["lists", boardId],
    queryFn: () => listsApi.getByBoard(boardId),
    enabled: !!boardId,
  });

  const { data: cards = [] } = useQuery<Card[]>({
    queryKey: ["cards", boardId],
    queryFn: () => cardsApi.getByBoard(boardId),
    enabled: !!boardId,
  });

  const createListMutation = useMutation({
    mutationFn: listsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", boardId] });
      setNewListTitle("");
      setAddingList(false);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: listsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists", boardId] }),
  });

  const createCardMutation = useMutation({
    mutationFn: cardsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards", boardId] });
      setNewCardTitle("");
      setAddingCardListId(null);
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => cardsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards", boardId] });
      setSelectedCard(null);
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: cardsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards", boardId] });
      setSelectedCard(null);
    },
  });

  const getListCards = (listId: number) =>
    cards.filter((c) => c.list_id === listId).sort((a, b) => a.position - b.position);

  const openCard = (card: Card) => {
    const list = lists.find((l) => l.id === card.list_id);
    setSelectedCard({ ...card, list_title: list?.title });
    setEditCard({ ...card });
  };

  if (!board) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  const gradient = colorMap[board.cover_color] || colorMap.purple;

  return (
    <Layout>
      {/* Board header */}
      <div className={`bg-gradient-to-r ${gradient} px-8 py-5`}>
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/")}
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <Icon name="ChevronLeft" size={14} />
            Доски
          </button>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{board.title}</h1>
          <div className="flex items-center gap-2">
            <Badge className="bg-black/20 text-white border-0 backdrop-blur">
              {lists.length} списков · {cards.length} задач
            </Badge>
          </div>
        </div>
      </div>

      {/* Board content */}
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {[...lists]
            .sort((a, b) => a.position - b.position)
            .map((list, idx) => {
              const listCards = getListCards(list.id);
              return (
                <div
                  key={list.id}
                  className="w-72 shrink-0 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="glass border border-border rounded-xl overflow-hidden">
                    {/* List header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{list.title}</span>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                          {listCards.length}
                        </Badge>
                      </div>
                      <button
                        onClick={() => deleteListMutation.mutate(list.id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>

                    {/* Cards */}
                    <div className="p-2 space-y-2 min-h-[60px]">
                      {listCards.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => openCard(card)}
                          className="card-drag glass-hover bg-card border border-border rounded-lg p-3 cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-snug flex-1">{card.title}</p>
                            <Icon name="MoreHorizontal" size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {card.priority && (
                              <Badge
                                className={`text-[10px] px-1.5 py-0 h-4 border ${priorityConfig[card.priority]?.color}`}
                                variant="outline"
                              >
                                {priorityConfig[card.priority]?.label}
                              </Badge>
                            )}
                            {card.labels?.slice(0, 2).map((l) => (
                              <Badge key={l} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {l}
                              </Badge>
                            ))}
                          </div>
                          {card.due_date && (
                            <div className="flex items-center gap-1 mt-2">
                              <Icon name="Clock" size={10} className="text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(card.due_date).toLocaleDateString("ru")}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add card */}
                      {addingCardListId === list.id ? (
                        <div className="space-y-2 animate-scale-in">
                          <Input
                            autoFocus
                            placeholder="Название задачи..."
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            className="bg-secondary border-border text-sm h-8"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newCardTitle.trim()) {
                                createCardMutation.mutate({
                                  list_id: list.id,
                                  board_id: boardId,
                                  title: newCardTitle.trim(),
                                  position: listCards.length,
                                });
                              }
                              if (e.key === "Escape") setAddingCardListId(null);
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-primary"
                              onClick={() => {
                                if (newCardTitle.trim()) {
                                  createCardMutation.mutate({
                                    list_id: list.id,
                                    board_id: boardId,
                                    title: newCardTitle.trim(),
                                    position: listCards.length,
                                  });
                                }
                              }}
                            >
                              Добавить
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => setAddingCardListId(null)}
                            >
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingCardListId(list.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 text-sm"
                        >
                          <Icon name="Plus" size={14} />
                          Добавить задачу
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Add list */}
          <div className="w-72 shrink-0">
            {addingList ? (
              <div className="glass border border-border rounded-xl p-3 space-y-2 animate-scale-in">
                <Input
                  autoFocus
                  placeholder="Название списка..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="bg-secondary border-border"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newListTitle.trim()) {
                      createListMutation.mutate({
                        board_id: boardId,
                        title: newListTitle.trim(),
                        position: lists.length,
                      });
                    }
                    if (e.key === "Escape") setAddingList(false);
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-primary text-white"
                    onClick={() => {
                      if (newListTitle.trim()) {
                        createListMutation.mutate({
                          board_id: boardId,
                          title: newListTitle.trim(),
                          position: lists.length,
                        });
                      }
                    }}
                  >
                    Создать
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddingList(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingList(true)}
                className="w-full glass border border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-300 hover-scale"
              >
                <Icon name="Plus" size={16} />
                <span className="text-sm">Добавить список</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card detail modal */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="glass border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="CreditCard" size={16} className="text-primary" />
              Редактировать задачу
            </DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4 pt-1">
              <div>
                <p className="text-xs text-muted-foreground mb-1">В списке: <span className="text-foreground">{selectedCard.list_title}</span></p>
                <Input
                  value={editCard.title || ""}
                  onChange={(e) => setEditCard({ ...editCard, title: e.target.value })}
                  className="bg-secondary border-border font-medium"
                />
              </div>
              <Textarea
                placeholder="Описание задачи..."
                value={editCard.description || ""}
                onChange={(e) => setEditCard({ ...editCard, description: e.target.value })}
                className="bg-secondary border-border resize-none"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Приоритет</p>
                  <Select
                    value={editCard.priority || "medium"}
                    onValueChange={(v) => setEditCard({ ...editCard, priority: v })}
                  >
                    <SelectTrigger className="bg-secondary border-border h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-border">
                      <SelectItem value="high">🔴 Высокий</SelectItem>
                      <SelectItem value="medium">🟡 Средний</SelectItem>
                      <SelectItem value="low">🟢 Низкий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Срок</p>
                  <Input
                    type="date"
                    value={editCard.due_date ? editCard.due_date.split("T")[0] : ""}
                    onChange={(e) => setEditCard({ ...editCard, due_date: e.target.value })}
                    className="bg-secondary border-border h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0"
                  onClick={() => updateCardMutation.mutate({ id: selectedCard.id, data: editCard })}
                  disabled={updateCardMutation.isPending}
                >
                  Сохранить
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteCardMutation.mutate(selectedCard.id)}
                  disabled={deleteCardMutation.isPending}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
