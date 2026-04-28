import { useState, useEffect } from "react";
import type { Historyjka, Priorytet, StanHistoryjki } from "../models/Historyjka";
import "./HistoryjkaForm.css";

interface HistoryjkaFormProps {
  historyjka?: Historyjka | null;
  onZapisz: (data: {
    nazwa: string;
    opis: string;
    priorytet: Priorytet;
    stan: StanHistoryjki;
  }) => void;
  onAnuluj: () => void;
}

export default function HistoryjkaForm({
  historyjka,
  onZapisz,
  onAnuluj,
}: HistoryjkaFormProps) {
  const [nazwa, setNazwa] = useState("");
  const [opis, setOpis] = useState("");
  const [priorytet, setPriorytet] = useState<Priorytet>("sredni");
  const [stan, setStan] = useState<StanHistoryjki>("todo");

  useEffect(() => {
    if (historyjka) {
      setNazwa(historyjka.nazwa);
      setOpis(historyjka.opis);
      setPriorytet(historyjka.priorytet);
      setStan(historyjka.stan);
    } else {
      setNazwa("");
      setOpis("");
      setPriorytet("sredni");
      setStan("todo");
    }
  }, [historyjka]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nazwa.trim()) return;
    onZapisz({ nazwa: nazwa.trim(), opis: opis.trim(), priorytet, stan });
  }

  return (
    <div className="historyjka-form-overlay" onClick={onAnuluj}>
      <div className="historyjka-form-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{historyjka ? "Edytuj historyjke" : "Dodaj nowa historyjke"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="historyjka-form-group">
            <label htmlFor="h-nazwa">Nazwa *</label>
            <input
              id="h-nazwa"
              type="text"
              value={nazwa}
              onChange={(e) => setNazwa(e.target.value)}
              placeholder="Nazwa historyjki"
              required
            />
          </div>

          <div className="historyjka-form-group">
            <label htmlFor="h-opis">Opis</label>
            <textarea
              id="h-opis"
              value={opis}
              onChange={(e) => setOpis(e.target.value)}
              placeholder="Opis historyjki (opcjonalnie)"
              rows={3}
            />
          </div>

          <div className="historyjka-form-group">
            <label htmlFor="h-priorytet">Priorytet</label>
            <select
              id="h-priorytet"
              value={priorytet}
              onChange={(e) => setPriorytet(e.target.value as Priorytet)}
            >
              <option value="niski">Niski</option>
              <option value="sredni">Sredni</option>
              <option value="wysoki">Wysoki</option>
            </select>
          </div>

          <div className="historyjka-form-group">
            <label htmlFor="h-stan">Stan</label>
            <select
              id="h-stan"
              value={stan}
              onChange={(e) => setStan(e.target.value as StanHistoryjki)}
            >
              <option value="todo">Do zrobienia</option>
              <option value="doing">W toku</option>
              <option value="done">Gotowe</option>
            </select>
          </div>

          <div className="historyjka-form-actions">
            <button type="button" className="btn-secondary" onClick={onAnuluj}>
              Anuluj
            </button>
            <button type="submit" className="btn-primary">
              {historyjka ? "Zapisz zmiany" : "Dodaj historyjke"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
