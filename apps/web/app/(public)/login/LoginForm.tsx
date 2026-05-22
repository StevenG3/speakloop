import React from "react";
import { Button, Card, Input } from "@/components/ui";
import { loginAction } from "./actions";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-12 text-[var(--text)]">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Log in</h1>
        <form action={loginAction} className="mt-6 grid gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <label className="grid gap-2 text-sm font-medium">
            Email
            <Input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password
            <Input name="password" type="password" autoComplete="current-password" required />
          </label>
          <Button type="submit">Log in</Button>
        </form>
      </Card>
    </main>
  );
}
