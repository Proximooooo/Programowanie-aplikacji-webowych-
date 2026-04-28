import type { Projekt, ProjektCreateInput, ProjektUpdateInput } from "../models/Projekt";

const LS_PROJEKTY = "manageme.projekty.v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function readAll(): Projekt[] {
  return safeParse<Projekt[]>(localStorage.getItem(LS_PROJEKTY), []);
}

function writeAll(items: Projekt[]) {
  localStorage.setItem(LS_PROJEKTY, JSON.stringify(items));
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ensureProjektySeed() {
  const items = readAll();
  if (items.length > 0) return;

  const seed: Projekt[] = [
    { id: "p-1", nazwa: "Projekt Webowy", opis: "Glowny projekt aplikacji webowej" },
    { id: "p-2", nazwa: "Aplikacja Testowa", opis: "Projekt testowy do demonstracji" },
  ];
  writeAll(seed);
}

export const projektApi = {
  async list(): Promise<Projekt[]> {
    ensureProjektySeed();
    return readAll();
  },

  async get(id: string): Promise<Projekt | null> {
    ensureProjektySeed();
    return readAll().find(p => p.id === id) ?? null;
  },

  async create(input: ProjektCreateInput): Promise<Projekt> {
    const nazwa = input.nazwa.trim();
    if (!nazwa) throw new Error("Nazwa projektu jest wymagana.");

    const items = readAll();
    const nowy: Projekt = { ...input, id: genId(), nazwa, opis: input.opis.trim() };
    items.push(nowy);
    writeAll(items);
    return nowy;
  },

  async update(id: string, patch: ProjektUpdateInput): Promise<Projekt> {
    const items = readAll();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Nie znaleziono projektu.");

    const current = items[idx];
    const next: Projekt = {
      ...current,
      ...(patch.nazwa !== undefined ? { nazwa: patch.nazwa.trim() } : {}),
      ...(patch.opis !== undefined ? { opis: patch.opis.trim() } : {}),
    };
    if (!next.nazwa) throw new Error("Nazwa projektu jest wymagana.");

    items[idx] = next;
    writeAll(items);
    return next;
  },

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter(p => p.id !== id));
  },
};

