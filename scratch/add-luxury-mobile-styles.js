import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cssPath = path.join(__dirname, '..', 'style.css');

const luxuryMobileCSS = `

/* ==========================================================================
   AI PASSPORT™ — 10,000X LUXURY MOBILE OPTIMISATION STYLES
   ========================================================================== */

/* 1. Mobile Safe Area & Touch Foundations */
:root {
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-top: env(safe-area-inset-top, 0px);
}

/* 2. Text Wrap Balancing & Accessibility Focus States */
h1, h2, h3, .hero-title, .section-title {
  text-wrap: balance;
  text-wrap: pretty;
}

*:focus-visible {
  outline: 2px solid var(--color-gold) !important;
  outline-offset: 3px !important;
}

/* 3. Mobile Hero Recomposition & First Viewport Optimization */
@media (max-width: 768px) {
  .hero-section {
    padding-top: 84px !important;
    padding-bottom: 40px !important;
    min-height: auto !important;
  }

  .hero-text-block {
    max-width: 100% !important;
    text-align: center !important;
    align-items: center !important;
    display: flex !important;
    flex-direction: column !important;
  }

  .hero-title span {
    white-space: normal !important;
    word-break: normal !important;
    display: inline-block !important;
  }

  .hero-tagline {
    font-size: 1.05rem !important;
    line-height: 1.5 !important;
    margin-bottom: 20px !important;
  }

  .webinar-badge {
    padding: 14px 16px !important;
    margin-top: 16px !important;
    border-radius: 12px !important;
  }

  .hero-passport-card-wrapper {
    max-width: 320px !important;
    margin: 24px auto 0 !important;
  }
}

/* 4. Restrained Mobile Floating Sticky CTA Bar */
.mobile-sticky-cta-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 9990;
  padding: 12px 16px calc(12px + var(--safe-area-bottom));
  background: rgba(8, 9, 14, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(223, 207, 173, 0.25);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.8);
  transform: translateY(120%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
  opacity: 0;
  pointer-events: none;
  box-sizing: border-box;
}

.mobile-sticky-cta-bar.visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.mobile-sticky-cta-bar.dismissed {
  display: none !important;
}

.msticky-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.msticky-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.msticky-badge {
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  color: var(--color-gold);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.msticky-sub {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.msticky-btn {
  padding: 10px 18px !important;
  font-size: 0.78rem !important;
  font-weight: 700 !important;
  min-height: 42px !important;
  border-radius: 8px !important;
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
}

.msticky-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.4rem;
  line-height: 1;
  padding: 6px;
  cursor: pointer;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.msticky-close:hover {
  color: #ffffff;
}

/* 5. Mobile Horizontal Snap Swiper Cards */
@media (max-width: 768px) {
  .horizontal-mobile-swiper {
    display: flex !important;
    overflow-x: auto !important;
    scroll-snap-type: x mandatory !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 14px !important;
    padding-bottom: 16px !important;
  }

  .horizontal-mobile-swiper > * {
    flex: 0 0 85% !important;
    scroll-snap-align: start !important;
  }
}

/* 6. Motion Safety Safeguards */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .particle, .hero-passport-glow {
    display: none !important;
  }
}
`;

fs.appendFileSync(cssPath, luxuryMobileCSS);
console.log('Appended luxury mobile CSS styles successfully!');
