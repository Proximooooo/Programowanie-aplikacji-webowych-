import type { Uzytkownik } from "../models/Uzytkownik";
import type { Projekt } from "../models/Projekt";
import "./Header.css";

interface HeaderProps {
  uzytkownik: Uzytkownik;
  projekty: Projekt[];
  aktywnyProjektId: string | null;
  unreadCount: number;
  onZmienProjekt: (projektId: string) => void;
  onDodajProjekt: () => void;
  onWyloguj: () => void;
  onOpenNotifications: () => void;
}

export default function Header({
  uzytkownik,
  projekty,
  aktywnyProjektId,
  unreadCount,
  onZmienProjekt,
  onDodajProjekt,
  onWyloguj,
  onOpenNotifications,
}: HeaderProps) {
  const inicjaly = `${uzytkownik.imie[0]}${uzytkownik.nazwisko[0]}`.toUpperCase();

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">📋 Zarządzanie pracami</h1>
        <div className="project-selector">
          <label htmlFor="projekt-select">Projekt:</label>
          <select
            id="projekt-select"
            value={aktywnyProjektId ?? ""}
            onChange={(e) => onZmienProjekt(e.target.value)}
          >
            <option value="" disabled>
              -- Wybierz projekt --
            </option>
            {projekty.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nazwa}
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={onDodajProjekt}>
            ➕ Dodaj projekt
          </button>
        </div>
      </div>

      <div className="header-right">
        <button className="notifications-link" onClick={onOpenNotifications}>
          🔔 Powiadomienia
          {unreadCount > 0 && <span className="notifications-badge">{unreadCount}</span>}
        </button>

        <div className="user-info">
          <div className="user-avatar">{inicjaly}</div>
          <div>
            <div className="user-name">
              {uzytkownik.imie} {uzytkownik.nazwisko}
              <button
                className="user-notification-count"
                onClick={onOpenNotifications}
                title="Przejdź do powiadomień"
              >
                ({unreadCount})
              </button>
            </div>
            <div className="user-role">
              {uzytkownik.rola === "admin" ? "Administrator" : "Zalogowany użytkownik"}
            </div>
          </div>
        </div>
        <button className="btn-logout" onClick={onWyloguj}>
          Wyloguj
        </button>
      </div>
    </header>
  );
}

