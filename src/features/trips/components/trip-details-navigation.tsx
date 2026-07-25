"use client";

import { useEffect, useState } from "react";

export type TripDetailsNavigationItem = { id: string; label: string };

export function TripDetailsNavigation({ items }: { items: TripDetailsNavigationItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-24% 0px -64% 0px", threshold: [0, 0.1, 0.4] },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Seções da viagem" className="sticky top-16 z-20 -mx-4 overflow-x-auto border-y border-border bg-background/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-2">
      <div className="flex min-w-max gap-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active === item.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
