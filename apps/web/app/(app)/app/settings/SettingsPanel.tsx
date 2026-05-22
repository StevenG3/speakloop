import React from "react";
import { Button, Card, Input } from "@/components/ui";

export type SettingsProfile = {
  email: string;
  targetLanguage: string;
  level: string;
  defaultSpeed: number;
  theme: string;
};

export function SettingsPanel({ profile }: { profile: SettingsProfile }) {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Profile and practice defaults.</p>
      </header>
      <Card className="grid gap-4">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Signed in as</p>
          <p className="font-semibold">{profile.email}</p>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <Input readOnly value={profile.email} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Target language
          <Input readOnly value={profile.targetLanguage} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Level
          <Input readOnly value={profile.level} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Default speed
          <Input readOnly value={String(profile.defaultSpeed)} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Theme
          <Input readOnly value={profile.theme} />
        </label>
        <form action="/api/auth/signout" method="post">
          <Button type="submit" variant="secondary">
            Log out
          </Button>
        </form>
      </Card>
    </div>
  );
}
