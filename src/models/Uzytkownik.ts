export type RolaUzytkownika = "admin" | "user";

export type Uzytkownik = {
  id: string;
  imie: string;
  nazwisko: string;
  rola: RolaUzytkownika;
};

