/* eslint-disable @typescript-eslint/no-explicit-any */
const URLS = {
  boards:        "https://functions.poehali.dev/5406c7e1-661a-4429-bf72-2a3b6456d71b",
  lists:         "https://functions.poehali.dev/bd2ec484-55e9-4038-9a6a-02fc7b8694c4",
  cards:         "https://functions.poehali.dev/f992b361-2cfe-4116-ae6b-73f12b59a3eb",
  notifications: "https://functions.poehali.dev/f0cd8087-e5bb-4f3d-b5dd-b9aae53add13",
  team:          "https://functions.poehali.dev/8b356a0f-91cf-46be-bbbb-f4980e35de16",
};

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Boards ──
export const getBoards = () => req<any[]>(URLS.boards);
export const createBoard = (data: { title: string; cover_color?: string; description?: string }) =>
  req<any>(URLS.boards, { method: "POST", body: JSON.stringify(data) });
export const deleteBoard = (id: number) =>
  req<any>(`${URLS.boards}?id=${id}`, { method: "DELETE" });

// ── Lists ──
export const getLists = (boardId: number) =>
  req<any[]>(`${URLS.lists}?board_id=${boardId}`);
export const createList = (data: { board_id: number; title: string; color?: string; position?: number }) =>
  req<any>(URLS.lists, { method: "POST", body: JSON.stringify(data) });
export const deleteList = (id: number) =>
  req<any>(`${URLS.lists}?id=${id}`, { method: "DELETE" });

// ── Cards ──
export const getCards = (boardId: number) =>
  req<any[]>(`${URLS.cards}?board_id=${boardId}`);
export const createCard = (data: { list_id: number; board_id: number; title: string; labels?: string[] }) =>
  req<any>(URLS.cards, { method: "POST", body: JSON.stringify(data) });
export const deleteCard = (id: number) =>
  req<any>(`${URLS.cards}?id=${id}`, { method: "DELETE" });
export const moveCard = (id: number, listId: number) =>
  req<any>(`${URLS.cards}?id=${id}`, { method: "PUT", body: JSON.stringify({ list_id: listId }) });

// ── Notifications ──
export const getNotifications = (userId = 1) =>
  req<any>(`${URLS.notifications}?user_id=${userId}`);
export const markAllRead = (userId = 1) =>
  req<any>(URLS.notifications, { method: "PUT", body: JSON.stringify({ user_id: userId, mark_all_read: true }) });

// ── Team ──
export const getTeam = () => req<any[]>(URLS.team);