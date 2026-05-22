// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { afterEach, describe, expect, it } from "vitest";
import {
  AppShell,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Skeleton,
  Slider,
  ThemeSwitch,
  Toast
} from "../components/ui";

expect.extend(toHaveNoViolations);

afterEach(() => cleanup());

describe("UI primitives", () => {
  it("renders button variants with visible focus styles", () => {
    const variants = ["primary", "secondary", "ghost", "destructive"] as const;

    for (const variant of variants) {
      const { container } = render(<Button variant={variant}>{variant}</Button>);

      expect(screen.getByRole("button", { name: variant })).toHaveClass("focus-visible:ring-2");
      expect(container.firstChild).toHaveClass("min-h-11");
    }
  });

  it("renders structural primitives", () => {
    render(
      <AppShell nav={<a href="/app">Home</a>}>
        <Card>
          <Badge>Due</Badge>
          <Input aria-label="Term" />
          <Slider aria-label="Speed" min={0.5} max={1.5} step={0.1} defaultValue={1} />
          <Skeleton aria-label="Loading" />
          <EmptyState title="Nothing here" action={<Button>Start</Button>} />
          <Toast title="Saved" />
        </Card>
      </AppShell>
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Term" })).toHaveClass("focus-visible:ring-2");
    expect(screen.getByRole("slider", { name: "Speed" })).toHaveAttribute("min", "0.5");
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("renders modal accessibly", async () => {
    const { container } = render(
      <Modal title="Confirm" open>
        Are you sure?
      </Modal>
    );

    expect(screen.getByRole("dialog", { name: "Confirm" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("updates document theme variables via the theme switch", async () => {
    render(<ThemeSwitch />);

    await userEvent.click(screen.getByRole("button", { name: "Use dark theme" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    await userEvent.click(screen.getByRole("button", { name: "Use light theme" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
});
