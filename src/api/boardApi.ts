import type { BoardList } from "../models/BoardList";

const LS_LISTS = "manageme.boardlists.v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function write(items: BoardList[]) {
  localStorage.setItem(LS_LISTS, JSON.stringify(items));
}

export function ensureBoardSeed() {
  const items = safeParse<BoardList[]>(localStorage.getItem(LS_LISTS), []);
  if (items.length > 0) return;

  write([
    { id: "l-todo", name: "Do zrobienia", order: 1 },
    { id: "l-doing", name: "W toku", order: 2 },
    { id: "l-done", name: "Gotowe", order: 3 },
  ]);
}

export const boardApi = {
  async list(): Promise<BoardList[]> {
    ensureBoardSeed();
    const items = safeParse<BoardList[]>(localStorage.getItem(LS_LISTS), []);
    return items.sort((a, b) => a.order - b.order);
  },
};

