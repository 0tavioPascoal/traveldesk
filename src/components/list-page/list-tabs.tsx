"use client";

import Link from "next/link";

export function ListTabs({
  label,
  items,
}: {
  label: string;
  items: Array<{ href: string; label: string; active: boolean }>;
}) {
  return (
    <nav
      aria-label={label}
      className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted p-1 sm:w-fit"
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        const links = Array.from(
          event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"),
        );
        const currentIndex = links.indexOf(
          document.activeElement as HTMLAnchorElement,
        );
        if (currentIndex < 0) return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        links[(currentIndex + direction + links.length) % links.length]?.focus();
      }}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`min-h-10 min-w-28 flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold transition-colors sm:flex-none ${
            item.active
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
