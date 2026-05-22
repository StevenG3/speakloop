// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AppLayout from "../app/(app)/layout";
import { HistoryList } from "../app/(app)/app/history/HistoryList";
import { SettingsPanel } from "../app/(app)/app/settings/SettingsPanel";

afterEach(() => cleanup());

describe("app navigation and missing pages", () => {
  it("renders the mobile-first app nav around app pages", () => {
    render(
      <AppLayout>
        <h1>Inside app</h1>
      </AppLayout>
    );

    expect(screen.getByRole("navigation", { name: "App navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/app");
    expect(screen.getByRole("link", { name: "Practice" })).toHaveAttribute("href", "/app/practice");
    expect(screen.getByRole("link", { name: "Vocab" })).toHaveAttribute("href", "/app/vocab");
    expect(screen.getByRole("link", { name: "Review" })).toHaveAttribute("href", "/app/review");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/app/settings");
  });

  it("renders history empty and populated states", () => {
    const { rerender } = render(<HistoryList sessions={[]} />);
    expect(screen.getByText("No conversations yet")).toBeInTheDocument();

    rerender(
      <HistoryList
        sessions={[
          {
            id: "s1",
            title: "Korean warmup",
            startedAt: "May 22, 2026",
            messages: ["안녕하세요", "Nice effort"]
          }
        ]}
      />
    );

    expect(screen.getByRole("link", { name: "Replay Korean warmup" })).toHaveAttribute("href", "/app/session/s1");
    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
  });

  it("renders settings profile and language defaults", () => {
    render(
      <SettingsPanel
        profile={{ email: "demo@speakloop.dev", targetLanguage: "ko", level: "beginner", defaultSpeed: 1.1, theme: "system" }}
      />
    );

    expect(screen.getByText("demo@speakloop.dev")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ko")).toBeInTheDocument();
    expect(screen.getByDisplayValue("beginner")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1.1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });
});
