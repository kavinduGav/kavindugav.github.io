import { Howl } from "howler";

// Module-level state persists across Astro client-side page transitions
// (the body swaps, but this module and its Howl instances don't reload),
// which is what keeps the ambient loop playing seamlessly between pages.
let ambient: Howl | null = null;
let clickSound: Howl | null = null;
let enabled = false;
let initialized = false;

const AMBIENT_VOLUME = 0.35;
const FADE_MS = 500;

function getStoredPref(): boolean {
  try {
    return localStorage.getItem("sound") === "on";
  } catch {
    return false;
  }
}

function ensureHowls() {
  if (!ambient) {
    ambient = new Howl({
      src: ["/audio/ambient.webm", "/audio/ambient.mp3"],
      loop: true,
      volume: 0,
      html5: true,
      onloaderror: () => {
        // No ambient file added yet (see public/audio/README) — fail quietly.
      },
    });
  }
  if (!clickSound) {
    clickSound = new Howl({
      src: ["/audio/click.mp3"],
      volume: 0.35,
      onloaderror: () => {
        // No click file added yet — fail quietly.
      },
    });
  }
}

function fadeIn() {
  if (!ambient) return;
  if (!ambient.playing()) ambient.play();
  ambient.fade(ambient.volume(), AMBIENT_VOLUME, FADE_MS);
}

function fadeOutAndPause() {
  if (!ambient || !ambient.playing()) return;
  ambient.fade(ambient.volume(), 0, FADE_MS);
  window.setTimeout(() => ambient?.pause(), FADE_MS + 20);
}

export function setSoundEnabled(next: boolean) {
  enabled = next;
  if (enabled) fadeIn();
  else fadeOutAndPause();
}

export function playClick() {
  if (!enabled || !clickSound) return;
  clickSound.play();
}

export function initSound() {
  if (initialized) return;
  initialized = true;

  ensureHowls();
  enabled = getStoredPref();
  if (enabled) fadeIn();

  document.addEventListener("visibilitychange", () => {
    if (!ambient) return;
    if (document.hidden) ambient.pause();
    else if (enabled) fadeIn();
  });

  // Subtle click feedback on interactive elements, site-wide.
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a, button")) playClick();
  });
}
