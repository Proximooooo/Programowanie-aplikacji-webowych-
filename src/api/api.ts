import type { IProjectsApi } from "./IProjectsApi";
import { projectsApi } from "./projectsApi";

// Tu później podmienisz na np. cloudProjectsApi
export const api: { projects: IProjectsApi } = {
  projects: projectsApi,
};

