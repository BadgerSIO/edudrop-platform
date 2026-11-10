import { flushSync } from "react-dom";

/**
 * Runs a DOM state update inside document.startViewTransition when supported
 * and reduced-motion is not enabled, falling back cleanly otherwise.
 */
export function runViewTransition(
  update: () => void,
  onFinished?: () => void
): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    update();
    onFinished?.();
    return;
  }

  const startVT = (
    document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    }
  ).startViewTransition;

  const allowMotion = window.matchMedia(
    "(prefers-reduced-motion: no-preference)"
  ).matches;

  if (typeof startVT !== "function" || !allowMotion) {
    update();
    onFinished?.();
    return;
  }

  const transition = startVT.call(document, () => {
    flushSync(update);
  });

  if (onFinished) {
    transition.finished.finally(onFinished);
  }
}

/**
 * Sanitizes an arbitrary string (e.g. a slug or database ID) into a valid,
 * unique CSS <custom-ident> suitable for view-transition-name.
 */
export function toViewTransitionName(prefix: string, rawId: string): string {
  const safe = rawId.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `${prefix}-${safe}`;
}
