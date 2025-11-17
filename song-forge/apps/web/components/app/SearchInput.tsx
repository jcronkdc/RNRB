"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { announce } from "../../lib/announce";

interface SearchInputProps {
  placeholder?: string;
}

export function SearchInput({ placeholder = "Search projects, songs…" }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [value, setValue] = useState("");
  const [, setNoResults] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && value.trim()) {
      event.preventDefault();
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
      announce(`Searching for: "${value}"`);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setValue("");
      setNoResults(false);
      announce("Search cleared");
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative flex min-w-0 flex-col">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          data-search="true"
          aria-label="Search"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setNoResults(false);
          }}
          onKeyDown={handleKeyDown}
          className="h-10 w-full min-w-0 max-w-xs truncate rounded-full border border-border/60 bg-surface pl-10 pr-4 text-sm text-brand-foreground shadow-soft transition-all focus-visible:border-brand-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:max-w-xs"
          autoComplete="off"
        />
      </div>
      {value && (
        <span className="mt-1 text-xs text-muted-foreground" tabIndex={-1} aria-live="polite">
          Press Enter to search
        </span>
      )}
    </div>
  );
}
