import type { Notification, NotificationCreateInput } from "../models/Notification";

const LS_NOTIFICATIONS = "manageme.notifications.v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readAll(): Notification[] {
  return safeParse<Notification[]>(localStorage.getItem(LS_NOTIFICATIONS), []);
}

function writeAll(items: Notification[]) {
  localStorage.setItem(LS_NOTIFICATIONS, JSON.stringify(items));
}

function genId(): string {
  return `n-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const notificationApi = {
  async listByRecipient(recipientId: string): Promise<Notification[]> {
    return readAll()
      .filter((n) => n.recipientId === recipientId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  async getById(id: string): Promise<Notification | null> {
    return readAll().find((n) => n.id === id) ?? null;
  },

  async create(input: NotificationCreateInput): Promise<Notification> {
    const title = input.title.trim();
    const message = input.message.trim();

    if (!title) throw new Error("Tytul powiadomienia jest wymagany.");
    if (!message) throw new Error("Tresc powiadomienia jest wymagana.");

    const items = readAll();
    const nowy: Notification = {
      id: genId(),
      title,
      message,
      date: input.date ?? new Date().toISOString(),
      priority: input.priority,
      isRead: input.isRead ?? false,
      recipientId: input.recipientId,
    };

    items.push(nowy);
    writeAll(items);
    return nowy;
  },

  async markAsRead(id: string): Promise<Notification> {
    const items = readAll();
    const idx = items.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error("Nie znaleziono powiadomienia.");

    const updated: Notification = { ...items[idx], isRead: true };
    items[idx] = updated;
    writeAll(items);
    return updated;
  },

  async markAllAsRead(recipientId: string): Promise<void> {
    const items = readAll();
    const updated = items.map((n) =>
      n.recipientId === recipientId ? { ...n, isRead: true } : n
    );
    writeAll(updated);
  },

  async unreadCount(recipientId: string): Promise<number> {
    return readAll().filter((n) => n.recipientId === recipientId && !n.isRead).length;
  },
};
