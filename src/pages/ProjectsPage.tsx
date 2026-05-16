import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Project, ProjectStatus } from "../models/Project";
import { api } from "../api/api";

type FormState = { nazwa: string; opis: string; status: ProjectStatus };
const emptyForm: FormState = { nazwa: "", opis: "", status: "NEW" };

type SortOption = "nazwa" | "status" | "createdAt" | "updatedAt";
type SortDir = "asc" | "desc";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  NEW: "Nowy",
  IN_PROGRESS: "W trakcie",
  DONE: "Zakończony",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // search & sort
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("nazwa");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const selected = useMemo(
    () => projects.find(p => p.id === selectedId) ?? null,
    [projects, selectedId]
  );

  async function refresh() {
    const items = await api.projects.list();
    setProjects(items);

    if (selectedId && !items.some(p => p.id === selectedId)) {
      setSelectedId(null);
      setForm(emptyForm);
    }
  }

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (selected) setForm({ nazwa: selected.nazwa, opis: selected.opis, status: selected.status });
    else setForm(emptyForm);
  }, [selected]);

  async function onCreate() {
    setError(null); setBusy(true);
    try {
      const currentInTodo = projects.filter(p => p.listId === "todo");
      const maxOrderInTodo = currentInTodo.reduce((max, p) => Math.max(max, p.order ?? 0), -1);

      const created = await api.projects.create({
        ...form,
        listId: "todo",
        ownerId: "u-1",
        order: maxOrderInTodo + 1,
      });
      await refresh();
      setSelectedId(created.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd podczas tworzenia.");
    } finally { setBusy(false); }
  }

  async function onUpdate() {
    if (!selectedId) return;
    setError(null); setBusy(true);
    try {
      await api.projects.update(selectedId, form);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd podczas aktualizacji.");
    } finally { setBusy(false); }
  }

  async function onDelete(id: string) {
    setError(null); setBusy(true);
    try {
      await api.projects.remove(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd podczas usuwania.");
    } finally { setBusy(false); }
  }

  async function onClearAll() {
    setError(null); setBusy(true);
    try {
      await api.projects.clearAll();
      setSelectedId(null);
      setForm(emptyForm);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd.");
    } finally { setBusy(false); }
  }

  // Filter + sort
  const filteredProjects = useMemo(() => {
    let result = projects;

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.nazwa.toLowerCase().includes(q) || 
        p.opis.toLowerCase().includes(q)
      );
    }

    // sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "nazwa") cmp = a.nazwa.localeCompare(b.nazwa);
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      else if (sortBy === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt);
      else if (sortBy === "updatedAt") cmp = a.updatedAt.localeCompare(b.updatedAt);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [projects, search, sortBy, sortDir]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ margin: 0 }}>ManageMe</h1>
      <p style={{ marginTop: 6, color: "#555" }}>CRUD projektów z statusem i wyszukiwarką</p>

      {error && (
        <div style={{ padding: 12, background: "#ffe8e8", border: "1px solid #ffb5b5", marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Search & Sort */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Szukaj..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6 }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortOption)}
          style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6 }}
        >
          <option value="nazwa">Nazwa</option>
          <option value="status">Status</option>
          <option value="createdAt">Data utworzenia</option>
          <option value="updatedAt">Data modyfikacji</option>
        </select>
        <button onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
          {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Projekty ({filteredProjects.length})</h2>
            <button disabled={busy} onClick={onClearAll}>Wyczyść wszystko</button>
          </div>

          {filteredProjects.length === 0 ? (
            <p style={{ color: "#666" }}>Brak projektów. Dodaj pierwszy po prawej.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0 0" }}>
              {filteredProjects.map(p => (
                <li key={p.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{p.nazwa}</div>
                      <div style={{ color: "#666", fontSize: 13 }}>{p.opis || "—"}</div>
                      <div style={{ marginTop: 4, display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ 
                          fontSize: 11, 
                          padding: "2px 6px", 
                          borderRadius: 4,
                          background: p.status === "DONE" ? "#d4edda" : p.status === "IN_PROGRESS" ? "#fff3cd" : "#e2e3e5",
                          color: p.status === "DONE" ? "#155724" : p.status === "IN_PROGRESS" ? "#856404" : "#383d41"
                        }}>
                          {STATUS_LABELS[p.status]}
                        </span>
                        <Link to={`/projects/${p.id}`}>Szczegóły</Link>
                        <button disabled={busy} onClick={() => setSelectedId(p.id)}>Edytuj</button>
                        <button disabled={busy} onClick={() => onDelete(p.id)}>Usuń</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{selected ? "Edycja projektu" : "Nowy projekt"}</h2>

          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Nazwa (min. 3 znaki)</span>
              <input 
                value={form.nazwa} 
                onChange={(e) => setForm(s => ({ ...s, nazwa: e.target.value }))} 
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Opis (max. 300 znaków)</span>
              <textarea 
                value={form.opis} 
                onChange={(e) => setForm(s => ({ ...s, opis: e.target.value }))} 
                rows={5} 
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm(s => ({ ...s, status: e.target.value as ProjectStatus }))}
              >
                <option value="NEW">Nowy</option>
                <option value="IN_PROGRESS">W trakcie</option>
                <option value="DONE">Zakończony</option>
              </select>
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              {!selected ? (
                <button disabled={busy} onClick={onCreate}>Dodaj</button>
              ) : (
                <>
                  <button disabled={busy} onClick={onUpdate}>Zapisz zmiany</button>
                  <button disabled={busy} onClick={() => { setSelectedId(null); setForm(emptyForm); setError(null); }}>
                    Anuluj
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

