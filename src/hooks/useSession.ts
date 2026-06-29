import { useState, useEffect } from "react";
import { carregarToken, inscreverAuth } from "../lib/auth";

export function useSession() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    carregarToken().then((token) => {
      setIsAuthenticated(!!token);
    });
    return inscreverAuth(setIsAuthenticated);
  }, []);

  return { isAuthenticated, isLoadingSession: isAuthenticated === null };
}
