import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssPath = path.join(__dirname, '..', 'style.css');

const mobileCSS = `

/* ==========================================================================
   AI PASSPORT™ — COMPREHENSIVE MOBILE RESPONSIVE ENHANCEMENTS
   Optimized for 320px, 375px, 414px, 480px, 600px, 768px, 992px Viewports
   ========================================================================== */

/* 1. Global Touch & Overflow Safeguards */
html, body {
  max-width: 100vw !important;
  overflow-x: hidden !important;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
}

/* 2. Prevent iOS Auto-Zoom on Form Inputs */
@media (max-width: 768px) {
  input[type="text"],
  input[type="email"],
  input[type="number"],
  input[type="tel"],
  select,
  textarea {
    font-size: 16px !important;
  }
}

/* 3. Mobile Header & Navigation Drawer Overhaul */
@media (max-width: 1150px) {
  .global-nav .nav-container {
    padding: 10px 16px !important;
  }
  
  .nav-links {
    position: fixed !important;
    top: 60px !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: calc(100vh - 60px) !important;
    background: rgba(8, 9, 14, 0.98) !important;
    backdrop-filter: blur(24px) !important;
    -webkit-backdrop-filter: blur(24px) !important;
    padding: 24px 24px 40px !important;
    box-sizing: border-box !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    z-index: 9999 !important;
    display: none;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 16px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  }

  .nav-links.mobile-open {
    display: flex !important;
  }

  .nav-link {
    font-size: 1.05rem !important;
    padding: 14px 18px !important;
    border-radius: 10px !important;
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    color: rgba(255, 255, 255, 0.9) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .nav-link.active,
  .nav-link:hover {
    color: var(--color-gold) !important;
    border-color: rgba(223, 207, 173, 0.3) !important;
    background: rgba(223, 207, 173, 0.08) !important;
  }
}

/* 4. Verification Portal Mobile Enhancements */
@media (max-width: 900px) {
  .verify-5col-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 14px !important;
  }
}

@media (max-width: 600px) {
  .verify-5col-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  .verify-hero-card {
    padding: 22px 16px !important;
    margin-top: 20px !important;
    border-radius: 16px !important;
  }

  #verify-form {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 10px !important;
  }

  #verify-submit-btn {
    width: 100% !important;
    padding: 16px !important;
    font-size: 0.95rem !important;
    min-height: 48px !important;
  }

  .cert-actions-wrapper {
    flex-direction: column !important;
    width: 100% !important;
  }

  .cert-actions-wrapper .btn,
  .cert-actions-wrapper a,
  .cert-actions-wrapper button {
    width: 100% !important;
    box-sizing: border-box !important;
    justify-content: center !important;
    min-height: 46px !important;
    padding: 12px 16px !important;
  }

  #verify-status-banner {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 10px !important;
    padding: 16px 20px !important;
  }

  #verification-timestamp {
    align-self: flex-end !important;
  }
}

/* 5. General Hero & Button Touch Targets across Mobile */
@media (max-width: 768px) {
  .hero-section {
    padding-top: 100px !important;
    padding-bottom: 48px !important;
  }

  .hero-title {
    font-size: clamp(2rem, 8vw, 3rem) !important;
    line-height: 1.15 !important;
  }

  .btn-group {
    flex-direction: column !important;
    width: 100% !important;
    gap: 12px !important;
  }

  .btn-group .btn {
    width: 100% !important;
    justify-content: center !important;
    min-height: 48px !important;
  }

  .sample-id-btn {
    min-height: 38px !important;
    padding: 8px 14px !important;
    font-size: 0.78rem !important;
  }
}

/* 6. Institutional Footer Mobile Tuning */
@media (max-width: 992px) {
  .footer-5col-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 32px 24px !important;
  }
}

@media (max-width: 640px) {
  .footer-5col-grid {
    grid-template-columns: 1fr !important;
    gap: 28px !important;
  }

  .footer-newsletter-card {
    padding: 24px 18px !important;
    border-radius: 16px !important;
  }

  .fnc-form {
    flex-direction: column !important;
    width: 100% !important;
    gap: 12px !important;
  }

  .fnc-input,
  .fnc-btn {
    width: 100% !important;
    box-sizing: border-box !important;
    min-height: 48px !important;
  }

  .footer-bottom-bar {
    flex-direction: column !important;
    gap: 16px !important;
    text-align: center !important;
  }
}

@media (max-width: 360px) {
  .hero-title {
    font-size: 1.75rem !important;
  }

  .section-tag {
    font-size: 0.6rem !important;
  }

  .verify-hero-card {
    padding: 16px 12px !important;
  }
}
`;

fs.appendFileSync(cssPath, mobileCSS);
console.log('Successfully appended mobile responsive CSS to style.css');
