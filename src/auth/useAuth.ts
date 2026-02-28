import { useEffect, useState } from "react";
import type { User } from "../models/User";
import { authApi } from "../api/authApi";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const me = await authApi.me();
    setUser(me);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  return {
    user,
    loading,
    refresh,
    login: async (login: string, password: string) => {
      const u = await authApi.login(login, password);
      setUser(u);
      return u;
    },
    logout: async () => {
      await authApi.logout();
      setUser(null);
    }
  };
}

