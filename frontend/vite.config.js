import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  optimizeDeps: {
    exclude: ["react-resizable-panels"],
  },
  plugins: [
    react(),
    tailwindcss({
      // We inject your theme directly into Tailwind's compiler step, bypassing index.css configuration!
      content: ["./src/**/*.{js,ts,jsx,tsx}"],
      css: `
        @theme {
          /* --- Minimalist Font Mapping --- */
          --font-sans: "Geist", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif";
          --tracking-minimalist: 0.05em;

          /* --- Border Radius (Clean 6px for UI pieces) --- */
          --radius-lg: 0.375rem;
          --radius-md: 0.25rem;
          --radius-sm: 0.125rem;

          /* --- Light Theme Colors (Corporate Minimal) --- */
          --color-background: hsl(210 20% 98%);       /* Sidebar #F8FAFC canvas */
          --color-foreground: hsl(222 47% 11%);       /* Ink Black text #0F172A */
          --color-card: hsl(0 0% 100%);               /* Chat Window #FFFFFF */
          --color-card-foreground: hsl(222 47% 11%);
          --color-primary: hsl(221 83% 53%);          /* Royal Blue Accent #2563EB */
          --color-primary-foreground: hsl(210 20% 98%);
          --color-secondary: hsl(210 40% 96.1%);      /* Hover background #F1F5F9 */
          --color-secondary-foreground: hsl(222 47% 11%);
          --color-muted: hsl(210 40% 96.1%);          /* Code Block background */
          --color-muted-foreground: hsl(215 16% 47%); /* Muted Text #64748B */
          --color-accent: hsl(214 32% 91%);           /* Active Channel #E2E8F0 */
          --color-accent-foreground: hsl(222 47% 11%);
          --color-border: hsl(214 32% 91%);           /* 1px sleek layout lines */
          --color-input: hsl(214 32% 91%);
          --color-ring: hsl(221 83% 53%);
          --color-mention: hsl(48 96% 89%);           /* Row Tag Alert #FEF3C7 */

          /* --- Dark Theme Overrides (Neon Workspace) --- */
          --dark-background: hsl(216 37% 5%);         /* Midnight Black Sidebar #080B11 */
          --dark-foreground: hsl(210 20% 96%);        /* Off-White text #F3F4F6 */
          --dark-card: hsl(216 30% 8%);               /* Deep Slate Chat Window #0F141C */
          --dark-card-foreground: hsl(210 20% 96%);
          --dark-primary: hsl(191 100% 50%);          /* Neon Cyan/Blue #00D2FF */
          --dark-primary-foreground: hsl(216 37% 5%);
          --dark-secondary: hsl(217 33% 11%);         /* Hover and Input boxes #131A26 */
          --dark-secondary-foreground: hsl(210 20% 96%);
          --dark-muted: hsl(216 37% 5%);              /* Code blocks #080B11 */
          --dark-muted-foreground: hsl(218 11% 65%);  /* Cool Gray secondary text #9CA3AF */
          --dark-accent: hsl(218 32% 14%);            /* Selected Channel Highlight #18202F */
          --dark-accent-foreground: hsl(210 20% 96%);
          --dark-border: hsl(217 19% 27%);            /* Slate borders #222D3F */
          --dark-input: hsl(217 19% 27%);
          --dark-ring: hsl(191 100% 50%);
          --dark-mention: hsl(212 41% 15%);           /* Faint blue row alert #162535 */
        }
      `
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})