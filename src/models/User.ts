export type Role = "ADMIN" | "WORKER";

export type User = {
  id: string;
  login: string;
  password: string; // demo (wiem – plain text; potem podmienimy na prawdziwe auth)
  role: Role;
  displayName: string;
};

