import type { User } from "../models/User";

const LS_USERS = "manageme.users.v1";
const LS_SESSION = "manageme.session.v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function readUsers(): User[] {
  return safeParse<User[]>(localStorage.getItem(LS_USERS), []);
}

function writeUsers(users: User[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

export function ensureAuthSeed() {
  const users = readUsers();
  
  // Seed default users if none exist
  if (users.length === 0) {
    const seed: User[] = [
      { id: "u-admin", login: "admin", password: "Admin123!", role: "ADMIN", displayName: "Admin" },
      { id: "u-worker", login: "pracownik", password: "Pracownik123!", role: "WORKER", displayName: "Pracownik" },
      { id: "u-user2", login: "janek", password: "Janek123!", role: "WORKER", displayName: "Janek" },
    ];
    writeUsers(seed);
    return;
  }

  // Add Janek if doesn't exist (for existing users)
  const hasJanek = users.some(u => u.login === "janek");
  if (!hasJanek) {
    users.push({ id: "u-user2", login: "janek", password: "Janek123!", role: "WORKER", displayName: "Janek" });
    writeUsers(users);
  }
}

export type Session = { userId: string };

export const authApi = {
  async login(login: string, password: string): Promise<User> {
    ensureAuthSeed();
    const users = readUsers();
    const user = users.find(u => u.login === login && u.password === password);
    if (!user) throw new Error("Błędny login lub hasło.");
    localStorage.setItem(LS_SESSION, JSON.stringify({ userId: user.id } satisfies Session));
    return user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(LS_SESSION);
  },

  async me(): Promise<User | null> {
    ensureAuthSeed();
    const session = safeParse<Session | null>(localStorage.getItem(LS_SESSION), null);
    if (!session) return null;
    const users = readUsers();
    return users.find(u => u.id === session.userId) ?? null;
  },

  // (opcjonalnie dla admina)
  async listUsers(): Promise<User[]> {
    ensureAuthSeed();
    return readUsers();
  },
};

