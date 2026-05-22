export const typography = {
  families: {
    display: "Inter, ui-sans-serif, system-ui, sans-serif",
    body: "Inter, ui-sans-serif, system-ui, sans-serif"
  },
  sizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "40px"
  },
  weights: { regular: "400", medium: "500", semibold: "600", bold: "700" },
  lineHeights: { body: "1.5", heading: "1.2" }
} as const;

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  6: "24px",
  8: "32px",
  12: "48px",
  16: "64px"
} as const;

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "9999px"
} as const;

export const lightColors = {
  bg: "#fffaf6",
  surface: "#ffffff",
  surfaceElevated: "#fff3e8",
  text: "#201713",
  textMuted: "#6f5c51",
  primary: "#d9572b",
  primaryFg: "#ffffff",
  accent: "#1f8a70",
  success: "#257a4f",
  warning: "#a86400",
  danger: "#b42318",
  border: "#ead8cc"
} as const;

export const darkColors = {
  bg: "#161311",
  surface: "#211c19",
  surfaceElevated: "#2d241f",
  text: "#fff7f0",
  textMuted: "#c9b6aa",
  primary: "#ff8a5c",
  primaryFg: "#241007",
  accent: "#61d3b1",
  success: "#72d49a",
  warning: "#f0b35a",
  danger: "#ff8f85",
  border: "#463830"
} as const;

export function cssVariables(theme: "light" | "dark" = "light") {
  const colors = theme === "light" ? lightColors : darkColors;
  return {
    "--bg": colors.bg,
    "--surface": colors.surface,
    "--surface-elevated": colors.surfaceElevated,
    "--text": colors.text,
    "--text-muted": colors.textMuted,
    "--primary": colors.primary,
    "--primary-fg": colors.primaryFg,
    "--accent": colors.accent,
    "--success": colors.success,
    "--warning": colors.warning,
    "--danger": colors.danger,
    "--border": colors.border
  } as const;
}
