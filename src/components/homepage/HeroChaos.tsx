"use client";

import { useRef, useEffect } from "react";

const ICON_SIZE = 52;
const BOX_W = 340;
const BOX_H = 300;
const REPULSION_RADIUS = 100;
const REPULSION_STRENGTH = 5;

interface IconDef {
  color: string;
  path: string;
}

const ICONS: IconDef[] = [
  {
    color: "#ffffff",
    path: "M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.233-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.186c-.094-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.454-.233 4.763 7.279v-6.44l-1.215-.14c-.094-.514.28-.886.747-.933z",
  },
  {
    color: "#f0f6ff",
    path: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
  },
  {
    color: "#e8b4fe",
    path: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.124 2.521a2.528 2.528 0 0 1 2.52-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.52V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zm-2.521 10.124a2.528 2.528 0 0 1 2.521 2.52A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.521-2.522v-2.52h2.521zm0-1.271a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z",
  },
  {
    color: "#007acc",
    path: "M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z",
  },
  {
    color: "#a1a1aa",
    path: "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z",
  },
  {
    color: "#e4e4e7",
    path: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM7.5 17l-1.41-1.41L8.67 13l-2.59-2.59L7.5 9l4 4-4 4z",
  },
  {
    color: "#3b82f6",
    path: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  },
  {
    color: "#f59e0b",
    path: "M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z",
  },
];

interface IconState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  scale: number;
  scaleDir: number;
}

// Pure: computes next physics state. No DOM reads/writes.
function stepIconState(
  s: IconState,
  mouse: { x: number; y: number },
  dt: number
): IconState {
  const { rotation: rot0, rotSpeed, scale: scale0, scaleDir: scaleDir0 } = s;
  let { x, y, vx, vy } = s;
  let rotation = rot0;
  let scale = scale0;
  let scaleDir = scaleDir0;

  x += vx * dt;
  y += vy * dt;

  if (x <= 0 || x >= BOX_W - ICON_SIZE) {
    vx *= -1;
    x = Math.max(0, Math.min(x, BOX_W - ICON_SIZE));
  }
  if (y <= 0 || y >= BOX_H - ICON_SIZE) {
    vy *= -1;
    y = Math.max(0, Math.min(y, BOX_H - ICON_SIZE));
  }

  const cx = x + ICON_SIZE / 2;
  const cy = y + ICON_SIZE / 2;
  const dx = cx - mouse.x;
  const dy = cy - mouse.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < REPULSION_RADIUS && dist > 0) {
    const force = ((REPULSION_RADIUS - dist) / REPULSION_RADIUS) * REPULSION_STRENGTH * 0.1;
    const angle = Math.atan2(dy, dx);
    vx += Math.cos(angle) * force;
    vy += Math.sin(angle) * force;
  }

  vx *= 0.99;
  vy *= 0.99;
  // Intentional jitter to prevent icons from stopping — non-determinism is by design
  if (Math.abs(vx) < 0.3) vx = (Math.random() - 0.5) * 1.5;
  if (Math.abs(vy) < 0.3) vy = (Math.random() - 0.5) * 1.5;

  rotation += rotSpeed * dt;
  scale += scaleDir * 0.0005 * dt;
  if (scale > 1.1) { scale = 1.1; scaleDir = -1; }
  if (scale < 0.9) { scale = 0.9; scaleDir = 1; }

  return { x, y, vx, vy, rotation, rotSpeed, scale, scaleDir };
}

export function HeroChaos() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef = useRef<IconState[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    stateRef.current = ICONS.map(() => ({
      x: Math.random() * (BOX_W - ICON_SIZE),
      y: Math.random() * (BOX_H - ICON_SIZE),
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1,
      scale: 1,
      scaleDir: Math.random() > 0.5 ? 1 : -1,
    }));

    // Sync initial positions
    stateRef.current.forEach((s, i) => {
      const el = elRefs.current[i];
      if (el) {
        el.style.left = `${s.x}px`;
        el.style.top = `${s.y}px`;
      }
    });

    let lastTime = performance.now();

    function animate(now: number) {
      const dt = (now - lastTime) / 16.67;
      lastTime = now;

      // Pure step → apply to DOM (impure shell)
      stateRef.current = stateRef.current.map((s, i) => {
        const next = stepIconState(s, mouseRef.current, dt);
        const el = elRefs.current[i];
        if (el) {
          el.style.left = `${next.x}px`;
          el.style.top = `${next.y}px`;
          el.style.transform = `rotate(${next.rotation}deg) scale(${next.scale})`;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        lastTime = performance.now();
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000 };
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Your knowledge today...</p>
      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative overflow-hidden rounded-xl border border-dashed border-border bg-card"
        style={{ width: BOX_W, height: BOX_H }}
      >
        {ICONS.map((icon, i) => (
          <div
            key={i}
            ref={(el) => { elRefs.current[i] = el; }}
            className="absolute flex items-center justify-center"
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ width: 32, height: 32, color: icon.color }}
            >
              <path d={icon.path} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
