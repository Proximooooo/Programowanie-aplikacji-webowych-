import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Historyjka } from "../models/Historyjka";
import type { Projekt } from "../models/Projekt";
import type { Uzytkownik } from "../models/Uzytkownik";
import { historyjkiApi, ensureHistoryjkiSeed } from "../api/historyjkiApi";
import { projektApi } from "../api/projektApi";
import { uzytkownikApi } from "../api/uzytkownikApi";
import { aktywnyProjektService } from "../services/aktywnyProjektService";
import Header from "../components/Header";
import HistoryjkaKarta from "../components/HistoryjkaKarta";
import HistoryjkaForm from "../components/HistoryjkaForm";
import "./HistoryjkiPage.css";

export default function HistoryjkiPage() {
  const nav = useNavigate();

  const [uzytkownik, setUzytkownik] = useState<Uzytkownik | null>(null);
  const [projekty, setProjekty] = useState<Projekt[]>([]);
  const [aktywnyProjektId, setAktywnyProjektId] = useState<string | null>(null);
  const [historyjki, setHistoryjki] = useState<Historyjka[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [edytowanaHistoryjka, setEdytowanaHistoryjka] = useState<Historyjka | null>(null);

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const [u, p] = await Promise.all([uzytkownikApi.get(), projektApi.list()]);
      setUzytkownik(u);
      setProjekty(p);

      ensureHistoryjkiSeed(u.id);

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
    refreshAll();
  }, []);

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

  async function handleDodajHistoryjke(data: {
    nazwa: string;
    opis: string;
    priorytet: Historyjka["priorytet"];
    stan: Historyjka["stan"];
  }) {
    if (!aktywnyProjektId || !uzytkownik) return;
    setError(null);
    try {
      await historyjkiApi.create({
        ...data,
        projektId: aktywnyProjektId,
        wlascicielId: uzytkownik.id,
      });
      setFormOpen(false);
      const h = await historyjkiApi.listByProjekt(aktywnyProjektId);
      setHistoryjki(h);
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
      await historyjkiApi.remove(id);
      const h = await historyjkiApi.listByProjekt(aktywnyProjektId);
      setHistoryjki(h);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blad podczas usuwania.");
    }
  }

  async function handleZmienStan(id: string, stan: Historyjka["stan"]) {
    if (!aktywnyProjektId) return;
    setError(null);
    try {
      await historyjkiApi.changeStan(id, stan);
      const h = await historyjkiApi.listByProjekt(aktywnyProjektId);
      setHistoryjki(h);
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
    { id: "todo", tytul: "TODO", ikona: "📝", klasa: "todo" },
    { id: "doing", tytul: "DOING", ikona: "🔄", klasa: "doing" },
    { id: "done", tytul: "DONE", ikona: "✅", klasa: "done" },
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
        onZmienProjekt={handleZmienProjekt}
        onWyloguj={() => nav("/login")}
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
          projektId={aktywnyProjektId ?? ""}
          onZapisz={edytowanaHistoryjka ? handleEdytujHistoryjke : handleDodajHistoryjke}
          onAnuluj={() => {
            setFormOpen(false);
            setEdytowanaHistoryjka(null);
          }}
        />
      )}
    </div>
  );
}

