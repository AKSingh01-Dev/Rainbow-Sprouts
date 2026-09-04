import type { Config } from "tailwindcss";

// Design tokens — "ledger & market" identity: an ink-navy base with a
// muted brass accent, evoking a shopkeeper's ledger book rather than a
// generic SaaS dashboard. Serif for headings (editorial, trustworthy),
// a plain grotesque sans for body/UI (legible at small sizes in tables).
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2430",        // primary dark, headings, admin chrome
        paper: "#F3F1EA",      // page background
        panel: "#FFFFFF",      // cards / table surfaces
        brass: "#B4863B",      // primary accent (CTAs, active states)
        brassDark: "#8F6A2C",
        teal: "#2F6F62",       // secondary accent (success, paid status)
        rust: "#A5473A",       // errors, destructive actions
        line: "#DDD8CB",       // hairline borders
        subtle: "#6B7280",     // secondary text
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
};
export default config;
