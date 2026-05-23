import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { Historyjka } from "../models/Historyjka";
import type { Projekt } from "../models/Projekt";
import type { Uzytkownik } from "../models/Uzytkownik";
import type { User } from "../models/User";
import { historyjkiApi, ensureHistoryjkiSeed } from "../api/historyjkiApi";
import { projektApi } from "../api/projektApi";
import { uzytkownikApi } from "../api/uzytkownikApi";
import { authApi } from "../api/authApi";
import { aktywnyProjektService } from "../services/aktywnyProjektService";
import Header from "../components/Header";
import HistoryjkaKarta from "../components/HistoryjkaKarta";
import HistoryjkaForm from "../components/HistoryjkaForm";
import NotificationDialog from "../components/NotificationDialog";
import { notificationApi } from "../api/notificationApi";
import { notificationService } from "../services/notificationService";
import type { Notification } from "../models/Notification";
import "./HistoryjkiPage.css";

export default function HistoryjkiPage() {
  const nav = useNavigate();
  const auth = useAuth();

  const [uzytkownik, setUzytkownik] = useState<Uzytkownik | null>(null);
  const [projekty, setProjekty] = useState<Projekt[]>([]);
  const [aktywnyProjektId, setAktywnyProjektId] = useState<string | null>(null);
  const [historyjki, setHistoryjki] = useState<Historyjka[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [edytowanaHistoryjka, setEdytowanaHistoryjka] = useState<Historyjka | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dialogNotification, setDialogNotification] = useState<Notification | null>(null);

  async function notifyAdminsExceptActor(title: string, message: string) {
    if (!auth.user) return;
    const users = await authApi.listUsers();
    const adminIds = users
      .filter((u: User) => u.role === "ADMIN" && u.id !== auth.user!.id)
      .map((u: User) => u.id);

    if (adminIds.length === 0) return;

    await Promise.all(
      adminIds.map((adminId) =>
        notificationApi.create({
          title,
          message,
          priority: "high",
          recipientId: adminId,
        })
      )
    );
  }

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const [u, p] = await Promise.all([uzytkownikApi.get(), projektApi.list()]);
      setUzytkownik(u);
      setProjekty(p);

      ensureHistoryjkiSeed(u.id);
      await notificationService.seedExampleNotifications(u.id);

      const zapisanyProjekt = aktywnyProjektService.get();
      let wybranyId = zapisanyProjekt;

      if (!wybranyId || !p.some((proj) => proj.id === wybranyId)) {
        wybranyId = p[0]?.id ?? null;
        if (wybranyId) aktywnyProjektService.set(wybranyId);
      }

      setAktywnyProjektId(wybranyId);

      if (wybranyId) {
        const h = await historyjkiApi.listByProjekt(wybranyId);
        setHistoryjki(h);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blad podczas ladowania danych.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (auth.loading) return;
      if (!auth.user) {
        nav("/login");
        return;
      }
      await refreshAll();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.user]);

  useEffect(() => {
    if (!uzytkownik) return;

    (async () => {
      const count = await notificationApi.unreadCount(uzytkownik.id);
      setUnreadCount(count);
    })();

    const unsubscribe = notificationService.subscribe((notification) => {
      if (notification.recipientId !== uzytkownik.id) return;
      setDialogNotification(notification);
      setUnreadCount((prev) => prev + (notification.isRead ? 0 : 1));
    });

    return () => {
      unsubscribe();
    };
  }, [uzytkownik]);

  async function handleZmienProjekt(projektId: string) {
    setAktywnyProjektId(projektId);
    aktywnyProjektService.set(projektId);
    try {
      const h = await historyjkiApi.listByProjekt(projektId);
      setHistoryjki(h);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blad podczas ladowania historyjek.");
    }
  }

  async function handleDodajProjekt() {
    if (!auth.user) return;
    setError(null);

    const nazwa = prompt("Podaj nazwę nowego projektu:");
    if (!nazwa || !nazwa.trim()) return;

    const opis = prompt("Podaj opis projektu (opcjonalnie):") ?? "";

    try {
      const created = await projektApi.create({
        nazwa: nazwa.trim(),
        opis: opis.trim(),
      });

      const refreshedProjects = await projektApi.list();
      setProjekty(refreshedProjects);

      setAktywnyProjektId(created.id);
      aktywnyProjektService.set(created.id);
      setHistoryjki([]);

      const users = await authApi.listUsers();
      const adminIds = users
        .filter((u: User) => u.role === "ADMIN" && u.id !== auth.user!.id)
        .map((u: User) => u.id);

      if (adminIds.length > 0) {
        await notificationService.notifyNewProjectToAdmins(adminIds, created.nazwa);
      }

      if (uzytkownik) {
        const count = await notificationApi.unreadCount(uzytkownik.id);
        setUnreadCount(count);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blad podczas dodawania projektu.");
    }
  }

  async function handleDodajHistoryjke(data: {
    nazwa: string;
    opis: string;
    priorytet: Historyjka["priorytet"];
    stan: Historyjka["stan"];
  }) {
    if (!aktywnyProjektId || !uzytkownik) return;
    setError(null);
    try {
      const created = await historyjkiApi.create({
        ...data,
        projektId: aktywnyProjektId,
        wlascicielId: uzytkownik.id,
      });

      const recipientId = auth.user?.id ?? created.wlascicielId;
      await notificationService.notifyTaskAddedToStoryOwner(
        recipientId,
        created.nazwa,
        "Nowe zadanie"
      );
      await notificationService.notifyAssignmentToStoryOrTask(recipientId, created.nazwa);

      await notifyAdminsExceptActor(
        "Pracownik dodał historyjkę",
        `${auth.user?.displayName ?? "Użytkownik"} dodał historyjkę: "${created.nazwa}".`
      );

      setFormOpen(false);
      const h = await historyjkiApi.listByProjekt(aktywnyProjektId);
      setHistoryjki(h);
      const count = await notificationApi.unreadCount(uzytkownik.id);
      setUnreadCount(count);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blad podczas dodawania.");
    }
  }

  async function handleEdytujHistoryjke(data: {
    nazwa: string;
    opis: string;
    priorytet: Historyjka["priorytet"];
    stan: Historyjka["stan"];
  }) {
    if (!edytowanaHistoryjka || !aktywnyProjektId) return;
    setError(null);
    try {
      await historyjkiApi.update(edytowanaHistoryjka.id, data);
      setEdytowanaHistoryjka(null);
      const h = await historyjkiApi.listByProjekt(aktywnyProjektId);
      setHistoryjki(h);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blad podczas edycji.");
    }
  }

  async function handleUsun(id: string) {
    if (!aktywnyProjektId) return;
    if (!confirm("Czy na pewno chcesz usunac ta historyjke?")) return;
    setError(null);
    try {
      const current = historyjki.find((x) => x.id === id) ?? null;
      await historyjkiApi.remove(id);
      if (current) {
        const recipientId = auth.user?.id ?? current.wlascicielId;
        await notificationService.notifyTaskRemovedFromStoryOwner(
          recipientId,
          current.nazwa,
          "Usuniete zadanie"
        );

        await notifyAdminsExceptActor(
          "Usunięto historyjkę",
          `${auth.user?.displayName ?? "Użytkownik"} usunął historyjkę: "${current.nazwa}".`
        );
      }
      const h = await historyjkiApi.listByProjekt(aktywnyProjektId);
      setHistoryjki(h);
      if (uzytkownik) {
        const count = await notificationApi.unreadCount(uzytkownik.id);
        setUnreadCount(count);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blad podczas usuwania.");
    }
  }

  async function handleZmienStan(id: string, stan: Historyjka["stan"]) {
    if (!aktywnyProjektId) return;
    setError(null);
    try {
      await historyjkiApi.changeStan(id, stan);
      const changed = historyjki.find((x) => x.id === id) ?? null;
      if (changed && (stan === "doing" || stan === "done")) {
        const recipientId = auth.user?.id ?? changed.wlascicielId;
        await notificationService.notifyTaskStatusChangedToStoryOwner(
          recipientId,
          changed.nazwa,
          "Status historyjki",
          stan
        );

        await notifyAdminsExceptActor(
          "Zmiana statusu historyjki",
          `${auth.user?.displayName ?? "Użytkownik"} zmienił status "${changed.nazwa}" na "${stan}".`
        );
      }
      const h = await historyjkiApi.listByProjekt(aktywnyProjektId);
      setHistoryjki(h);
      if (uzytkownik) {
        const count = await notificationApi.unreadCount(uzytkownik.id);
        setUnreadCount(count);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blad podczas zmiany stanu.");
    }
  }

  const historyjkiByStan = useMemo(() => {
    const map: Record<string, Historyjka[]> = {
      todo: [],
      doing: [],
      done: [],
    };
    for (const h of historyjki) {
      map[h.stan].push(h);
    }
    return map;
  }, [historyjki]);

  const kolumny: { id: Historyjka["stan"]; tytul: string; ikona: string; klasa: string }[] = [
    { id: "todo", tytul: "Do zrobienia", ikona: "📝", klasa: "todo" },
    { id: "doing", tytul: "W trakcie", ikona: "🔄", klasa: "doing" },
    { id: "done", tytul: "Zrobione", ikona: "✅", klasa: "done" },
  ];

  if (loading) {
    return (
      <div className="historyjki-page">
        <div className="loading-spinner">Ladowanie...</div>
      </div>
    );
  }

  if (!uzytkownik) {
    return (
      <div className="historyjki-page">
        <div className="brak-projektu">
          <div className="brak-projektu-icon">🔒</div>
          <h2>Brak dostepu</h2>
          <p>Musisz byc zalogowany, aby zobaczyc te strone.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historyjki-page">
      <Header
        uzytkownik={uzytkownik}
        projekty={projekty}
        aktywnyProjektId={aktywnyProjektId}
        unreadCount={unreadCount}
        onZmienProjekt={handleZmienProjekt}
        onDodajProjekt={handleDodajProjekt}
        onWyloguj={async () => {
          await auth.logout();
          nav("/login");
        }}
        onOpenNotifications={() => nav("/notifications")}
      />

      <div className="historyjki-content">
        <div className="historyjki-toolbar">
          <h2>
            {aktywnyProjektId
              ? `Historyjki: ${projekty.find((p) => p.id === aktywnyProjektId)?.nazwa ?? ""}`
              : "Historyjki"}
          </h2>
          {aktywnyProjektId && (
            <button className="btn-primary" onClick={() => setFormOpen(true)}>
              ➕ Dodaj historyjke
            </button>
          )}
        </div>

        {error && <div className="error-banner">{error}</div>}

        {!aktywnyProjektId ? (
          <div className="brak-projektu">
            <div className="brak-projektu-icon">📁</div>
            <h2>Brak projektu</h2>
            <p>Wybierz projekt z listy powyzej, aby zobaczyc historyjki.</p>
          </div>
        ) : (
          <div className="historyjki-kolumny">
            {kolumny.map((kol) => (
              <div key={kol.id} className="historyjka-kolumna">
                <div className="historyjka-kolumna-naglowek">
                  <div className={`historyjka-kolumna-tytul ${kol.klasa}`}>
                    <span>{kol.ikona}</span>
                    <span>{kol.tytul}</span>
                  </div>
                  <span className="historyjka-kolumna-licznik">
                    {historyjkiByStan[kol.id].length}
                  </span>
                </div>
                <div className="historyjka-lista">
                  {historyjkiByStan[kol.id].length === 0 ? (
                    <div className="historyjka-pusta">
                      <div className="historyjka-pusta-icon">📭</div>
                      <p>Brak historyjek</p>
                    </div>
                  ) : (
                    historyjkiByStan[kol.id].map((h) => (
                      <HistoryjkaKarta
                        key={h.id}
                        historyjka={h}
                        onEdytuj={(h) => setEdytowanaHistoryjka(h)}
                        onUsun={handleUsun}
                        onZmienStan={handleZmienStan}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(formOpen || edytowanaHistoryjka) && (
        <HistoryjkaForm
          historyjka={edytowanaHistoryjka}
          onZapisz={edytowanaHistoryjka ? handleEdytujHistoryjke : handleDodajHistoryjke}
          onAnuluj={() => {
            setFormOpen(false);
            setEdytowanaHistoryjka(null);
          }}
        />
      )}

      <NotificationDialog
        notification={dialogNotification}
        onClose={() => setDialogNotification(null)}
      />
    </div>
  );
}

