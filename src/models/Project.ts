export type ProjectStatus = "NEW" | "IN_PROGRESS" | "DONE";

export type Project = {
  id: string;
  nazwa: string;
  opis: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  listId: string;
  ownerId: string;
  order: number;
};

export type ProjectCreateInput = Omit<Project, "id" | "createdAt" | "updatedAt">;
export type ProjectUpdateInput = Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>;

