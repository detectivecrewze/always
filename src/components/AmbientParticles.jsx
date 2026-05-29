'use client';

import { useEffect, useRef, useCallback } from 'react';

const PARTICLE_COUNT = 35;
const DEFAULT_COLORS = ['#E2A9A3', '#8D5B5A', '#D4B8B9'];

export default function AmbientParticles({ active, themeColors }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  const createParticle = useCallback((canvas, forceTop = false, activeColors = DEFAULT_COLORS) => {
    return {
      x: Math.random() * canvas.width,
      y: forceTop ? -20 : Math.random() * canvas.height,
      size: 5 + Math.random() * 8, // slightly larger
      speedY: 0.5 + Math.random() * 1.5, // slightly faster fall
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleAmp: 1 + Math.random() * 2, // stronger sway
      flipSpeed: 0.02 + Math.random() * 0.04, // 3D flip speed
      flipOffset: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.5,
      color: activeColors[Math.floor(Math.random() * activeColors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const activeColors = themeColors?.filter(Boolean) || DEFAULT_COLORS;
    const colorsToUse = activeColors.length > 0 ? activeColors : DEFAULT_COLORS;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(canvas, false, colorsToUse)
    );

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      particlesRef.current.forEach((p) => {
        // Physics
        p.y += p.speedY;
        p.x += Math.sin(time * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp;
        p.rotation += p.rotationSpeed;
        
        // 3D Flip effect
        const scaleX = Math.cos(time * p.flipSpeed + p.flipOffset);

        if (p.y > canvas.height + 20) {
          Object.assign(p, createParticle(canvas, true, colorsToUse));
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(Math.abs(scaleX), 1); // Flip horizontally for 3D leaf effect
        ctx.globalAlpha = p.opacity;
        
        // Add subtle shadow for depth
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = p.color;

        // Draw more organic petal shape (pointed on one end, rounded on the other)
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.3, p.size * 0.8, p.size * 0.8, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.8, -p.size * 0.8, -p.size * 0.3, 0, -p.size);
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [active, createParticle]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
