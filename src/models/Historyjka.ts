export type Priorytet = "niski" | "sredni" | "wysoki";
export type StanHistoryjki = "todo" | "doing" | "done";

export type Historyjka = {
  id: string;
  nazwa: string;
  opis: string;
  priorytet: Priorytet;
  projektId: string;
  dataUtworzenia: string; // ISO string
  stan: StanHistoryjki;
  wlascicielId: string;
};

export type HistoryjkaCreateInput = Omit<Historyjka, "id" | "dataUtworzenia">;
export type HistoryjkaUpdateInput = Partial<Omit<Historyjka, "id" | "dataUtworzenia" | "projektId" | "wlascicielId">>;

