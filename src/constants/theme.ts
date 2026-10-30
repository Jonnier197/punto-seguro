import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    primary: "#1677D2", // Azul principal
    deepPrimary: "#0B3B70", // Azul profundo
    skyBlue: "#43A5FF", // Azul cielo
    text: "#0F172A", // Texto principal
    textSecondary: "#64748B", // Gris neutro oficial
    background: "#F1F5F9", // Fondo claro oficial
    cardBackground: "#FFFFFF", // Blanco oficial
    backgroundElement: "#E2E8F0",
    backgroundSelected: "#DBEAFE",
    border: "#CBD5E1",
  },
  dark: {
    primary: "#43A5FF", // Azul cielo (resalta sobre fondo oscuro)
    deepPrimary: "#0B3B70", // Azul profundo
    skyBlue: "#1677D2", // Azul principal
    text: "#FFFFFF", // Texto blanco
    textSecondary: "#94A3B8", // Gris neutro adaptado para contraste oscuro
    background: "#0F172A", // Fondo azul/gris muy oscuro
    cardBackground: "#1E293B", // Tarjetas en modo oscuro
    backgroundElement: "#334155",
    backgroundSelected: "#1E3A8A",
    border: "#334155",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
}) ?? {
  sans: "normal",
  serif: "serif",
  rounded: "normal",
  mono: "monospace",
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = 80; // Inset ajustado para Android
export const MaxContentWidth = 800;
