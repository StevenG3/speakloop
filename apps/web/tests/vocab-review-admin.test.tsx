// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

let VocabBook: (typeof import("../app/(app)/app/vocab/VocabBook"))["VocabBook"];
let ReviewQueue: (typeof import("../app/(app)/app/review/ReviewQueue"))["ReviewQueue"];
let ProviderAdmin: (typeof import("../app/(admin)/admin/providers/ProviderAdmin"))["ProviderAdmin"];

beforeAll(async () => {
  VocabBook = (await import("../app/(app)/app/vocab/VocabBook")).VocabBook;
  ReviewQueue = (await import("../app/(app)/app/review/ReviewQueue")).ReviewQueue;
  ProviderAdmin = (await import("../app/(admin)/admin/providers/ProviderAdmin")).ProviderAdmin;
});

afterEach(() => cleanup());

describe("vocabulary book UI", () => {
  it("shows an empty state", () => {
    render(<VocabBook items={[]} />);

    expect(screen.getByText("No saved vocabulary yet")).toBeInTheDocument();
  });

  it("filters grouped vocabulary by search text", async () => {
    render(
      <VocabBook
        items={[
          { id: "v1", language: "ko", term: "안녕하세요", meaning: "hello", examples: [], sourceMessageId: "m1" },
          { id: "v2", language: "en", term: "practice", meaning: "repeat to improve", examples: [], sourceMessageId: null }
        ]}
      />
    );

    await userEvent.type(screen.getByRole("searchbox", { name: "Search vocabulary" }), "practice");

    expect(screen.getByRole("heading", { name: "English" })).toBeInTheDocument();
    expect(screen.getByText("practice")).toBeInTheDocument();
    expect(screen.queryByText("안녕하세요")).not.toBeInTheDocument();
  });
});

describe("review queue UI", () => {
  it("reveals answers and exposes grade buttons with progress", async () => {
    render(
      <ReviewQueue
        cards={[{ id: "c1", term: "practice", meaning: "repeat to improve", language: "en", progressLabel: "1 of 1" }]}
      />
    );

    expect(screen.getByText("practice")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reveal answer" }));

    expect(screen.getByText("repeat to improve")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Good" })).toBeInTheDocument();
    expect(screen.getByText("1 of 1")).toBeInTheDocument();
  });

  it("shows all caught up when the queue is empty", () => {
    render(<ReviewQueue cards={[]} />);

    expect(screen.getByText("All caught up")).toBeInTheDocument();
  });
});

describe("admin UI", () => {
  it("renders provider cards with masked key and test connection controls", () => {
    render(
      <ProviderAdmin
        configs={[
          {
            id: "p1",
            kind: "llm",
            vendor: "mock",
            model: "mock-chat",
            api_key_masked: "sk-•••••1234",
            role: "primary",
            is_active: true,
            base_url: "https://mock.local",
            last_health: "ok",
            last_latency_ms: 12
          }
        ]}
      />
    );

    expect(screen.getByText("LLM")).toBeInTheDocument();
    expect(screen.getByText("sk-•••••1234")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Test LLM connection" })).toBeInTheDocument();
  });
});
