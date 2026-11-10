/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* EduDrop Semantic Design System Tokens (with <alpha-value> opacity support) */
        "surface-forest": "rgb(var(--surface-forest) / <alpha-value>)",
        "surface-forest-light": "rgb(var(--surface-forest-light) / <alpha-value>)",
        "surface-canvas": "rgb(var(--surface-canvas) / <alpha-value>)",
        "surface-bento": "rgb(var(--surface-bento) / <alpha-value>)",
        "brand-lime": "rgb(var(--brand-lime) / <alpha-value>)",
        "brand-lime-hover": "rgb(var(--brand-lime-hover) / <alpha-value>)",
        "brand-amber": "rgb(var(--brand-amber) / <alpha-value>)",
        "ink": "rgb(var(--text-ink) / <alpha-value>)",
        "body": "rgb(var(--text-body) / <alpha-value>)",
        "on-forest": "rgb(var(--text-on-forest) / <alpha-value>)",
        "on-forest-muted": "rgb(var(--text-on-forest-muted) / <alpha-value>)",
        "text-ink": "rgb(var(--text-ink) / <alpha-value>)",
        "text-body": "rgb(var(--text-body) / <alpha-value>)",
        "text-on-forest": "rgb(var(--text-on-forest) / <alpha-value>)",
        "text-on-forest-muted": "rgb(var(--text-on-forest-muted) / <alpha-value>)",
        "border-subtle": "rgb(var(--border-subtle) / <alpha-value>)",
        "border-glass": "var(--border-glass)",

        /* Legacy colors maintained for existing inner pages */
        "#02263C": "#0F172A",
        "#64CDF4": "#14B8A6",
        "#696687": "#696687",
        "#F6F6F6": "#F6F6F6",
        "#F8FAFB": "#F8FAFB",
        "#E4EAEE": "#E4EAEE",
        "#EDF0F8": "#EDF0F8",
        "#FFF0F0": "#FFF0F0",
        "#D46F77": "#D46F77",
        "#B9BBBF": "#B9BBBF",
        "#FBF3EA": "#FBF3EA",
        "#D48D3B": "#D48D3B",
        "#3E9242": "#3E9242",
        "#F3F3F3": "#F3F3F3",
        "#0E76BC": "#0D9488",
        "#726C6C": "#726C6C",
        "#E4E4E4": "#E4E4E4",
        "#E59819": "#E59819",
        "#EDFAFF": "#F0FDFA",
        "#F6FCFE": "#F8FAFC",
        "#CFEBFD": "#CCFBF1",
      },
      fontSize: {
        display: [
          "clamp(2.5rem, 1.6rem + 3.8vw, 4.5rem)",
          { lineHeight: "1.06", letterSpacing: "-0.03em" },
        ],
        h2: [
          "clamp(1.875rem, 1.35rem + 2.2vw, 3rem)",
          { lineHeight: "1.12", letterSpacing: "-0.025em" },
        ],
        lead: [
          "clamp(1.2rem, 1.05rem + 0.7vw, 1.6rem)",
          { lineHeight: "1.38", letterSpacing: "-0.015em" },
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "10px": "10px",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      spacing: {
        "5px": "5px",
        "10px": "10px",
        "14px": "14px",
        "15px": "15px",
        "18px": "18px",
        "25px": "25px",
        "30px": "30px",
        "50px": "50px",
        "60px": "60px",
        "70px": "70px",
        "100px": "100px",
        "120px": "120px",
      },
      gridTemplateColumns: {
        fluid: "repeat(auto-fit,minmax(290px,1fr))",
        fluidSetting: "repeat(auto-fit,minmax(200px,1fr))",
        fluidSchoolInfo: "repeat(auto-fit,minmax(400px,1fr))",
        fluidCategories: "repeat(auto-fit,minmax(405px,1fr))",
      },
      backgroundImage: {
        "edudrop-gradient-support":
          "linear-gradient(180deg, rgba(10, 60, 40, 0.08) 0%, rgba(10, 60, 40, 0.03) 54.91%, rgba(255, 255, 255, 0.00) 98%)",
        "hero-school-list": "url('/school/hero.webp')",
      },
      boxShadow: {
        "edudrop-btn": "0px 4px 35px 0px rgba(0, 0, 0, 0.10)",
        "edudrop-image-gallery": "0px 5px 35px 0px rgba(0, 0, 0, 0.20)",
        "edudrop-slider": "0px 4px 25px 0px rgba(0, 0, 0, 0.05);",
        "school-single-sidebar": "-3px 0px 35px 0px rgba(20, 184, 166, 0.15)",
        bento: "0px 2px 8px 0px rgba(15, 31, 24, 0.04), 0px 12px 24px -4px rgba(15, 31, 24, 0.06)",
        "bento-hover": "0px 8px 16px -2px rgba(15, 31, 24, 0.06), 0px 24px 48px -8px rgba(15, 31, 24, 0.10)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
};
