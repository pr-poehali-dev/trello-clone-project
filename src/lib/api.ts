const URLS = {
  boards: "https://functions.poehali.dev/5406c7e1-661a-4429-bf72-2a3b6456d71b",
  lists: "https://functions.poehali.dev/bd2ec484-55e9-4038-9a6a-02fc7b8694c4",
  cards: "https://functions.poehali.dev/f992b361-2cfe-4116-ae6b-73f12b59a3eb",
  notifications: "https://functions.poehali.dev/f0cd8087-e5bb-4f3d-b5dd-b9aae53add13",
  team: "https://functions.poehali.dev/8b356a0f-91cf-46be-bbbb-f4980e35de16",
};

async function request(url: string, method = "GET", body?: object, params?: Record<string, string>) {
  let fullUrl = url;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    fullUrl = `${url}?${qs}`;
  }
  const res = await fetch(fullUrl, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const boardsApi = {
  getAll: () => request(URLS.boards),
  getById: (id: number) => request(URLS.boards, "GET", undefined, { id: String(id) }),
  create: (data: { title: string; description?: string; cover_color?: string }) =>
    request(URLS.boards, "POST", data),
  update: (id: number, data: object) =>
    request(URLS.boards + `?id=${id}`, "PUT", { id, ...data }),
  star: (id: number, is_starred: boolean) =>
    request(URLS.boards + `?id=${id}`, "PUT", { id, is_starred }),
  remove: (id: number) =>
    request(URLS.boards + `?id=${id}`, "DELETE", { id }),
};

export const listsApi = {
  getByBoard: (board_id: number) =>
    request(URLS.lists, "GET", undefined, { board_id: String(board_id) }),
  create: (data: { board_id: number; title: string; position?: number }) =>
    request(URLS.lists, "POST", data),
  update: (id: number, data: object) =>
    request(URLS.lists + `?id=${id}`, "PUT", { id, ...data }),
  remove: (id: number) =>
    request(URLS.lists + `?id=${id}`, "DELETE", { id }),
};

export const cardsApi = {
  getByBoard: (board_id: number) =>
    request(URLS.cards, "GET", undefined, { board_id: String(board_id) }),
  getById: (id: number) =>
    request(URLS.cards, "GET", undefined, { id: String(id) }),
  create: (data: { list_id: number; board_id: number; title: string; priority?: string; labels?: string[] }) =>
    request(URLS.cards, "POST", data),
  update: (id: number, data: object) =>
    request(URLS.cards + `?id=${id}`, "PUT", { id, ...data }),
  remove: (id: number) =>
    request(URLS.cards + `?id=${id}`, "DELETE", { id }),
};

export const notificationsApi = {
  getAll: (user_id = 1) =>
    request(URLS.notifications, "GET", undefined, { user_id: String(user_id) }),
  markRead: (id: number | "all", user_id = 1) =>
    request(URLS.notifications + `?id=${id}`, "PUT", { id, user_id }),
};

export const teamApi = {
  getMembers: () =>
    request(URLS.team, "GET", undefined, { action: "members" }),
  invite: (data: { name: string; email: string }) =>
    request(URLS.team, "POST", { action: "invite", ...data }),
  updateRole: (user_id: number, role: string) =>
    request(URLS.team + `?id=${user_id}`, "PUT", { user_id, role }),
};
