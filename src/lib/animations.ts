import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

export function ensureGsapRegistered() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
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

export function cleanupScrollTriggers() {
  ScrollTrigger.getAll().forEach((st) => st.kill());
}

export { gsap, ScrollTrigger, SplitText };
