export type Projekt = {
  id: string;
  nazwa: string;
  opis: string;
};

export type ProjektCreateInput = Omit<Projekt, "id">;
export type ProjektUpdateInput = Partial<Omit<Projekt, "id">>;

