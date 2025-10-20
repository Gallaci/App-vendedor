"use client"

import { usePathname } from "next/navigation"

export function useActivePath() {
  const pathname = usePathname()

  const checkActivePath = (path: string) => {
    // The dashboard path should only be active if it's an exact match.
    if (path === '/painel' && pathname === path) {
      return true;
    }
    // For other paths, check if the pathname starts with the given path.
    // This handles nested routes correctly.
    return path !== '/painel' && pathname.startsWith(path);
  }

  return checkActivePath
}
