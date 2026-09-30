import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cssPath = path.join(__dirname, '..', 'style.css');

const journeyCSS = `

/* ==========================================================================
   SECTION 3 — SIGNATURE CINEMATIC JOURNEY SCROLL ENGINE
   ========================================================================== */

.journey-cinematic-section {
  position: relative;
  background-color: #040508;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

@media (min-width: 768px) {
  .journey-cinematic-section {
    height: 240vh;
  }
}

.journey-pin-wrapper {
  width: 100%;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.journey-bg-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(223, 207, 173, 0.06) 0%, rgba(4, 5, 8, 0.95) 75%);
  pointer-events: none;
  transition: opacity 0.5s ease;
}

.journey-blueprint-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(88, 196, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(88, 196, 255, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.journey-light-field {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(88, 196, 255, 0.12) 0%, transparent 65%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.journey-inner-container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
}

.journey-header {
  text-align: center;
  margin-bottom: 24px;
  width: 100%;
  max-width: 780px;
}

.journey-eyebrow {
  color: var(--color-gold);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 10px;
}

.journey-main-headline {
  font-family: 'Playfair Display', 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 3.8vw, 3.2rem);
  color: #ffffff;
  line-height: 1.12;
  margin: 0 0 10px 0;
  letter-spacing: -0.01em;
}

.journey-subheadline {
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
  color: var(--color-text-secondary);
  margin: 0 0 16px 0;
}

.journey-progress-indicator {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(18, 19, 26, 0.85);
  border: 1px solid rgba(223, 207, 173, 0.2);
  padding: 6px 16px;
  border-radius: 20px;
}

.journey-stage-counter {
  font-family: 'Space Mono', monospace;
  font-size: 0.76rem;
  color: var(--color-gold);
  font-weight: 700;
  letter-spacing: 0.1em;
}

.journey-counter-bar {
  width: 80px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.journey-counter-fill {
  width: 20%;
  height: 100%;
  background: linear-gradient(90deg, #DFCFAD, #58c4ff);
  transition: width 0.3s ease;
}

.desktop-journey-canvas {
  position: relative;
  width: 100%;
  margin: 20px 0 0;
  display: block;
}

.journey-svg-line-container {
  width: 100%;
  height: 30px;
  overflow: visible;
  margin-bottom: -15px;
}

.journey-line-bg {
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 2;
  stroke-dasharray: 4 4;
}

.journey-line-progress {
  stroke: var(--color-gold);
  stroke-width: 3;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  transition: stroke-dashoffset 0.1s linear;
  filter: drop-shadow(0 0 6px rgba(223, 207, 173, 0.6));
}

.journey-stages-track {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  width: 100%;
  gap: 16px;
}

.journey-stage-card {
  flex: 1;
  background: rgba(14, 15, 22, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 24px 20px;
  box-sizing: border-box;
  text-align: left;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0.4;
  transform: scale(0.96);
  position: relative;
}

.journey-stage-card.active {
  opacity: 1;
  transform: scale(1.03);
  border-color: rgba(223, 207, 173, 0.45);
  background: rgba(18, 20, 30, 0.95);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(223, 207, 173, 0.1);
}

.journey-stage-card.completed {
  opacity: 0.75;
  transform: scale(1);
  border-color: rgba(0, 230, 118, 0.25);
}

.stamp-wrapper {
  position: relative;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.stamp-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.stamp-circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 2;
}

.stamp-circle-draw {
  fill: none;
  stroke: var(--color-gold);
  stroke-width: 2.5;
  stroke-dasharray: 230;
  stroke-dashoffset: 230;
  transition: stroke-dashoffset 0.4s ease;
}

.journey-stage-card.completed .stamp-circle-draw,
.journey-stage-card.active .stamp-circle-draw,
.mobile-stage-item.completed .stamp-circle-draw,
.mobile-stage-item.active .stamp-circle-draw {
  stroke-dashoffset: 0;
}

.stamp-check {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #00e676;
  color: #000;
  font-size: 0.65rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.journey-stage-card.completed .stamp-check,
.mobile-stage-item.completed .stamp-check {
  opacity: 1;
  transform: scale(1);
}

.stage-num {
  font-family: 'Space Mono', monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  position: relative;
  z-index: 2;
}

.stage-name-tag {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: var(--color-gold);
  font-weight: 700;
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 8px;
}

.stage-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: #ffffff;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.stage-body {
  font-size: 0.84rem;
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0;
}

.journey-final-payoff {
  margin-top: 32px;
  text-align: center;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.5s ease;
}

.journey-final-payoff.visible {
  opacity: 1;
  transform: translateY(0);
}

.payoff-badge {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: #00e676;
  letter-spacing: 0.18em;
  font-weight: 700;
  text-transform: uppercase;
  display: block;
  margin-bottom: 8px;
}

.payoff-text {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  color: var(--color-gold);
  margin: 0;
}

.mobile-journey-canvas {
  display: none;
  width: 100%;
}

@media (max-width: 767px) {
  .desktop-journey-canvas {
    display: none !important;
  }

  .mobile-journey-canvas {
    display: block !important;
    margin-top: 24px;
  }

  .journey-cinematic-section {
    height: auto !important;
    padding: 60px 0 !important;
  }

  .journey-pin-wrapper {
    position: relative !important;
    height: auto !important;
    top: auto !important;
  }

  .mobile-journey-track {
    position: relative;
    padding-left: 32px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 24px;
    text-align: left;
  }

  .mobile-journey-line-bg {
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 15px;
    width: 2px;
    background: rgba(255, 255, 255, 0.1);
  }

  .mobile-journey-line-progress {
    position: absolute;
    top: 20px;
    left: 15px;
    width: 2px;
    height: 0%;
    background: var(--color-gold);
    box-shadow: 0 0 8px var(--color-gold);
    transition: height 0.1s linear;
  }

  .mobile-stage-item {
    background: rgba(14, 15, 22, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 20px 16px;
    position: relative;
    opacity: 0.6;
    transition: all 0.3s ease;
  }

  .mobile-stage-item.active {
    opacity: 1;
    border-color: rgba(223, 207, 173, 0.4);
    background: rgba(18, 20, 30, 0.95);
    box-shadow: 0 8px 25px rgba(0,0,0,0.5);
  }

  .mobile-stage-item .stamp-wrapper {
    position: absolute;
    left: -48px;
    top: 16px;
    width: 34px;
    height: 34px;
  }

  .mobile-stage-item .stage-num {
    font-size: 0.75rem;
  }

  .mobile-stage-item .stage-title {
    font-size: 1.05rem;
  }

  .mobile-stage-item .stage-body {
    font-size: 0.82rem;
  }
}
`;

fs.appendFileSync(cssPath, journeyCSS);
console.log('Successfully appended Section 3 cinematic CSS to style.css');
