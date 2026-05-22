import React from "react";
import { Button, Card, Input } from "@/components/ui";
import { registerAction } from "./actions";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-12 text-[var(--text)]">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <form action={registerAction} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Display name
            <Input name="displayName" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Email
            <Input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password
            <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
            <span className="text-xs text-[var(--text-muted)]">Use at least 8 characters.</span>
          </label>
          <Button type="submit">Create account</Button>
        </form>
      </Card>
    </main>
  );
}
