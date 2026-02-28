export type Project = {
  id: string;
  nazwa: string;
  opis: string;
  listId: string;     // Trello column
  ownerId: string;    // kto jest właścicielem/przypisany
};

export type ProjectCreateInput = Omit<Project, "id">;
export type ProjectUpdateInput = Partial<Omit<Project, "id">>;

