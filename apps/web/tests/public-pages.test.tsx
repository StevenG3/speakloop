// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../app/(public)/login/actions", () => ({ loginAction: vi.fn() }));
vi.mock("../app/(public)/register/actions", () => ({ registerAction: vi.fn() }));
vi.mock("../app/(public)/onboarding/actions", () => ({ onboardingAction: vi.fn() }));

let LandingPage: (typeof import("../app/(public)/page"))["default"];
let LoginForm: (typeof import("../app/(public)/login/LoginForm"))["LoginForm"];
let RegisterPage: (typeof import("../app/(public)/register/page"))["default"];
let OnboardingPage: (typeof import("../app/(public)/onboarding/page"))["default"];

beforeAll(async () => {
  LandingPage = (await import("../app/(public)/page")).default;
  LoginForm = (await import("../app/(public)/login/LoginForm")).LoginForm;
  RegisterPage = (await import("../app/(public)/register/page")).default;
  OnboardingPage = (await import("../app/(public)/onboarding/page")).default;
});

describe("public pages", () => {
  it("renders the landing page with the primary CTA", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: "SpeakLoop" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start speaking" })).toHaveAttribute("href", "/register");
  });

  it("renders login form validation affordances and redirect field", () => {
    render(<LoginForm redirectTo="/app/practice" />);

    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
    expect(screen.getByDisplayValue("/app/practice")).toHaveAttribute("name", "redirectTo");
  });

  it("renders register form with inline requirements", () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText("Display name")).toBeRequired();
    expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument();
  });

  it("renders onboarding choices for MVP languages and levels", () => {
    render(<OnboardingPage />);

    expect(screen.getByRole("radio", { name: "Korean" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Chinese" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Intermediate" })).toBeInTheDocument();
    expect(screen.getByLabelText("Goal")).toBeInTheDocument();
  });
});
