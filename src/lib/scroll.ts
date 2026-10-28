import Lenis from "lenis";
import { gsap, ScrollTrigger, ensureGsapRegistered, prefersReducedMotion, cleanupScrollTriggers } from "./animations";

let lenis: Lenis | null = null;
let initialized = false;
let progressBar: HTMLElement | null = null;

export function getLenis(): Lenis | null {
  return lenis;
}

function createProgressBar() {
  progressBar = document.getElementById("scroll-progress");
  if (!progressBar) return;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      if (progressBar) progressBar.style.transform = `scaleX(${self.progress})`;
    },
  });
}

function createGridParallax() {
  if (prefersReducedMotion()) return;
  gsap.to("body", {
    "--grid-shift": "220px",
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.6 },
  });
}

function refresh() {
  lenis?.resize();
  ScrollTrigger.refresh();
}

/** Tier in the nav order, for deciding which way a page transition should slide. -1 = not in the nav (e.g. 404). */
function navTier(pathname: string): number {
  if (pathname === "/" || pathname.startsWith("/work/")) return 0;
  if (pathname.startsWith("/research")) return 1;
  if (pathname.startsWith("/about")) return 2;
  if (pathname.startsWith("/contact")) return 3;
  return -1;
}

function trackNavDirection() {
  document.addEventListener("astro:before-preparation", (event) => {
    const e = event as unknown as { from: URL; to: URL };
    const fromTier = navTier(e.from.pathname);
    const toTier = navTier(e.to.pathname);
    const root = document.documentElement;
    if (fromTier === -1 || toTier === -1 || fromTier === toTier) {
      delete root.dataset.navDirection;
    } else {
      root.dataset.navDirection = toTier > fromTier ? "forward" : "back";
    }
  });
}

/** Runs once per session (not per page — the Lenis instance and its RAF loop persist across Astro transitions). */
export function initSmoothScroll() {
  if (initialized) return;
  initialized = true;

  ensureGsapRegistered();

  lenis = new Lenis({
    anchors: true,
    autoRaf: false,
  });

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  lenis.on("scroll", ScrollTrigger.update);
  trackNavDirection();

  // Every page's own reveal animations register this listener too; harmless
  // to also own one centrally so pages with no script of their own (404)
  // still get their ScrollTriggers (progress bar, parallax) cleaned up.
  document.addEventListener("astro:before-swap", cleanupScrollTriggers);
}

/** Re-creates the page-level scroll effects and recalculates heights after a navigation. */
export function initPageScroll() {
  initSmoothScroll();
  createProgressBar();
  createGridParallax();
  refresh();
}
