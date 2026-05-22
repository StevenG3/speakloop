// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../app/(public)/login/actions", () => ({ loginAction: vi.fn() }));
vi.mock("../app/(public)/register/actions", () => ({ registerAction: vi.fn() }));
vi.mock("../app/(public)/onboarding/actions", () => ({ onboardingAction: vi.fn() }));
vi.mock("../app/locale-actions", () => ({ setLocaleAction: vi.fn() }));

let LandingPage: (typeof import("../app/(public)/LandingPageView"))["LandingPageView"];
let LoginForm: (typeof import("../app/(public)/login/LoginForm"))["LoginForm"];
let RegisterPage: (typeof import("../app/(public)/register/RegisterPageView"))["RegisterPageView"];
let OnboardingPage: (typeof import("../app/(public)/onboarding/OnboardingPageView"))["OnboardingPageView"];

beforeAll(async () => {
  LandingPage = (await import("../app/(public)/LandingPageView")).LandingPageView;
  LoginForm = (await import("../app/(public)/login/LoginForm")).LoginForm;
  RegisterPage = (await import("../app/(public)/register/RegisterPageView")).RegisterPageView;
  OnboardingPage = (await import("../app/(public)/onboarding/OnboardingPageView")).OnboardingPageView;
});

afterEach(() => cleanup());

describe("public pages", () => {
  it("renders the landing page with the primary CTA", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: "SpeakLoop" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start speaking" })).toHaveAttribute("href", "/register");
  });

  it("renders the landing page in Chinese for iPhone staging validation", () => {
    render(<LandingPage locale="zh-CN" />);

    expect(screen.getByText("AI 口语练习")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "开始练习" })).toHaveAttribute("href", "/register");
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

  it("lets Chinese-speaking learners choose Chinese as their native language", () => {
    render(<RegisterPage locale="zh-CN" />);

    expect(screen.getByLabelText("母语")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "汉语" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "创建账号" })).toBeInTheDocument();
  });

  it("shows duplicate-email registration errors in Chinese", () => {
    render(<RegisterPage locale="zh-CN" error="email-registered" />);

    expect(screen.getByText("这个邮箱已经注册过，请直接登录或换一个邮箱。")).toBeInTheDocument();
  });

  it("renders onboarding choices for MVP languages and levels", () => {
    render(<OnboardingPage />);

    expect(screen.getByRole("radio", { name: "Korean" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Chinese" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Intermediate" })).toBeInTheDocument();
    expect(screen.getByLabelText("Goal")).toBeInTheDocument();
  });

  it("renders onboarding language choices in Chinese", () => {
    render(<OnboardingPage locale="zh-CN" />);

    expect(screen.getByRole("radio", { name: "韩语" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "英语" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "中文" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "中级" })).toBeInTheDocument();
    expect(screen.getByLabelText("目标")).toHaveDisplayValue("日常会话");
  });
});
