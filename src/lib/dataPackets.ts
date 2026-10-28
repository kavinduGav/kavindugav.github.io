// "Data packets": small glowing dots with comet trails travel along the
// background grid's lines, like requests moving through an API — the
// backend story, told without words. Adapted from a canvas reference
// (grid-snapped lines, recycling packets) rather than the earlier
// CSS-dot version, which only ran on a handful of fixed percentage tracks.

const GRID = 48;
const PACKET_COUNT = 18;
const TRAIL = 110;

interface Packet {
  dir: boolean; // true = travels horizontally, false = vertically
  line: number; // 0..1 fraction across the cross-axis, snapped to the grid when drawn
  t: number; // progress along the travel axis; can start negative (off-screen) before entering
  v: number; // progress per frame
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let packets: Packet[] = [];
let rafId: number | null = null;
let width = 0;
let height = 0;
let accentRgb = "120, 219, 160";
let onVisibilityChange: (() => void) | null = null;
let onResize: (() => void) | null = null;

function newPacket(): Packet {
  return {
    dir: Math.random() < 0.6,
    line: Math.random(),
    t: -Math.random() * 0.6,
    v: 0.0015 + Math.random() * 0.003,
  };
}

/** Lets the browser resolve --accent (an oklch() value) to rgb() for us, rather than hardcoding it. */
function resolveAccentColor() {
  const probe = document.createElement("span");
  probe.style.color = "var(--accent)";
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  document.body.appendChild(probe);
  const match = getComputedStyle(probe).color.match(/\d+/g);
  probe.remove();
  if (match && match.length >= 3) accentRgb = `${match[0]}, ${match[1]}, ${match[2]}`;
}

function resize() {
  if (!canvas || !ctx) return;
  const dpr = window.devicePixelRatio || 1;
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function render(advance: boolean) {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  for (const p of packets) {
    if (advance) {
      p.t += p.v;
      const travelLen = p.dir ? width : height;
      if (p.t * travelLen > travelLen + TRAIL + 10) Object.assign(p, newPacket());
    }

    const travelLen = p.dir ? width : height;
    const crossLen = p.dir ? height : width;
    const pos = p.t * travelLen;
    const lineAt = Math.round((p.line * crossLen) / GRID) * GRID + 0.5;

    const gradient = p.dir ? ctx.createLinearGradient(pos - TRAIL, 0, pos, 0) : ctx.createLinearGradient(0, pos - TRAIL, 0, pos);
    gradient.addColorStop(0, `rgba(${accentRgb}, 0)`);
    gradient.addColorStop(1, `rgba(${accentRgb}, 0.85)`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (p.dir) {
      ctx.moveTo(pos - TRAIL, lineAt);
      ctx.lineTo(pos, lineAt);
    } else {
      ctx.moveTo(lineAt, pos - TRAIL);
      ctx.lineTo(lineAt, pos);
    }
    ctx.stroke();

    ctx.fillStyle = `rgb(${accentRgb})`;
    ctx.beginPath();
    if (p.dir) ctx.arc(pos, lineAt, 2, 0, Math.PI * 2);
    else ctx.arc(lineAt, pos, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function loop() {
  render(true);
  rafId = requestAnimationFrame(loop);
}

function stopLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/** Tears down listeners and the RAF loop — call before the canvas is swapped out on navigation. */
export function stopDataPackets() {
  stopLoop();
  if (onResize) window.removeEventListener("resize", onResize);
  if (onVisibilityChange) document.removeEventListener("visibilitychange", onVisibilityChange);
  onResize = null;
  onVisibilityChange = null;
  canvas = null;
  ctx = null;
}

export function initDataPackets() {
  stopDataPackets();

  canvas = document.getElementById("packets-canvas") as HTMLCanvasElement | null;
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  if (!ctx) return;

  resolveAccentColor();
  packets = Array.from({ length: PACKET_COUNT }, newPacket);
  resize();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    render(false); // one static frame, no continuous motion
    return;
  }

  loop();

  onResize = () => resize();
  window.addEventListener("resize", onResize);

  onVisibilityChange = () => {
    if (document.hidden) stopLoop();
    else if (rafId === null) loop();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
}
