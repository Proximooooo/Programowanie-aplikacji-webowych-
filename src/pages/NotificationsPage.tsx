import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notificationApi } from "../api/notificationApi";
import { uzytkownikApi } from "../api/uzytkownikApi";
import type { Notification } from "../models/Notification";
import { useAuth } from "../auth/useAuth";

export default function NotificationsPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh(id?: string) {
    const rid = id ?? userId;
    if (!rid) return;
    const list = await notificationApi.listByRecipient(rid);
    setItems(list);
  }

  useEffect(() => {
    (async () => {
      if (auth.loading) return;
      if (!auth.user) {
        nav("/login");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const u = await uzytkownikApi.get();
        setUserId(u.id);
        await refresh(u.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Blad ladowania powiadomien.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.user]);

  const unreadCount = useMemo(() => items.filter((i) => !i.isRead).length, [items]);

  async function handleMarkAsRead(id: string) {
    await notificationApi.markAsRead(id);
    await refresh();
  }

  async function handleMarkAllAsRead() {
    if (!userId) return;
    await notificationApi.markAllAsRead(userId);
    await refresh();
  }

  if (loading) {
    return <div style={{ padding: 16 }}>Ladowanie powiadomien...</div>;
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Powiadomienia</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/">← Wroc</Link>
          <button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            Oznacz wszystkie jako przeczytane
          </button>
        </div>
      </div>

      <p style={{ color: "#6b7280" }}>Nieprzeczytane: {unreadCount}</p>
      {error && <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>}

      {items.length === 0 ? (
        <div style={{ marginTop: 20, color: "#6b7280" }}>Brak powiadomien.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 16, display: "grid", gap: 10 }}>
          {items.map((n) => (
            <li
              key={n.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
                background: n.isRead ? "#fff" : "#eff6ff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {n.title} {!n.isRead && <span style={{ color: "#2563eb" }}>(nowe)</span>}
                  </div>
                  <div style={{ marginTop: 6 }}>{n.message}</div>
                  <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>
                    {new Date(n.date).toLocaleString("pl-PL")} • priorytet: {n.priority}
                  </div>
                </div>
                <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
                  <Link to={`/notifications/${n.id}`}>Szczegoly</Link>
                  {!n.isRead && (
                    <button onClick={() => handleMarkAsRead(n.id)}>Oznacz jako przeczytane</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
