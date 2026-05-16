import type { Uzytkownik } from "../models/Uzytkownik";
import { authApi } from "./authApi";

function mapAuthUserToUzytkownik(user: {
  id: string;
  displayName: string;
  role: "ADMIN" | "WORKER";
}): Uzytkownik {
  const parts = user.displayName.trim().split(/\s+/);
  const imie = parts[0] || user.displayName;
  const nazwisko = parts.slice(1).join(" ") || "-";

  return {
    id: user.id,
    imie,
    nazwisko,
    rola: user.role === "ADMIN" ? "admin" : "user",
  };
}

export const uzytkownikApi = {
  async get(): Promise<Uzytkownik> {
    const me = await authApi.me();
    if (!me) throw new Error("Brak zalogowanego uzytkownika.");
    return mapAuthUserToUzytkownik(me);
  },

  async update(imie: string, nazwisko: string): Promise<Uzytkownik> {
    const me = await authApi.me();
    if (!me) throw new Error("Brak zalogowanego uzytkownika.");
    return {
      id: me.id,
      imie: imie.trim(),
      nazwisko: nazwisko.trim(),
      rola: me.role === "ADMIN" ? "admin" : "user",
    };
  },
};

