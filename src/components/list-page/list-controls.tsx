import { Search } from "lucide-react";

export const listControlStyles =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";

export function ListSearchField({
  id,
  name = "query",
  label,
  placeholder,
  defaultValue,
  maxLength = 160,
  className = "",
  compact = false,
}: {
  id: string;
  name?: string;
  label: string;
  placeholder: string;
  defaultValue: string;
  maxLength?: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={compact ? "sr-only" : "mb-1.5 block text-sm font-medium"}
      >
        {label}
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={id}
          name={name}
          type="search"
          maxLength={maxLength}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`${listControlStyles} pl-9 pr-10`}
        />
        <button
          type="submit"
          aria-label={label}
          className="absolute right-0 top-0 grid size-10 place-items-center rounded-lg text-primary outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
