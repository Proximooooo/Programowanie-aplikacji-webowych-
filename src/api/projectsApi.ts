import type { Project, ProjectCreateInput, ProjectUpdateInput } from "../models/Project";

const LS_KEY = "manageme.projects.v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
function readAll(): Project[] {
  return safeParse<Project[]>(localStorage.getItem(LS_KEY), []);
}
function writeAll(items: Project[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}
function genId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const projectsApi = {
  async list(): Promise<Project[]> {
    return readAll();
  },

  async get(id: string): Promise<Project | null> {
    return readAll().find(p => p.id === id) ?? null;
  },

  async create(input: ProjectCreateInput): Promise<Project> {
    const nazwa = input.nazwa.trim();
    const opis = input.opis.trim();
    if (!nazwa) throw new Error("Nazwa projektu jest wymagana.");

    const items = readAll();
    const newItem: Project = { ...input, id: genId(), nazwa, opis };
    items.push(newItem);
    writeAll(items);
    return newItem;
  },

  async update(id: string, patch: ProjectUpdateInput): Promise<Project> {
    const items = readAll();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Nie znaleziono projektu.");

    const current = items[idx];
    const next: Project = {
      ...current,
      ...(patch.nazwa !== undefined ? { nazwa: patch.nazwa.trim() } : null),
      ...(patch.opis !== undefined ? { opis: patch.opis.trim() } : null),
      ...(patch.listId !== undefined ? { listId: patch.listId } : null),
      ...(patch.ownerId !== undefined ? { ownerId: patch.ownerId } : null),
    };
    if (!next.nazwa) throw new Error("Nazwa projektu jest wymagana.");

    items[idx] = next;
    writeAll(items);
    return next;
  },

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter(p => p.id !== id));
  },

  async clearAll(): Promise<void> {
    writeAll([]);
  },
};

