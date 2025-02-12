"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
      aria-label="Toggle theme"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
