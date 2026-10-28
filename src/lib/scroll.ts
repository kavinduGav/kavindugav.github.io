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

/**
 * Lenis keeps its own internal scroll target across Astro's page swaps (the
 * whole point of the singleton — the ambient audio etc. survive navigation),
 * but that means after a real navigation it's still holding the *old*
 * page's scroll position. Astro resets window.scrollY itself, but on
 * Lenis's next raf tick it was re-applying its stale target and fighting
 * that reset, leaving the new page scrolled down. Force Lenis back in sync
 * with wherever the new page should actually start.
 */
function syncScrollPosition() {
  if (!lenis) return;
  if (location.hash) {
    lenis.scrollTo(location.hash, { immediate: true, force: true });
  } else {
    lenis.scrollTo(0, { immediate: true, force: true });
  }
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
  // astro:before-swap (not before-preparation) — Astro's swap reconciles
  // <html>'s attributes to match the incoming document, so anything set on
  // the *current* root here gets wiped a moment later. Setting it on
  // event.newDocument instead means it's already there once that document
  // becomes live, in time for the view-transition pseudo-elements to see it.
  document.addEventListener("astro:before-swap", (event) => {
    const e = event as unknown as { from: URL; to: URL; newDocument: Document };
    const fromTier = navTier(e.from.pathname);
    const toTier = navTier(e.to.pathname);
    const targetRoot = e.newDocument.documentElement;
    if (fromTier === -1 || toTier === -1 || fromTier === toTier) {
      delete targetRoot.dataset.navDirection;
    } else {
      targetRoot.dataset.navDirection = toTier > fromTier ? "forward" : "back";
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
  lenis?.resize();
  syncScrollPosition();
  ScrollTrigger.refresh();
}
