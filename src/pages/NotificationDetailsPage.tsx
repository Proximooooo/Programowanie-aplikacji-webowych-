import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { notificationApi } from "../api/notificationApi";
import type { Notification } from "../models/Notification";
import { useAuth } from "../auth/useAuth";

export default function NotificationDetailsPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (auth.loading) return;
      if (!auth.user) {
        nav("/login");
        return;
      }

      if (!id) {
        setError("Brak identyfikatora powiadomienia.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const found = await notificationApi.getById(id);
        if (!found) {
          setError("Nie znaleziono powiadomienia.");
          setItem(null);
        } else if (found.recipientId !== auth.user.id) {
          setError("Brak dostepu do tego powiadomienia.");
          setItem(null);
        } else if (!found.isRead) {
          const updated = await notificationApi.markAsRead(found.id);
          setItem(updated);
        } else {
          setItem(found);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Blad ladowania szczegolow.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, auth.loading, auth.user]);

  if (loading) return <div style={{ padding: 16 }}>Ladowanie szczegolow...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui, Arial" }}>
      <Link to="/notifications">← Wroc do listy</Link>

      {error && <div style={{ marginTop: 12, color: "#b91c1c" }}>{error}</div>}

      {item && (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            background: "#fff",
          }}
        >
          <h1 style={{ marginTop: 0 }}>{item.title}</h1>
          <div style={{ color: "#6b7280", marginBottom: 12 }}>
            {new Date(item.date).toLocaleString("pl-PL")} • priorytet: {item.priority}
          </div>
          <p style={{ lineHeight: 1.5 }}>{item.message}</p>
          <div style={{ marginTop: 12, color: item.isRead ? "#15803d" : "#1d4ed8" }}>
            Status: {item.isRead ? "przeczytane" : "nieprzeczytane"}
          </div>
        </div>
      )}
    </div>
  );
}
