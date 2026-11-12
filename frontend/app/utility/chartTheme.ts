export interface EduDropChartPalette {
  forest: string;
  forestLight: string;
  amber: string;
  lime: string;
  ink: string;
  body: string;
  borderSubtle: string;
  bento: string;
  emerald: string;
  sky: string;
  purple: string;
}

const DEFAULT_PALETTE: EduDropChartPalette = {
  forest: "rgb(10, 60, 40)",
  forestLight: "rgb(14, 77, 52)",
  amber: "rgb(245, 158, 11)",
  lime: "rgb(158, 240, 26)",
  ink: "rgb(15, 31, 24)",
  body: "rgb(74, 89, 82)",
  borderSubtle: "rgb(228, 232, 230)",
  bento: "rgb(244, 245, 246)",
  emerald: "rgb(16, 185, 129)",
  sky: "rgb(2, 132, 199)",
  purple: "rgb(147, 51, 234)",
};

const readCssRgbToken = (
  styles: CSSStyleDeclaration,
  tokenName: string,
  fallbackRgb: string
): string => {
  const raw = styles.getPropertyValue(tokenName).trim();
  if (!raw) return fallbackRgb;
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 3) {
    return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
  }
  return fallbackRgb;
};

/**
 * Resolves EduDrop CSS custom property RGB channels into concrete color strings
 * consumed by ApexCharts canvas/SVG options while adhering to CSS-token theming.
 */
export function resolveEduDropChartPalette(): EduDropChartPalette {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return DEFAULT_PALETTE;
  }
  const styles = getComputedStyle(document.documentElement);
  return {
    forest: readCssRgbToken(styles, "--surface-forest", DEFAULT_PALETTE.forest),
    forestLight: readCssRgbToken(
      styles,
      "--surface-forest-light",
      DEFAULT_PALETTE.forestLight
    ),
    amber: readCssRgbToken(styles, "--brand-amber", DEFAULT_PALETTE.amber),
    lime: readCssRgbToken(styles, "--brand-lime", DEFAULT_PALETTE.lime),
    ink: readCssRgbToken(styles, "--text-ink", DEFAULT_PALETTE.ink),
    body: readCssRgbToken(styles, "--text-body", DEFAULT_PALETTE.body),
    borderSubtle: readCssRgbToken(
      styles,
      "--border-subtle",
      DEFAULT_PALETTE.borderSubtle
    ),
    bento: readCssRgbToken(styles, "--surface-bento", DEFAULT_PALETTE.bento),
    emerald: DEFAULT_PALETTE.emerald,
    sky: DEFAULT_PALETTE.sky,
    purple: DEFAULT_PALETTE.purple,
  };
}
