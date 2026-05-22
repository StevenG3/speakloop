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
let ForgotPasswordPage: (typeof import("../app/(public)/forgot-password/ForgotPasswordPageView"))["ForgotPasswordPageView"];
let ResetPasswordPage: (typeof import("../app/(public)/reset-password/ResetPasswordPageView"))["ResetPasswordPageView"];

beforeAll(async () => {
  LandingPage = (await import("../app/(public)/LandingPageView")).LandingPageView;
  LoginForm = (await import("../app/(public)/login/LoginForm")).LoginForm;
  RegisterPage = (await import("../app/(public)/register/RegisterPageView")).RegisterPageView;
  OnboardingPage = (await import("../app/(public)/onboarding/OnboardingPageView")).OnboardingPageView;
  ForgotPasswordPage = (await import("../app/(public)/forgot-password/ForgotPasswordPageView")).ForgotPasswordPageView;
  ResetPasswordPage = (await import("../app/(public)/reset-password/ResetPasswordPageView")).ResetPasswordPageView;
});

afterEach(() => cleanup());

describe("public pages", () => {
  it("renders the landing page with the primary CTA", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: "SpeakLoop" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/register");
  });

  it("renders the landing page in Chinese for iPhone staging validation", () => {
    render(<LandingPage locale="zh-CN" />);

    expect(screen.getByText("AI 口语练习")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "登录" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "创建账号" })).toHaveAttribute("href", "/register");
  });

  it("renders login form validation affordances and redirect field", () => {
    render(<LoginForm redirectTo="/app/practice" />);

    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
    expect(screen.getByDisplayValue("/app/practice")).toHaveAttribute("name", "redirectTo");
  });

  it("renders the login page in Chinese with a registration escape hatch", () => {
    render(<LoginForm redirectTo="/app/practice" locale="zh-CN" />);

    expect(screen.getByRole("heading", { name: "登录" })).toBeInTheDocument();
    expect(screen.getByLabelText("邮箱")).toBeRequired();
    expect(screen.getByLabelText("密码")).toBeRequired();
    expect(screen.getByRole("link", { name: "忘记密码？" })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("link", { name: "创建账号" })).toHaveAttribute("href", "/register");
  });

  it("shows failed login and reset success states in Chinese", () => {
    const { rerender } = render(<LoginForm redirectTo="/app/practice" locale="zh-CN" error="invalid-credentials" />);

    expect(screen.getByText("邮箱或密码不正确。")).toBeInTheDocument();

    rerender(<LoginForm redirectTo="/app/practice" locale="zh-CN" reset="success" />);
    expect(screen.getByText("密码已重置，请使用新密码登录。")).toBeInTheDocument();

    rerender(<LoginForm redirectTo="/app/practice" locale="zh-CN" error="try-again" />);
    expect(screen.getByText("登录服务暂时不可用，请稍后再试。")).toBeInTheDocument();
  });

  it("renders the forgot-password flow in Chinese with an email reset affordance", () => {
    render(<ForgotPasswordPage locale="zh-CN" resetLink="/reset-password?token=abc" sent />);

    expect(screen.getByRole("heading", { name: "重置密码" })).toBeInTheDocument();
    expect(screen.getByLabelText("邮箱")).toBeRequired();
    expect(screen.getByText("如果这个邮箱存在，我们会发送密码重置链接。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "打开临时重置链接" })).toHaveAttribute("href", "/reset-password?token=abc");
  });

  it("renders the reset-password page in Chinese", () => {
    render(<ResetPasswordPage locale="zh-CN" token="abc" />);

    expect(screen.getByRole("heading", { name: "设置新密码" })).toBeInTheDocument();
    expect(screen.getByLabelText("新密码")).toBeRequired();
    expect(screen.getByDisplayValue("abc")).toHaveAttribute("name", "token");
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
    expect(screen.getByRole("link", { name: "登录" })).toHaveAttribute("href", "/login");
  });

  it("shows duplicate-email registration errors in Chinese", () => {
    render(<RegisterPage locale="zh-CN" error="email-registered" />);

    expect(screen.getByText("这个邮箱已经注册过，请直接登录或换一个邮箱。")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "登录" })[0]).toHaveAttribute("href", "/login");
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
