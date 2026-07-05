"use client";

import { useEffect, useRef } from "react";

/* ════════════════════════════════════════════════════════════
   BRAHMAND CANVAS — Mahabharat-style cosmic universe background
   Stars · Nebula clouds · Galaxy spiral · Cosmic rays · Om trail
════════════════════════════════════════════════════════════ */
export default function OmCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    let t = 0;
    let animId: number;

    // ── Stars ────────────────────────────────────────────────
    interface Star {
      x: number; y: number; r: number;
      twinkle: number; twinkleSpeed: number;
      color: string; z: number;
    }
    const STAR_COUNT = 420;
    const stars: Star[] = [];
    const starColors = [
      "255,255,255", "255,230,180", "200,210,255",
      "255,200,150", "180,220,255", "255,180,100",
    ];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.008,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        z: Math.random(),
      });
    }

    // ── Shooting stars ───────────────────────────────────────
    interface Shoot {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; alpha: number;
    }
    const shoots: Shoot[] = [];
    function spawnShoot() {
      shoots.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.5,
        vx: (Math.random() * 6 + 4) * (Math.random() < 0.5 ? 1 : -1),
        vy: Math.random() * 3 + 2,
        life: 1, maxLife: 1,
        alpha: 0.9,
      });
    }
    // Spawn 1 shoot every 3s
    const shootInterval = setInterval(spawnShoot, 3000);

    // ── Nebula clouds ────────────────────────────────────────
    interface Nebula {
      x: number; y: number; rx: number; ry: number;
      r: number; g: number; b: number;
      alpha: number; rot: number; rotSpeed: number; pulse: number;
    }
    const nebulas: Nebula[] = [
      // Deep purple nebula — top right
      { x: W * 0.75, y: H * 0.22, rx: W * 0.28, ry: H * 0.22, r: 130, g: 40, b: 200, alpha: 0.038, rot: 0.3, rotSpeed: 0.00015, pulse: 0 },
      // Saffron/orange nebula — left center
      { x: W * 0.18, y: H * 0.55, rx: W * 0.22, ry: H * 0.28, r: 230, g: 80, b: 10, alpha: 0.032, rot: -0.5, rotSpeed: 0.0002, pulse: 1.2 },
      // Blue nebula — bottom center
      { x: W * 0.5, y: H * 0.85, rx: W * 0.35, ry: H * 0.18, r: 40, g: 80, b: 220, alpha: 0.025, rot: 0.8, rotSpeed: 0.00012, pulse: 2.5 },
      // Gold nebula — center glow
      { x: W * 0.5, y: H * 0.5, rx: W * 0.2, ry: H * 0.2, r: 210, g: 150, b: 20, alpha: 0.018, rot: 0, rotSpeed: 0.0001, pulse: 0.6 },
      // Deep red — top left
      { x: W * 0.12, y: H * 0.15, rx: W * 0.18, ry: H * 0.2, r: 180, g: 20, b: 40, alpha: 0.022, rot: 1.2, rotSpeed: 0.00018, pulse: 3.5 },
    ];

    // ── Cosmic particles (dust) ──────────────────────────────
    interface Dust {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; hue: number; life: number;
    }
    const DUST = 80;
    const dust: Dust[] = [];
    for (let i = 0; i < DUST; i++) {
      dust.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        hue: Math.random() * 60 + 15,
        life: Math.random() * Math.PI * 2,
      });
    }

    // ── Galaxy spiral ────────────────────────────────────────
    function drawGalaxy(cx: number, cy: number, rot: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      const arms = 3;
      for (let arm = 0; arm < arms; arm++) {
        const armRot = (arm * Math.PI * 2) / arms;
        for (let i = 0; i < 120; i++) {
          const angle = (i / 120) * Math.PI * 4 + armRot;
          const radius = (i / 120) * 180;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          const alpha = (1 - i / 120) * 0.09;
          const size = (1 - i / 120) * 2 + 0.3;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,160,255,${alpha})`;
          ctx.fill();
        }
      }
      // Galaxy core glow
      const gcore = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
      gcore.addColorStop(0, "rgba(255,240,200,0.18)");
      gcore.addColorStop(0.4, "rgba(220,160,80,0.06)");
      gcore.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gcore;
      ctx.fillRect(-100, -100, 200, 200);
      ctx.restore();
    }

    // ── Divine rays (light beams) ────────────────────────────
    function drawDivineRays(cx: number, cy: number, time: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(cx, cy);
      const RAY_COUNT = 12;
      for (let i = 0; i < RAY_COUNT; i++) {
        const angle = (i / RAY_COUNT) * Math.PI * 2 + time * 0.04;
        const len = Math.min(W, H) * 0.65;
        const alpha = 0.018 + Math.sin(time * 0.5 + i) * 0.008;
        const grad = ctx.createLinearGradient(0, 0, Math.cos(angle) * len, Math.sin(angle) * len);
        grad.addColorStop(0, `rgba(255,200,80,${alpha * 3})`);
        grad.addColorStop(0.3, `rgba(230,100,20,${alpha})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle - 0.04) * len, Math.sin(angle - 0.04) * len);
        ctx.lineTo(Math.cos(angle + 0.04) * len, Math.sin(angle + 0.04) * len);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.restore();
    }

    // ── Om symbol ────────────────────────────────────────────
    function drawOM(x: number, y: number, size: number, alpha: number, rot: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.font = `${size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(255,200,80,1)`;
      ctx.shadowBlur = size * 0.5;
      ctx.shadowColor = "rgba(230,100,20,0.8)";
      ctx.fillText("ॐ", 0, 0);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ── Nebula draw helper ────────────────────────────────────
    function drawNebula(n: Nebula, time: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(n.rot + time * n.rotSpeed * 50);
      const pulse = 1 + Math.sin(time * 0.3 + n.pulse) * 0.08;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(n.rx, n.ry) * pulse);
      grad.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${n.alpha * 3})`);
      grad.addColorStop(0.35, `rgba(${n.r},${n.g},${n.b},${n.alpha * 1.5})`);
      grad.addColorStop(0.7, `rgba(${n.r},${n.g},${n.b},${n.alpha * 0.5})`);
      grad.addColorStop(1, `rgba(${n.r},${n.g},${n.b},0)`);
      ctx.scale(n.rx / Math.max(n.rx, n.ry), n.ry / Math.max(n.rx, n.ry));
      ctx.fillStyle = grad;
      ctx.fillRect(-Math.max(n.rx, n.ry) * pulse, -Math.max(n.rx, n.ry) * pulse,
        Math.max(n.rx, n.ry) * pulse * 2, Math.max(n.rx, n.ry) * pulse * 2);
      ctx.restore();
    }

    // ── Mouse Om trail ───────────────────────────────────────
    interface Trail { x: number; y: number; life: number; size: number; }
    const trail: Trail[] = [];
    const onMouseMove = (e: MouseEvent) => {
      if (Math.random() < 0.4) {
        trail.push({ x: e.clientX, y: e.clientY, life: 1, size: Math.random() * 14 + 8 });
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    // ══════════════ MAIN FRAME LOOP ══════════════════════════
    function frame() {
      if (!ctx) return;
      t += 0.006;

      // ── Deep space gradient background ──
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.5, Math.max(W, H));
      bg.addColorStop(0, "#07020f");
      bg.addColorStop(0.3, "#050108");
      bg.addColorStop(0.7, "#030005");
      bg.addColorStop(1, "#010002");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Nebula clouds ──
      nebulas.forEach(n => drawNebula(n, t));

      // ── Galaxy (top-right, subtle) ──
      drawGalaxy(W * 0.82, H * 0.18, t * 0.018);

      // ── Second smaller galaxy (bottom-left) ──
      ctx.globalAlpha = 0.55;
      drawGalaxy(W * 0.12, H * 0.78, -t * 0.012);
      ctx.globalAlpha = 1;

      // ── Divine rays from center ──
      drawDivineRays(W * 0.5, H * 0.5, t);

      // ── Stars ──
      stars.forEach(s => {
        s.twinkle += s.twinkleSpeed;
        const alpha = (0.35 + Math.sin(s.twinkle) * 0.35) * (0.4 + s.z * 0.6);
        const r = s.r * (0.7 + s.z * 0.5);
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${alpha})`;
        ctx.fill();

        // Star cross flare for bright stars
        if (s.r > 1.2 && alpha > 0.6) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.25;
          ctx.strokeStyle = `rgba(${s.color},1)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - r * 3, s.y); ctx.lineTo(s.x + r * 3, s.y);
          ctx.moveTo(s.x, s.y - r * 3); ctx.lineTo(s.x, s.y + r * 3);
          ctx.stroke();
          ctx.restore();
        }
      });

      // ── Shooting stars ──
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.015;
        if (s.life <= 0) { shoots.splice(i, 1); continue; }
        const tail = 60;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail / s.vx, s.y - s.vy * tail / s.vy);
        grad.addColorStop(0, `rgba(255,255,220,${s.life * 0.85})`);
        grad.addColorStop(0.4, `rgba(255,200,100,${s.life * 0.3})`);
        grad.addColorStop(1, "rgba(255,150,50,0)");
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 10, s.y - s.vy * 10);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── Cosmic dust ──
      dust.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        d.life += 0.02;
        if (d.x < 0) d.x = W;
        if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H;
        if (d.y > H) d.y = 0;
        const a = d.alpha * (0.5 + Math.sin(d.life) * 0.5);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue},80%,70%,${a})`;
        ctx.fill();
      });

      // ── Central Om ──
      const omSize = Math.min(W, H) * 0.32;
      const omAlpha = 0.05 + Math.sin(t * 0.4) * 0.02;
      drawOM(W * 0.5, H * 0.5 + omSize * 0.08, omSize, omAlpha, Math.sin(t * 0.03) * 0.06);

      // ── Mouse trail Om ──
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.life -= 0.03;
        if (p.life <= 0) { trail.splice(i, 1); continue; }
        ctx.save();
        ctx.font = `${p.size * p.life}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = p.life * 0.7;
        ctx.fillStyle = "rgba(255,200,80,1)";
        ctx.shadowBlur = p.size * 0.8;
        ctx.shadowColor = "rgba(230,100,20,0.9)";
        ctx.fillText("ॐ", p.x, p.y);
        ctx.restore();
      }

      animId = requestAnimationFrame(frame);
    }

    frame();

    // ── Resize ──
    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      nebulas[0].x = W * 0.75; nebulas[0].y = H * 0.22;
      nebulas[1].x = W * 0.18; nebulas[1].y = H * 0.55;
      nebulas[2].x = W * 0.5;  nebulas[2].y = H * 0.85;
      nebulas[3].x = W * 0.5;  nebulas[3].y = H * 0.5;
      nebulas[4].x = W * 0.12; nebulas[4].y = H * 0.15;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(shootInterval);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
