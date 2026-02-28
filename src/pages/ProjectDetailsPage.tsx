import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Project, ProjectStatus } from "../models/Project";
import { api } from "../api/api";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  NEW: "Nowy",
  IN_PROGRESS: "W trakcie",
  DONE: "Zakończony",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const p = await api.projects.get(id);
        setProject(p);
        if (!p) setError("Nie znaleziono projektu.");
      } catch {
        setError("Błąd podczas pobierania projektu.");
      }
    })();
  }, [id]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, Arial" }}>
      <Link to="/">← Wróć</Link>

      <h1 style={{ marginTop: 12 }}>Szczegóły projektu</h1>

      {error && <div style={{ padding: 12, background: "#ffe8e8", border: "1px solid #ffb5b5" }}>{error}</div>}

      {project && (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, marginTop: 12 }}>
          <div><b>ID:</b> {project.id}</div>
          <div style={{ marginTop: 8 }}><b>Nazwa:</b> {project.nazwa}</div>
          <div style={{ marginTop: 8 }}><b>Opis:</b> {project.opis || "—"}</div>
          
          <div style={{ marginTop: 8 }}>
            <b>Status:</b>{" "}
            <span style={{ 
              padding: "2px 8px", 
              borderRadius: 4,
              background: project.status === "DONE" ? "#d4edda" : project.status === "IN_PROGRESS" ? "#fff3cd" : "#e2e3e5",
              color: project.status === "DONE" ? "#155724" : project.status === "IN_PROGRESS" ? "#856404" : "#383d41"
            }}>
              {STATUS_LABELS[project.status]}
            </span>
          </div>
          
          <div style={{ marginTop: 8 }}><b>Utworzony:</b> {formatDate(project.createdAt)}</div>
          <div style={{ marginTop: 8 }}><b>Ostatnia modyfikacja:</b> {formatDate(project.updatedAt)}</div>
        </div>
      )}
    </div>
  );
}

