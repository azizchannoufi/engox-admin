/**
 * Design tokens ported from the Engox driver app
 * (`frontend_React/Engox/constants/theme.ts`) so Fleet Ops stays on-brand.
 */
export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#0a7ea4",
    icon: "#687076",
  },
  greens: {
    green1: "#69B76B",
    green2: "#01D4A6",
    green3: "#019565",
    green4: "#029566",
    greenSoft: "#E7F9F4",
  },
  blues: {
    blue1: "#002366",
  },
  grays: {
    gray1: "#999999",
    gray2: "#E5E5E5",
  },
  status: {
    error: "#E53935",
    success: "#4CAF50",
  },
  gold: "#C9A227",
  canvas: "#F4F6F8",
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Typography = {
  title: { fontSize: 24, fontWeight: 700 as const },
  body: { fontSize: 16, fontWeight: 400 as const },
  label: { fontSize: 14, fontWeight: 600 as const },
} as const;

export const DEPOT = {
  name: "Deposito regionale nord-est — Queens, NY",
  shortName: "Hub Queens",
  code: "QNS-01",
  lat: 40.7505,
  lng: -73.835,
} as const;
