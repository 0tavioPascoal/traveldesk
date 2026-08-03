"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function resolvedTheme(): Theme {
  const stored = window.localStorage.getItem("traveldesk-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("traveldesk-theme-change", onStoreChange);
  media.addEventListener("change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("traveldesk-theme-change", onStoreChange);
    media.removeEventListener("change", onStoreChange);
  };
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, resolvedTheme, () => "light");

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("traveldesk-theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new Event("traveldesk-theme-change"));
  }

  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      className={`grid size-11 place-items-center rounded-lg border border-input bg-card text-card-foreground transition-colors hover:bg-muted ${className}`}
    >
      {dark ? <Sun aria-hidden="true" className="size-5" /> : <Moon aria-hidden="true" className="size-5" />}
    </button>
  );
}
