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
  if (items.length > 0) {
    const needsUpdate = items.some(item => !item.icon);
    if (needsUpdate) {
      const updated = items.map((item, idx) => ({
        ...item,
        icon: item.icon || ["📝", "🔄", "✅"][idx] || "📋"
      }));
      write(updated);
    }
    return;
  }

  write([
    { id: "l-todo", name: "Do zrobienia", order: 1, icon: "📝" },
    { id: "l-doing", name: "W toku", order: 2, icon: "🔄" },
    { id: "l-done", name: "Gotowe", order: 3, icon: "✅" },
  ]);
}

export const boardApi = {
  async list(): Promise<BoardList[]> {
    ensureBoardSeed();
    const items = safeParse<BoardList[]>(localStorage.getItem(LS_LISTS), []);
    return items.sort((a, b) => a.order - b.order);
  },
};

