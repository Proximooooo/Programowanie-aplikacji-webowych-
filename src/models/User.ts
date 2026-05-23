export type Role = "ADMIN" | "WORKER";

export type User = {
  id: string;
  login: string;
  password: string; 
  role: Role;
  displayName: string;
};

