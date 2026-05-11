import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { api, type UserOut } from "../api";

interface ActiveUserCtx {
  users: UserOut[];
  activeUser: UserOut | undefined;
  setActiveUserId: (id: number) => void;
  signOut: () => void;
  isLoading: boolean;
}

const Ctx = createContext<ActiveUserCtx | null>(null);
const STORAGE_KEY = "ec:activeUserId";

export function ActiveUserProvider({ children }: PropsWithChildren) {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: api.users,
    staleTime: 60_000,
  });

  const [activeUserId, setId] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    if (activeUserId != null && users.length > 0 && !users.find((u) => u.id === activeUserId)) {
      // Saved user no longer exists (e.g. after a schema reset) — clear it.
      setId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [users, activeUserId]);

  const setActiveUserId = useCallback((id: number) => {
    setId(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  }, []);

  const signOut = useCallback(() => {
    setId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const activeUser = useMemo(
    () => users.find((u) => u.id === activeUserId),
    [users, activeUserId],
  );

  const value = useMemo(
    () => ({ users, activeUser, setActiveUserId, signOut, isLoading }),
    [users, activeUser, setActiveUserId, signOut, isLoading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActiveUser(): ActiveUserCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useActiveUser must be used within ActiveUserProvider");
  return v;
}
