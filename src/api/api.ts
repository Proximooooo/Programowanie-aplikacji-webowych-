import type { IProjectsApi } from "./IProjectsApi";
import { projectsApi } from "./projectsApi";
import { authApi } from "./authApi";
import { boardApi } from "./boardApi";

// Tu później podmienisz na np. cloudProjectsApi
export const api: { 
  projects: IProjectsApi;
  auth: typeof authApi;
  board: typeof boardApi;
} = {
  projects: projectsApi,
  auth: authApi,
  board: boardApi,
};

