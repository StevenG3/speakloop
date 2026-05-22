// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Dashboard } from "../app/(app)/app/Dashboard";

afterEach(() => cleanup());

describe("dashboard", () => {
  it("renders the due review count", () => {
    render(
      <Dashboard
        displayName="Demo"
        dueCount={3}
        streakDays={4}
        recentSessions={[{ id: "s1", title: "Korean free talk", startedAt: "May 21" }]}
      />
    );

    expect(screen.getByRole("heading", { name: "Welcome back, Demo" })).toBeInTheDocument();
    expect(screen.getByText("3 due")).toBeInTheDocument();
    expect(screen.getByText("4 day streak")).toBeInTheDocument();
  });

  it("renders an empty state when there are no recent sessions", () => {
    render(<Dashboard displayName="Demo" dueCount={0} streakDays={0} recentSessions={[]} />);

    expect(screen.getByText("Start your first conversation")).toBeInTheDocument();
  });

  it("links to practice from the primary CTA", () => {
    render(<Dashboard displayName="Demo" dueCount={0} streakDays={0} recentSessions={[]} />);

    expect(screen.getAllByRole("link", { name: "Start practice" })[0]).toHaveAttribute("href", "/app/practice");
  });
});
