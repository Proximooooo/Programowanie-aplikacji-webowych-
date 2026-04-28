import type { Historyjka, Priorytet, StanHistoryjki } from "../models/Historyjka";
import "./HistoryjkaKarta.css";

interface HistoryjkaKartaProps {
  historyjka: Historyjka;
  onEdytuj: (h: Historyjka) => void;
  onUsun: (id: string) => void;
  onZmienStan: (id: string, stan: StanHistoryjki) => void;
}

const PRIORYTET_LABELS: Record<Priorytet, string> = {
  niski: "Niski",
  sredni: "Sredni",
  wysoki: "Wysoki",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HistoryjkaKarta({
  historyjka,
  onEdytuj,
  onUsun,
  onZmienStan,
}: HistoryjkaKartaProps) {
  const klasaPriorytetu = `historyjka-karta-priorytet-${historyjka.priorytet}`;

  const stany: StanHistoryjki[] = ["todo", "doing", "done"];

  return (
    <div className={`historyjka-karta ${klasaPriorytetu}`}>
      <div className="historyjka-karta-naglowek">
        <div className="historyjka-karta-nazwa">{historyjka.nazwa}</div>
        <span className={`historyjka-karta-priorytet-badge ${historyjka.priorytet}`}>
          {PRIORYTET_LABELS[historyjka.priorytet]}
        </span>
      </div>

      {historyjka.opis && (
        <div className="historyjka-karta-opis">{historyjka.opis}</div>
      )}

      <div className="historyjka-karta-meta">
        <div className="historyjka-karta-data">📅 {formatDate(historyjka.dataUtworzenia)}</div>
        <div className="historyjka-karta-akcje">
          {stany
            .filter((s) => s !== historyjka.stan)
            .map((s) => (
              <button
                key={s}
                title={`Przenies do: ${s.toUpperCase()}`}
                onClick={() => onZmienStan(historyjka.id, s)}
              >
                {s === "todo" ? "⏳" : s === "doing" ? "🔄" : "✅"}
              </button>
            ))}
          <button title="Edytuj" onClick={() => onEdytuj(historyjka)}>
            ✏️
          </button>
          <button
            className="btn-delete"
            title="Usun"
            onClick={() => onUsun(historyjka.id)}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

