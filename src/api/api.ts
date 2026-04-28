import type { IProjectsApi } from "./IProjectsApi";
import { projectsApi } from "./projectsApi";
import { authApi } from "./authApi";
import { boardApi } from "./boardApi";
import { uzytkownikApi } from "./uzytkownikApi";
import { projektApi } from "./projektApi";
import { historyjkiApi } from "./historyjkiApi";

// Tu później podmienisz na np. cloudProjectsApi
export const api: {
  projects: IProjectsApi;
  auth: typeof authApi;
  board: typeof boardApi;
  uzytkownik: typeof uzytkownikApi;
  projekt: typeof projektApi;
  historyjki: typeof historyjkiApi;
} = {
  projects: projectsApi,
  auth: authApi,
  board: boardApi,
  uzytkownik: uzytkownikApi,
  projekt: projektApi,
  historyjki: historyjkiApi,
};

