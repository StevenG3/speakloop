"use client";

import type { ComponentPropsWithoutRef, FormEvent, ReactNode } from "react";
import React from "react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { z } from "zod";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--primary)] text-[var(--primary-fg)] hover:brightness-95",
  secondary: "bg-[var(--surface-elevated)] text-[var(--text)] border border-[var(--border)]",
  ghost: "bg-transparent text-[var(--text)] hover:bg-[var(--surface-elevated)]",
  destructive: "bg-[var(--danger)] text-white hover:brightness-95"
};

export function Button({
  variant = "primary",
  className = "",
  asChild = false,
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant; asChild?: boolean }) {
  const classes = [
    "inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold",
    "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    buttonVariants[variant],
    className
  ].join(" ");

  if (asChild && React.isValidElement<{ className?: string }>(props.children)) {
    return React.cloneElement(props.children, {
      className: [classes, props.children.props.className].filter(Boolean).join(" ")
    });
  }

  return (
    <button
      className={classes}
      {...props}
    />
  );
}

export function Card({ className = "", ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={["rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm", className].join(" ")}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={[
        "min-h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-base text-[var(--text)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
        className
      ].join(" ")}
      {...props}
    />
  );
}

export function Form<TSchema extends z.ZodTypeAny>({
  schema,
  onValid,
  children,
  ...props
}: ComponentPropsWithoutRef<"form"> & {
  schema: TSchema;
  onValid: (data: z.infer<TSchema>) => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    onValid(schema.parse(values));
  }

  return (
    <form onSubmit={handleSubmit} noValidate {...props}>
      {children}
    </form>
  );
}

export function Skeleton(props: ComponentPropsWithoutRef<"div">) {
  return <div className="min-h-6 animate-pulse rounded-md bg-[var(--surface-elevated)]" {...props} />;
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="grid gap-4 rounded-lg border border-dashed border-[var(--border)] p-6 text-center">
      <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function Badge(props: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className="inline-flex min-h-6 items-center rounded-full bg-[var(--surface-elevated)] px-3 text-xs font-semibold text-[var(--text)]"
      {...props}
    />
  );
}

export function Slider(props: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      type="range"
      className="h-11 w-full accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      {...props}
    />
  );
}

export function Modal({ title, open, children }: { title: string; open: boolean; children: ReactNode }) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-lg"
        >
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">{title}</Dialog.Description>
          <div className="mt-4 text-sm text-[var(--text-muted)]">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Toast({ title }: { title: string }) {
  return (
    <div role="status" className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
      {title}
    </div>
  );
}

export function AppShell({ nav, children }: { nav: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="border-b border-[var(--border)] px-4 py-3">{nav}</nav>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

export function ThemeSwitch() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const nextTheme = theme === "light" ? "dark" : "light";

  function toggleTheme() {
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
  }

  return (
    <Button variant="secondary" aria-label={`Use ${nextTheme} theme`} onClick={toggleTheme}>
      Theme
    </Button>
  );
}
