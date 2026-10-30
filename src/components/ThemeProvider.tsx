"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme("light");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Keep light theme
    setTheme("light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={mounted ? theme : "light"}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
