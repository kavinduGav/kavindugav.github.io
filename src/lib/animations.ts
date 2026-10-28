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

/** Fade/rise a group of elements in as they cross into view, staggered. */
export function revealOnScroll(
  targets: string | Element[] | NodeListOf<Element>,
  opts: { y?: number; stagger?: number; start?: string; scale?: number; ease?: string } = {},
) {
  const { y = 24, stagger = 0.08, start = "top 85%", scale, ease = "power2.out" } = opts;
  const els = typeof targets === "string" ? gsap.utils.toArray<Element>(targets) : Array.from(targets);
  if (!els.length) return;

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
        trigger: els[0] as Element,
        start,
        toggleActions: "play none none reverse",
      },
    },
  );
}

/** Each element pops in independently as it individually scrolls into view. */
export function popInEach(targets: string | NodeListOf<Element>, opts: { start?: string } = {}) {
  const els = typeof targets === "string" ? gsap.utils.toArray<Element>(targets) : Array.from(targets);
  els.forEach((el) => {
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
          trigger: el as Element,
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
