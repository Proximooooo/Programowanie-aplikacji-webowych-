
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BoardList } from "../models/BoardList";
import type { Project } from "../models/Project";
import { boardApi } from "../api/boardApi";
import { projectsApi } from "../api/projectsApi";
import { useAuth } from "../auth/useAuth";
import "./BoardPage.css";

interface SortableCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

function SortableCard({ project, onDelete }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="board-card"
      {...attributes}
      {...listeners}
    >
      <div className="board-card-title">{project.nazwa}</div>
      {project.opis && <div className="board-card-description">{project.opis}</div>}
      <div className="board-card-meta">
        <div className="board-card-owner">
          👤 {project.ownerId === "u-worker" || project.ownerId.startsWith("u-") ? "Pracownik" : project.ownerId}
        </div>
        <button
          className="btn-ghost btn-sm board-card-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function CardOverlay({ project }: { project: Project }) {
  return (
    <div className="board-card board-card-overlay">
      <div className="board-card-title">{project.nazwa}</div>
      {project.opis && <div className="board-card-description">{project.opis}</div>}
    </div>
  );
}

export default function BoardPage() {
  const auth = useAuth();
  const nav = useNavigate();

  const [lists, setLists] = useState<BoardList[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [nazwa, setNazwa] = useState("");
  const [opis, setOpis] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function refresh() {
    const [ls, ps] = await Promise.all([boardApi.list(), projectsApi.list()]);
    setLists(ls);
    if (auth.user?.role === "WORKER") {
      setProjects(ps.filter(p => p.ownerId === auth.user!.id));
    } else {
      setProjects(ps);
    }
  }

  useEffect(() => {
    (async () => {
      if (auth.loading) return;
      if (!auth.user) { nav("/login"); return; }
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.user]);

  const projectsByList = useMemo(() => {
    const map: Record<string, Project[]> = {};
    for (const l of lists) map[l.id] = [];
    for (const p of projects) (map[p.listId] ??= []).push(p);
    return map;
  }, [lists, projects]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeId),
    [projects, activeId]
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeProject = projects.find((p) => p.id === activeId);
    if (!activeProject) return;

    // Check if over is a column
    const overColumn = lists.find((l) => l.id === overId);
    if (overColumn) {
      if (activeProject.listId !== overColumn.id) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === activeId ? { ...p, listId: overColumn.id } : p
          )
        );
      }
      return;
    }

    // Over is another card - find its column
    const overProject = projects.find((p) => p.id === overId);
    if (overProject && overProject.listId !== activeProject.listId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeId ? { ...p, listId: overProject.listId } : p
        )
      );
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const activeProject = projects.find((p) => p.id === activeId);
    if (!activeProject) return;

    // Find target column
    const targetColumn = lists.find((l) => l.id === over.id);
    const overProject = projects.find((p) => p.id === over.id);
    const targetListId = targetColumn?.id ?? overProject?.listId;

    if (targetListId && activeProject.listId !== targetListId) {
      await projectsApi.update(activeId, { listId: targetListId });
      await refresh();
    }
  }

  async function handleDelete(id: string) {
    setErr(null);
    try {
      await projectsApi.remove(id);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Błąd podczas usuwania");
    }
  }

  if (auth.loading) return (
    <div className="board-page">
      <div className="board-empty">
        <div className="board-empty-icon">⏳</div>
        <p>Ładowanie...</p>
      </div>
    </div>
  );
  if (!auth.user) return null;

  return (
    <div className="board-page">
      <div className="board-header">
        <div className="board-header-left">
          <h1>Tablica zadań</h1>
          <div className="board-user">
            <div className="board-user-info">
              <div className="board-user-name">{auth.user.displayName}</div>
              <div className="board-user-role">{auth.user.role === "ADMIN" ? "Administrator" : "Pracownik"}</div>
            </div>
            <span className={`badge ${auth.user.role === "ADMIN" ? "badge-primary" : "badge-success"}`}>
              {auth.user.role}
            </span>
          </div>
        </div>
        <button className="btn-secondary" onClick={async () => { await auth.logout(); nav("/login"); }}>
          Wyloguj
        </button>
      </div>

      {err && <div className="error-message animate-fadeIn">{err}</div>}

      <div className="board-add-card">
        <h3>➕ Dodaj nowe zadanie</h3>
        <div className="board-add-form">
          <input 
            placeholder="Nazwa zadania" 
            value={nazwa} 
            onChange={e => setNazwa(e.target.value)} 
          />
          <textarea 
            placeholder="Opis zadania (opcjonalnie)" 
            rows={2}
            value={opis} 
            onChange={e => setOpis(e.target.value)} 
          />
          <div className="board-add-actions">
            <button 
              className="btn-primary"
              onClick={async () => {
                setErr(null);
                try {
                  const firstList = lists[0]?.id;
                  if (!firstList) throw new Error("Brak kolumn na tablicy.");
                  await projectsApi.create({
                    nazwa,
                    opis,
                    listId: firstList,
                    ownerId: auth.user!.role === "ADMIN" ? "u-worker" : auth.user!.id,
                  });
                  setNazwa(""); setOpis("");
                  await refresh();
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Błąd");
                }
              }}
            >
              Dodaj zadanie
            </button>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          {lists.map(list => (
            <div key={list.id} className="board-column">
              <div className="board-column-header">
                <div className="board-column-title">
                  <span>{list.icon || "📋"}</span>
                  <span>{list.name}</span>
                </div>
                <span className="board-column-count">{projectsByList[list.id]?.length || 0}</span>
              </div>

              <SortableContext
                items={projectsByList[list.id]?.map(p => p.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="board-cards">
                  {(projectsByList[list.id] ?? []).length === 0 ? (
                    <div className="board-empty">
                      <div className="board-empty-icon">📭</div>
                      <p>Przeciągnij zadanie tutaj</p>
                    </div>
                  ) : (
                    (projectsByList[list.id] ?? []).map(p => (
                      <SortableCard
                        key={p.id}
                        project={p}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeProject ? <CardOverlay project={activeProject} /> : null}
        </DragOverlay>
      </DndContext>

      <div className="board-note">
        💡 <strong>Wskazówka:</strong> Przeciągnij karty między kolumnami. Jako <em>Pracownik</em> widzisz tylko swoje zadania.
      </div>
    </div>
  );
}

