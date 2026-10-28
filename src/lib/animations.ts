import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

let registered = false;

export function ensureGsapRegistered() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, ScrambleTextPlugin);
  registered = true;
}

/** Desktop-with-mouse only — magnetic pull and scramble-on-hover don't make sense on touch. */
export function hasHoverPointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Splits a heading into lines and rises them into place on load. Astro
 * dispatches `astro:page-load` on the *initial* load too, so a page's init
 * function can run more than once for the same DOM — this guard keeps a
 * second call from re-splitting (and re-animating) an already-split heading.
 */
export function revealHeroHeading(heading: HTMLElement | null | undefined) {
  if (!heading || heading.dataset.splitBound) return;
  heading.dataset.splitBound = "true";

  const split = SplitText.create(heading, { type: "lines", linesClass: "line" });
  gsap.fromTo(
    split.lines,
    { yPercent: 115, autoAlpha: 0 },
    { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: 0.1 },
  );
}

/** Fade/rise a group of elements in as they cross into view, staggered. */
export function revealOnScroll(
  targets: string | Element[] | NodeListOf<Element>,
  opts: { y?: number; stagger?: number; start?: string; scale?: number; ease?: string } = {},
) {
  const { y = 24, stagger = 0.08, start = "top 85%", scale, ease = "power2.out" } = opts;
  const all = (typeof targets === "string" ? gsap.utils.toArray<HTMLElement>(targets) : Array.from(targets)) as HTMLElement[];
  const els = all.filter((el) => !el.dataset.revealBound);
  if (!els.length) return;
  els.forEach((el) => {
    el.dataset.revealBound = "true";
  });

  gsap.fromTo(
    els,
    { autoAlpha: 0, y, ...(scale ? { scale } : {}) },
    {
      autoAlpha: 1,
      y: 0,
      ...(scale ? { scale: 1 } : {}),
      duration: 0.6,
      ease,
      stagger,
      scrollTrigger: {
        trigger: els[0],
        start,
        toggleActions: "play none none reverse",
      },
    },
  );
}

/** Each element pops in independently as it individually scrolls into view. */
export function popInEach(targets: string | NodeListOf<Element>, opts: { start?: string } = {}) {
  const all = (typeof targets === "string" ? gsap.utils.toArray<HTMLElement>(targets) : Array.from(targets)) as HTMLElement[];
  const els = all.filter((el) => !el.dataset.popBound);

  els.forEach((el) => {
    el.dataset.popBound = "true";
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 32, scale: 0.94 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: "back.out(1.6)",
        scrollTrigger: {
          trigger: el,
          start: opts.start ?? "top 88%",
          toggleActions: "play none none reverse",
        },
      },
    );
  });
}

/**
 * Draws a row's divider line left-to-right, then fades its content in —
 * for rows with a ".row-divider" line element and ".row-content" pieces.
 */
export function animateDividerRows(targets: string | NodeListOf<Element>, opts: { start?: string } = {}) {
  const all = (typeof targets === "string" ? gsap.utils.toArray<HTMLElement>(targets) : Array.from(targets)) as HTMLElement[];
  const rows = all.filter((el) => !el.dataset.dividerBound);

  rows.forEach((row) => {
    row.dataset.dividerBound = "true";
    const divider = row.querySelector<HTMLElement>(".row-divider");
    const content = row.querySelectorAll<HTMLElement>(".row-content");
    const tl = gsap.timeline({
      scrollTrigger: { trigger: row, start: opts.start ?? "top 90%", toggleActions: "play none none reverse" },
    });
    if (divider) tl.fromTo(divider, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" });
    if (content.length) {
      tl.fromTo(
        content,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" },
        divider ? "-=0.15" : 0,
      );
    }
  });
}

export function cleanupScrollTriggers() {
  ScrollTrigger.getAll().forEach((st) => st.kill());
}

/** Counts a stat tile's number up from 0 when it scrolls into view. Reads data-count-to/-suffix set by StatTile.astro. */
export function animateCounters(targets: string | NodeListOf<Element>, opts: { start?: string } = {}) {
  const all = (typeof targets === "string" ? gsap.utils.toArray<HTMLElement>(targets) : Array.from(targets)) as HTMLElement[];
  const els = all.filter((el) => !el.dataset.countBound && el.dataset.countTo !== undefined);

  els.forEach((el) => {
    el.dataset.countBound = "true";
    const target = Number(el.dataset.countTo);
    if (!Number.isFinite(target)) return;
    const suffix = el.dataset.countSuffix ?? "";
    const counter = { val: 0 };
    gsap.to(counter, {
      val: target,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: opts.start ?? "top 88%", toggleActions: "play none none none" },
      onUpdate: () => {
        el.textContent = Math.round(counter.val).toLocaleString("en-US") + suffix;
      },
    });
  });
}

/** Subtly pulls an element toward the cursor on hover, springing back on leave. Desktop pointer only. */
export function initMagnetic(targets: string | NodeListOf<Element>, strength = 0.3) {
  if (!hasHoverPointer() || prefersReducedMotion()) return;
  const all = (typeof targets === "string" ? gsap.utils.toArray<HTMLElement>(targets) : Array.from(targets)) as HTMLElement[];
  const els = all.filter((el) => !el.dataset.magnetBound);

  els.forEach((el) => {
    el.dataset.magnetBound = "true";
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * strength);
      yTo((event.clientY - rect.top - rect.height / 2) * strength);
    });
    el.addEventListener("mouseleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}

/** Scrambles an element's own text through random characters back to itself on hover. Desktop pointer only. */
export function initScrambleOnHover(targets: string | NodeListOf<Element>) {
  if (!hasHoverPointer()) return;
  const all = (typeof targets === "string" ? gsap.utils.toArray<HTMLElement>(targets) : Array.from(targets)) as HTMLElement[];
  const els = all.filter((el) => !el.dataset.scrambleBound);

  els.forEach((el) => {
    el.dataset.scrambleBound = "true";
    const original = el.textContent ?? "";
    el.addEventListener("mouseenter", () => {
      gsap.to(el, {
        duration: 0.5,
        scrambleText: { text: original, chars: "upperAndLowerCase", speed: 0.45 },
        overwrite: true,
      });
    });
  });
}

/**
 * Runs a DOM mutation (filter toggling visibility, class changes, etc.) and
 * animates the before/after layout delta with GSAP Flip, so cards glide to
 * their new positions and fade in/out instead of just appearing/disappearing.
 */
export function animateLayoutChange(container: HTMLElement, mutate: () => void) {
  if (prefersReducedMotion()) {
    mutate();
    return;
  }

  const items = Array.from(container.children) as HTMLElement[];
  const state = Flip.getState(items, { props: "opacity" });
  mutate();
  Flip.from(state, {
    duration: 0.5,
    ease: "power2.inOut",
    absolute: true,
    onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.04 }),
    onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.3 }),
  });
}

export { gsap, ScrollTrigger, SplitText, Flip };
