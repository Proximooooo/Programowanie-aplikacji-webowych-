import type { Uzytkownik } from "../models/Uzytkownik";

const LS_UZYTKOWNIK = "manageme.uzytkownik.v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function readUzytkownik(): Uzytkownik | null {
  return safeParse<Uzytkownik | null>(localStorage.getItem(LS_UZYTKOWNIK), null);
}

function writeUzytkownik(u: Uzytkownik) {
  localStorage.setItem(LS_UZYTKOWNIK, JSON.stringify(u));
}

export function ensureUzytkownikSeed() {
  const existing = readUzytkownik();
  if (existing) return;

  const mock: Uzytkownik = {
    id: "u-1",
    imie: "Dawid",
    nazwisko: "Targosz",
  };
  writeUzytkownik(mock);
}

export const uzytkownikApi = {
  async get(): Promise<Uzytkownik> {
    ensureUzytkownikSeed();
    const u = readUzytkownik();
    if (!u) throw new Error("Brak zalogowanego uzytkownika.");
    return u;
  },

  async update(imie: string, nazwisko: string): Promise<Uzytkownik> {
    ensureUzytkownikSeed();
    const u = readUzytkownik();
    if (!u) throw new Error("Brak zalogowanego uzytkownika.");
    const updated: Uzytkownik = { ...u, imie: imie.trim(), nazwisko: nazwisko.trim() };
    writeUzytkownik(updated);
    return updated;
  },
};

