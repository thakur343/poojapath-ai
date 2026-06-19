"use client";

import { useEffect, useRef } from "react";

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

    interface OmParticle {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      life: number;
      decay: number;
      hue: number;
    }

    let t = 0;
    const particles: OmParticle[] = [];
    const N = 120;
    let animationFrameId: number;

    // Particle system init
    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.5 + 0.2),
        life: Math.random(),
        decay: Math.random() * 0.004 + 0.001,
        hue: Math.random() < 0.6 ? 22 : 38,
      });
    }

    function drawOM(x: number, y: number, size: number, alpha: number, rotation: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.font = `${size}px var(--font-tiro), serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(232, 96, 10, ${alpha})`;
      ctx.shadowBlur = size * 0.4;
      ctx.shadowColor = `rgba(232, 96, 10, ${alpha * 1.5})`;
      ctx.fillText("ॐ", 0, 0);
      ctx.restore();
    }

    function drawRing(x: number, y: number, r: number, alpha: number, dashes: boolean) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.setLineDash(dashes ? [12, 18] : []);
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232, 96, 10, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawDot(x: number, y: number, r: number, alpha: number) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242, 201, 110, ${alpha})`;
      ctx.fill();
    }

    function frame() {
      if (!ctx) return;
      t += 0.004;
      ctx.clearRect(0, 0, W, H);

      // Dark base gradient
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
      bg.addColorStop(0, "rgba(14, 6, 2, 1)");
      bg.addColorStop(0.5, "rgba(10, 4, 1, 1)");
      bg.addColorStop(1, "rgba(6, 3, 1, 1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;

      // Outermost glow halo
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 320);
      glow.addColorStop(0, `rgba(232, 96, 10, ${0.045 + Math.sin(t * 0.6) * 0.015})`);
      glow.addColorStop(0.5, `rgba(201, 146, 43, ${0.02 + Math.sin(t * 0.4) * 0.008})`);
      glow.addColorStop(1, "rgba(232, 96, 10, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Rotating outer rings
      for (let ring = 0; ring < 4; ring++) {
        const rr = 180 + ring * 55 + Math.sin(t * 0.3 + ring) * 0.8;
        const ra = 0.04 - ring * 0.008 + Math.sin(t * 0.5 + ring) * 0.006;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * (0.04 + ring * 0.01) * (-1 + (ring % 2) * 2));
        drawRing(0, 0, rr, Math.max(0, ra), ring % 2 === 1);
        ctx.restore();
      }

      // Petal-dots on rings
      for (let p = 0; p < 8; p++) {
        const ang = t * 0.08 + (p * Math.PI) / 4;
        const dr = 185 + Math.sin(t * 0.4) * 0.5;
        drawDot(cx + Math.cos(ang) * dr, cy + Math.sin(ang) * dr, 2, 0.15 + Math.sin(t * 0.8 + p) * 0.08);
      }

      // Main giant OM — slowly rotating, pulsing
      const omSize = Math.min(W, H) * 0.38;
      const omAlpha = 0.055 + Math.sin(t * 0.5) * 0.018;
      drawOM(cx, cy + omSize * 0.08, omSize, omAlpha, Math.sin(t * 0.04) * 0.06);

      // Medium OM — slightly offset, counter-rotate
      const omSz2 = omSize * 0.45;
      const omA2 = 0.025 + Math.sin(t * 0.35) * 0.01;
      drawOM(cx + Math.sin(t * 0.12) * 18, cy + Math.cos(t * 0.1) * 12 + omSz2 * 0.06, omSz2, omA2, Math.sin(t * 0.06) * -0.08);

      // Small OM echoes (4 corners, subtle)
      const smSz = omSize * 0.18;
      const corners = [
        [-W * 0.3, -H * 0.25],
        [W * 0.3, -H * 0.25],
        [-W * 0.3, H * 0.25],
        [W * 0.3, H * 0.25],
      ];
      corners.forEach(([ox, oy], i) => {
        drawOM(cx + ox, cy + oy, smSz, 0.018 + Math.sin(t * 0.4 + i) * 0.008, t * 0.02 * (i % 2 ? 1 : -1));
      });

      // Inner sacred geometry lines (star pattern)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.025);
      ctx.globalAlpha = 0.04 + Math.sin(t * 0.6) * 0.01;
      ctx.strokeStyle = "rgba(232, 96, 10, 1)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const r2 = 160;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.lineTo(Math.cos(a + Math.PI) * r2, Math.sin(a + Math.PI) * r2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // Particles (floating embers)
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(t * 0.5 + p.y * 0.01) * 0.2;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0 || p.y < -10) {
          p.x = Math.random() * W;
          p.y = H + 10;
          p.life = Math.random() * 0.7 + 0.3;
          p.decay = Math.random() * 0.004 + 0.001;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = -(Math.random() * 0.5 + 0.15);
        }
        const a = p.life * (0.35 + Math.sin(t + p.x) * 0.08);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 22 ? `rgba(232, 96, 10, ${a})` : `rgba(242, 201, 110, ${a * 0.7})`;
        ctx.fill();
      });

      // Mouse move particles (streak and ohm trail)
      for (let i = mouseParticles.length - 1; i >= 0; i--) {
        const p = mouseParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          mouseParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.font = `${p.size * p.life}px var(--font-tiro), serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `${p.color}${p.life * 0.75})`;
        if (p.char === "ॐ") {
          ctx.shadowBlur = p.size * 0.6 * p.life;
          ctx.shadowColor = "rgba(232, 96, 10, 0.75)";
        }
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      }

      // Draw glowing connecting line (streak system)
      if (mouseParticles.length > 1) {
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(242, 201, 110, 0.15)";
        for (let i = 0; i < mouseParticles.length; i++) {
          const p = mouseParticles[i];
          if (i === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            const prev = mouseParticles[i - 1];
            const dist = Math.hypot(p.x - prev.x, p.y - prev.y);
            if (dist < 60) {
              ctx.lineTo(p.x, p.y);
            } else {
              ctx.moveTo(p.x, p.y);
            }
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(frame);
    }

    interface MouseParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      decay: number;
      size: number;
      char: string;
      color: string;
    }

    const mouseParticles: MouseParticle[] = [];
    const handleMouseMove = (e: MouseEvent) => {
      for (let i = 0; i < 2; i++) {
        mouseParticles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          life: 1.0,
          decay: Math.random() * 0.03 + 0.015,
          size: Math.random() * 12 + 10,
          char: "ॐ",
          color: Math.random() < 0.6 ? "rgba(232, 96, 10, " : "rgba(242, 201, 110, ",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    frame();

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      if (canvas) {
        canvas.width = W;
        canvas.height = H;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-10] pointer-events-none opacity-100"
    />
  );
}
