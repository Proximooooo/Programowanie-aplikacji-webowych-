import type { Uzytkownik } from "../models/Uzytkownik";
import type { Projekt } from "../models/Projekt";
import "./Header.css";

interface HeaderProps {
  uzytkownik: Uzytkownik;
  projekty: Projekt[];
  aktywnyProjektId: string | null;
  onZmienProjekt: (projektId: string) => void;
  onWyloguj: () => void;
}

export default function Header({
  uzytkownik,
  projekty,
  aktywnyProjektId,
  onZmienProjekt,
  onWyloguj,
}: HeaderProps) {
  const inicjaly = `${uzytkownik.imie[0]}${uzytkownik.nazwisko[0]}`.toUpperCase();

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">📋 ManageMe</h1>
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
        </div>
      </div>

      <div className="header-right">
        <div className="user-info">
          <div className="user-avatar">{inicjaly}</div>
          <div>
            <div className="user-name">
              {uzytkownik.imie} {uzytkownik.nazwisko}
            </div>
            <div className="user-role">Zalogowany uzytkownik</div>
          </div>
        </div>
        <button className="btn-logout" onClick={onWyloguj}>
          Wyloguj
        </button>
      </div>
    </header>
  );
}

