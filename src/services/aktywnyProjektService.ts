const LS_AKTYWNY_PROJEKT = "manageme.aktywnyProjekt.v1";

export const aktywnyProjektService = {
  get(): string | null {
    return localStorage.getItem(LS_AKTYWNY_PROJEKT);
  },

  set(projektId: string): void {
    localStorage.setItem(LS_AKTYWNY_PROJEKT, projektId);
  },

  clear(): void {
    localStorage.removeItem(LS_AKTYWNY_PROJEKT);
  },
};

