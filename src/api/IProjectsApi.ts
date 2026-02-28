import type { Project, ProjectCreateInput, ProjectUpdateInput } from "../models/Project";

export interface IProjectsApi {
  list(): Promise<Project[]>;
  get(id: string): Promise<Project | null>;
  create(input: ProjectCreateInput): Promise<Project>;
  update(id: string, patch: ProjectUpdateInput): Promise<Project>;
  remove(id: string): Promise<void>;
  clearAll(): Promise<void>;
}

