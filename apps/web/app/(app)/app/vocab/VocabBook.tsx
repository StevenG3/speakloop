"use client";

import React, { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, Input } from "@/components/ui";

export type VocabBookItem = {
  id: string;
  language: "ko" | "en" | "zh";
  term: string;
  reading?: string | null;
  meaning: string;
  sourceMessageId?: string | null;
  examples: Array<{ sentence: string; translation?: string | null }>;
};

const languageLabels = { ko: "Korean", en: "English", zh: "Chinese" };

export function VocabBook({ items }: { items: VocabBookItem[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items;
    }
    return items.filter((item) =>
      [item.term, item.meaning, item.reading ?? ""].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [items, query]);

  const groups = {
    ko: filtered.filter((item) => item.language === "ko"),
    en: filtered.filter((item) => item.language === "en"),
    zh: filtered.filter((item) => item.language === "zh")
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-4 text-[var(--text)]">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vocabulary</h1>
          <p className="text-sm text-[var(--text-muted)]">Saved words from your sessions, ready for review.</p>
        </div>
        <Input
          role="searchbox"
          aria-label="Search vocabulary"
          placeholder="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:max-w-xs"
        />
      </header>

      {items.length === 0 ? <EmptyState title="No saved vocabulary yet" /> : null}
      {items.length > 0 && filtered.length === 0 ? <EmptyState title="No vocabulary matches your search" /> : null}

      {(["ko", "en", "zh"] as const).map((language) =>
        groups[language].length > 0 ? (
          <section key={language} className="grid gap-3">
            <h2 className="text-lg font-semibold">{languageLabels[language]}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {groups[language].map((item) => (
                <VocabCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null
      )}
    </main>
  );
}

function VocabCard({ item }: { item: VocabBookItem }) {
  return (
    <Card className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{item.term}</h3>
          {item.reading ? <p className="text-sm text-[var(--text-muted)]">{item.reading}</p> : null}
        </div>
        <Badge>{languageLabels[item.language]}</Badge>
      </div>
      <p>{item.meaning}</p>
      {item.examples[0] ? (
        <p className="rounded-md bg-[var(--surface-elevated)] p-3 text-sm text-[var(--text-muted)]">{item.examples[0].sentence}</p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        {item.sourceMessageId ? (
          <a className="text-sm font-medium text-[var(--primary)]" href={`#message-${item.sourceMessageId}`}>
            Source message
          </a>
        ) : (
          <span />
        )}
        <Button type="button" variant="ghost">
          Delete
        </Button>
      </div>
    </Card>
  );
}
