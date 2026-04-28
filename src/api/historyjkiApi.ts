import type { Historyjka, HistoryjkaCreateInput, HistoryjkaUpdateInput } from "../models/Historyjka";

const LS_HISTORYJKI = "manageme.historyjki.v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function readAll(): Historyjka[] {
  return safeParse<Historyjka[]>(localStorage.getItem(LS_HISTORYJKI), []);
}

function writeAll(items: Historyjka[]) {
  localStorage.setItem(LS_HISTORYJKI, JSON.stringify(items));
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ensureHistoryjkiSeed(wlascicielId: string) {
  const items = readAll();
  if (items.length > 0) return;

  const now = new Date().toISOString();
  const seed: Historyjka[] = [
    {
      id: "h-1",
      nazwa: "Stworzenie widoku logowania",
      opis: "Zaimplementowac strone logowania z walidacja formularza",
      priorytet: "wysoki",
      projektId: "p-1",
      dataUtworzenia: now,
      stan: "done",
      wlascicielId,
    },
    {
      id: "h-2",
      nazwa: "Panel uzytkownika",
      opis: "Wyswietlanie danych zalogowanego uzytkownika w naglowku",
      priorytet: "sredni",
      projektId: "p-1",
      dataUtworzenia: now,
      stan: "doing",
      wlascicielId,
    },
    {
      id: "h-3",
      nazwa: "Konfiguracja routingu",
      opis: "Dodanie React Router z odpowiednimi sciezkami",
      priorytet: "niski",
      projektId: "p-2",
      dataUtworzenia: now,
      stan: "todo",
      wlascicielId,
    },
    {
      id: "h-4",
      nazwa: "Integracja z API",
      opis: "Polaczenie frontendu z mock API przez localStorage",
      priorytet: "wysoki",
      projektId: "p-2",
      dataUtworzenia: now,
      stan: "todo",
      wlascicielId,
    },
  ];
  writeAll(seed);
}

export const historyjkiApi = {
  async list(): Promise<Historyjka[]> {
    return readAll();
  },

  async listByProjekt(projektId: string): Promise<Historyjka[]> {
    return readAll().filter(h => h.projektId === projektId);
  },

  async get(id: string): Promise<Historyjka | null> {
    return readAll().find(h => h.id === id) ?? null;
  },

  async create(input: HistoryjkaCreateInput): Promise<Historyjka> {
    const nazwa = input.nazwa.trim();
    if (!nazwa) throw new Error("Nazwa historyjki jest wymagana.");

    const items = readAll();
    const nowa: Historyjka = {
      ...input,
      id: genId(),
      nazwa,
      opis: input.opis.trim(),
      dataUtworzenia: new Date().toISOString(),
    };
    items.push(nowa);
    writeAll(items);
    return nowa;
  },

  async update(id: string, patch: HistoryjkaUpdateInput): Promise<Historyjka> {
    const items = readAll();
    const idx = items.findIndex(h => h.id === id);
    if (idx === -1) throw new Error("Nie znaleziono historyjki.");

    const current = items[idx];
    const next: Historyjka = {
      ...current,
      ...(patch.nazwa !== undefined ? { nazwa: patch.nazwa.trim() } : {}),
      ...(patch.opis !== undefined ? { opis: patch.opis.trim() } : {}),
      ...(patch.priorytet !== undefined ? { priorytet: patch.priorytet } : {}),
      ...(patch.stan !== undefined ? { stan: patch.stan } : {}),
    };
    if (!next.nazwa) throw new Error("Nazwa historyjki jest wymagana.");

    items[idx] = next;
    writeAll(items);
    return next;
  },

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter(h => h.id !== id));
  },

  async changeStan(id: string, stan: Historyjka["stan"]): Promise<Historyjka> {
    return this.update(id, { stan });
  },
};

