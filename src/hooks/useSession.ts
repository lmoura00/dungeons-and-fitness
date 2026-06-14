import { useState, useEffect } from "react";
import { obterToken, inscreverAuth } from "../lib/auth";

export function useSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!obterToken());

  useEffect(() => {
    return inscreverAuth(setIsAuthenticated);
  }, []);

  return { isAuthenticated };
}
