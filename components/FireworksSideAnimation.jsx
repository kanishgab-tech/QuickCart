"use client";

import { useEffect, useRef } from "react";
import "./FireworksSideAnimation.css";

function createFireworks(canvas, side) {
  const ctx = canvas.getContext("2d");

  if (!ctx) return () => {};

  let width = 0;
  let height = 0;
  let animationId;
  let lastTime = 0;
  let elapsed = 0;
  let launchTimer = 0;
  let ambientTimer = 0;

  const particles = [];
  const rockets = [];
  const ambient = [];

  const random = (min, max) => Math.random() * (max - min) + min;

  const palette =
    side === "left"
      ? ["#FFD700", "#1e7c8f", "#580606", "#FF8C00"]
      : ["#36cb09", "#FF1744", "#FFD700", "#a80909"];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function launchRocket() {
    const startX = random(width * 0.3, width * 1.0);

    rockets.push({
      x: startX,
      y: height + 10,
      targetY: random(height * 0.16, height * 0.58),
      vx: random(-0.45, 0.45),
      /*vy: random(-5.0, -7.4),*/
      vy: random(-3.0, -4.5),
      color: palette[Math.floor(random(0, palette.length))],
      trail: [],
      size: random(1.5, 2.5),
    });
  }

  function createBurst(x, y, color, power = 1) {
    const count = Math.round(random(56, 96) * power);
    const baseAngle = random(0, Math.PI * 2);
    const isGold = color === "#FFD700";

    for (let i = 0; i < count; i++) {
      const angle =
        baseAngle +
        (i / count) * Math.PI * 2 +
        random(-0.045, 0.045);

      const speed = random(0.8, 3.5) * power;
      const particleColor =
        Math.random() > 0.62
          ? color
          : isGold
            ? "#FFF0A6"
            : palette[Math.floor(random(0, palette.length))];

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: random(0.018, 0.045),
        friction: random(0.982, 0.992),
        life: random(55, 110),
        maxLife: 110,
        size: random(0.8, 2.2),
        color: particleColor,
        twinkle: Math.random() > 0.65,
      });
    }

    // Bright central flash
    particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      gravity: 0,
      friction: 0.9,
      life: 7,
      maxLife: 7,
      size: 15,
      color,
      flash: true,
    });
  }

  function createAmbientParticle() {
    ambient.push({
      x: random(0, width),
      y: random(0, height),
      size: random(0.5, 1.5),
      alpha: random(0.15, 0.7),
      phase: random(0, Math.PI * 2),
      speed: random(0.3, 1.2),
      color: palette[Math.floor(random(0, palette.length))],
    });
  }

  function drawGlow(x, y, radius, color, alpha = 1) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "transparent");

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function updateRocket(rocket) {
    rocket.trail.push({ x: rocket.x, y: rocket.y });

    if (rocket.trail.length > 40) {
      rocket.trail.shift();
    }

    rocket.x += rocket.vx;
    rocket.y += rocket.vy;

    //rocket.vy += 0.025;
    rocket.vy += 0.008;
    // Glowing rocket tail
    for (let i = 0; i < rocket.trail.length; i++) {
      const point = rocket.trail[i];
      const progress = i / rocket.trail.length;

      ctx.globalAlpha = progress * 0.7;
      ctx.fillStyle = rocket.color;
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y,
        rocket.size * progress,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.globalAlpha = 1;

   // drawGlow(rocket.x, rocket.y, 12, rocket.color, 0.65);

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(rocket.x, rocket.y, rocket.size, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawParticle(particle) {
    const lifeRatio = Math.max(
      0,
      Math.min(1, particle.life / particle.maxLife)
    );

    if (particle.flash) {
     /* drawGlow(
        particle.x,
        particle.y,
        particle.size * 2,
        particle.color,
        lifeRatio * 0.8
      );*/
      return;
    }

    const flicker = particle.twinkle
      ? random(0.55, 1)
      : 1;

    ctx.globalAlpha = lifeRatio * flicker;
    ctx.fillStyle = particle.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = particle.color;

    ctx.beginPath();
    ctx.arc(
      particle.x,
      particle.y,
      Math.max(0.2, particle.size * lifeRatio),
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  function drawFountain(time) {
    const baseX = width / 2;
    const baseY = height - 8;

    // Gentle golden glow at the base
    //drawGlow(baseX, baseY, 35, "rgb(217, 171, 19)", 0.12);
    drawTwinklingStar(baseX, baseY - 5, time, 10);
    // Rising fountain sparks
    for (let i = 0; i < 3; i++) {
      const wave = (time * 0.045 + i * 2.1) % 6.2;

      const x =
            baseX +
            Math.sin(wave * 1.5) * (15 + wave * 6);

      const y = baseY - wave * 17;

      if (wave < 5.4) {
        ctx.globalAlpha = 0.75 * (1 - wave / 6.2);
        ctx.fillStyle = i % 2 ? "#FFF1A8" : "#FFB52E";

        ctx.beginPath();
        ctx.arc(x, y, random(0.6, 1.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    // Floating ambient lights
    for (const star of ambient) {
      const alpha =
        star.alpha *
        (0.45 + 0.55 * Math.sin(time * 0.001 * star.speed + star.phase));

      drawGlow(star.x, star.y, star.size * 5, star.color, alpha * 0.9);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Firework fountain near the bottom
    if (side === "right") {
      drawFountain(time);
    }

    // Rockets rise and burst
    for (let i = rockets.length - 1; i >= 0; i--) {
      const rocket = rockets[i];

      updateRocket(rocket);

      if (rocket.y <= rocket.targetY || rocket.vy >= 0) {
        createBurst(
          rocket.x,
          rocket.y,
          rocket.color,
          random(0.8, 1.1)
        );

        rockets.splice(i, 1);
      }
    }

    // Update explosion particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];

      particle.x += particle.vx;
      particle.y += particle.vy;

      particle.vx *= particle.friction;
      particle.vy = particle.vy * particle.friction + particle.gravity;
      particle.life--;

      drawParticle(particle);

      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }

    ctx.globalAlpha = 1;
  }

  function drawTwinklingStar(x, y, time, size = 8) {
  // Smoothly brighten and dim the star
  const twinkle = 0.5 + 0.5 * Math.sin(time * 0.005);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(time * 0.0004);

  // Soft outer glow
  drawGlow(0, 0, size * 3, "#FFD700", twinkle * 0.45);

  // Draw a four-point star
  ctx.globalAlpha = 0.4 + twinkle * 0.6;
  ctx.fillStyle = "#FFF1A8";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#FFD700";

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.12, -size * 0.12, size, 0);
  ctx.quadraticCurveTo(size * 0.12, size * 0.12, 0, size);
  ctx.quadraticCurveTo(-size * 0.12, size * 0.12, -size, 0);
  ctx.quadraticCurveTo(-size * 0.12, -size * 0.12, 0, -size);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

  function animate(timestamp) {
    animationId = requestAnimationFrame(animate);

    const delta = lastTime
      ? Math.min(timestamp - lastTime, 40)
      : 16;

    lastTime = timestamp;
    elapsed += delta;
    launchTimer += delta;
    ambientTimer += delta;

    if (ambient.length < 30 && ambientTimer > 250) {
      createAmbientParticle();
      ambientTimer = 0;
    }

    // Stagger rocket launches
    //if (launchTimer > random(1800, 3300)) {
    if (launchTimer > random(3000, 5000)) {
      if (particles.length < 550 && rockets.length < 2) {
        launchRocket();
      }

      launchTimer = 0;
    }

    // Keep total particle count under control
    if (particles.length > 750) {
      particles.splice(0, particles.length - 750);
    }

    draw(elapsed);
  }

  resize();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  animationId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationId);
    resizeObserver.disconnect();
  };
}



export default function FireworksSideAnimation() {
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);

  useEffect(() => {
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;

    if (!leftCanvas || !rightCanvas) return;

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const screenQuery = window.matchMedia("(min-width: 1280px)");

    let cleanups = [];

    function start() {
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];

      const leftCtx = leftCanvas.getContext("2d");
      const rightCtx = rightCanvas.getContext("2d");

      leftCtx?.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
      rightCtx?.clearRect(0, 0, rightCanvas.width, rightCanvas.height);

      if (mediaQuery.matches || !screenQuery.matches) return;

      cleanups = [
        createFireworks(leftCanvas, "left"),
        createFireworks(rightCanvas, "right"),
      ];
    }

    start();

    mediaQuery.addEventListener("change", start);
    screenQuery.addEventListener("change", start);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      mediaQuery.removeEventListener("change", start);
      screenQuery.removeEventListener("change", start);
    };
  }, []);

  return (
    <div className="fireworks-overlay" aria-hidden="true">
      <canvas
        ref={leftCanvasRef}
        className="fireworks-canvas fireworks-left"
      />

      <canvas
        ref={rightCanvasRef}
        className="fireworks-canvas fireworks-right"
      />
    </div>
  );
}
