/* ==========================================================================
   AI PASSPORT™ — CENTRAL ANALYTICS & CONVERSION ENGINE
   Google Analytics 4 | Event Tracking | Attribution | Privacy | Performance
   ========================================================================== */

// --- CONFIGURATION ---
const STORAGE_KEY_ATTRIBUTION = 'aipass_attribution';
const STORAGE_KEY_DEBUG = 'debug_analytics';

let isInitialized = false;
let activeMeasurementId = null;
const trackedSections = new Set();
const trackedStages = new Set();
const trackedFormsStarted = new Set();
const trackedFormsViewed = new Set();
const trackedScrollDepths = new Set();

const DEFAULT_MEASUREMENT_ID = 'G-QQV0VX8N47';

/**
 * Get current GA4 Measurement ID from environment, window config, or default fallback
 */
export function getMeasurementId() {
  if (activeMeasurementId) return activeMeasurementId;
  
  // 1. Vite Env Var
  let id = import.meta.env?.VITE_GA_MEASUREMENT_ID;
  
  // 2. Global Window Overrides
  if (!id && typeof window !== 'undefined') {
    id = window.VITE_GA_MEASUREMENT_ID || window.GA_MEASUREMENT_ID;
  }
  
  // 3. Production Default Fallback
  if (!id) {
    id = DEFAULT_MEASUREMENT_ID;
  }
  
  return (id && typeof id === 'string' && id.trim().startsWith('G-')) ? id.trim() : DEFAULT_MEASUREMENT_ID;
}

/**
 * Check if analytics debug mode is active
 */
export function isDebugMode() {
  if (typeof window === 'undefined') return false;
  try {
    const isDev = import.meta.env?.DEV === true;
    const urlDebug = window.location?.search?.includes('debug_analytics=true');
    const storageDebug = window.localStorage?.getItem(STORAGE_KEY_DEBUG) === 'true';
    return isDev || urlDebug || storageDebug;
  } catch (e) {
    return false;
  }
}

/**
 * PII Sanitizer: Ensures no sensitive user data is ever passed to GA4.
 */
function sanitizeParams(params = {}) {
  if (!params || typeof params !== 'object') return {};
  
  const piiKeys = ['name', 'fullname', 'full_name', 'email', 'mobile', 'phone', 'telephone', 'address', 'password', 'user_input'];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
  
  const clean = {};
  
  for (const [key, value] of Object.entries(params)) {
    const keyLower = key.toLowerCase();
    
    // Drop PII keys
    if (piiKeys.some(k => keyLower.includes(k))) {
      continue;
    }
    
    // Check string values for PII formats
    if (typeof value === 'string') {
      if (emailRegex.test(value) || phoneRegex.test(value)) {
        continue;
      }
      clean[key] = value.substring(0, 250); // limit string length
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value;
    } else if (value !== null && value !== undefined) {
      clean[key] = String(value).substring(0, 100);
    }
  }
  
  return clean;
}

/**
 * Capture & Persist Attribution Parameters (UTM, gclid, fbclid, Referrer)
 */
export function captureAttribution() {
  if (typeof window === 'undefined') return {};
  
  try {
    const urlParams = new URLSearchParams(window.location.search || '');
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
    let hasNewAttr = false;
    const currentAttr = {};
    
    utmKeys.forEach(key => {
      const val = urlParams.get(key);
      if (val) {
        currentAttr[key] = val;
        hasNewAttr = true;
      }
    });
    
    // Traffic source classification from referrer
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    if (referrer && window.location?.hostname && !referrer.includes(window.location.hostname)) {
      currentAttr.referrer = referrer.substring(0, 200);
      if (!currentAttr.utm_source) {
        if (referrer.includes('google.')) currentAttr.traffic_source = 'google';
        else if (referrer.includes('facebook.') || referrer.includes('fb.')) currentAttr.traffic_source = 'facebook';
        else if (referrer.includes('instagram.')) currentAttr.traffic_source = 'instagram';
        else if (referrer.includes('linkedin.')) currentAttr.traffic_source = 'linkedin';
        else if (referrer.includes('youtube.')) currentAttr.traffic_source = 'youtube';
        else if (referrer.includes('t.co') || referrer.includes('twitter.')) currentAttr.traffic_source = 'twitter';
        else if (referrer.includes('whatsapp.')) currentAttr.traffic_source = 'whatsapp';
        else currentAttr.traffic_source = 'referral';
      }
    } else if (!referrer && !currentAttr.utm_source) {
      currentAttr.traffic_source = 'direct';
    }
    
    // Read cached attribution if no new UTMs are present
    let cachedStr = null;
    try {
      cachedStr = window.sessionStorage?.getItem(STORAGE_KEY_ATTRIBUTION);
    } catch (e) {}
    
    let finalAttr = {};
    if (cachedStr) {
      try {
        finalAttr = JSON.parse(cachedStr);
      } catch (e) {}
    }
    
    if (hasNewAttr || !cachedStr) {
      finalAttr = { ...finalAttr, ...currentAttr, captured_at: new Date().toISOString() };
      try {
        window.sessionStorage?.setItem(STORAGE_KEY_ATTRIBUTION, JSON.stringify(finalAttr));
      } catch (e) {}
    }
    
    return finalAttr;
  } catch (err) {
    return {};
  }
}

/**
 * Core GA4 Script Injection & DataLayer Setup
 */
export function initAnalytics(customId = null) {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;
  
  const id = customId || getMeasurementId();
  activeMeasurementId = id;
  
  // Always capture attribution on init
  const attribution = captureAttribution();
  
  // Safe dataLayer setup
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
  }
  
  if (id) {
    // Inject GA4 script tag asynchronously if not present
    const scriptId = 'ga4-gtag-script';
    if (typeof document !== 'undefined' && document.head && !document.getElementById(scriptId) && !window.__ga4_script_injected) {
      window.__ga4_script_injected = true;
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);
    }
    
    // Configure GA4 safely once with debug_mode enabled for instant Realtime & DebugView reporting
    if (!window.__ga4_configured) {
      window.__ga4_configured = true;
      window.gtag('js', new Date());
      window.gtag('config', id, {
        debug_mode: true,
        cookie_flags: 'SameSite=None;Secure',
        ...attribution
      });
    }
    
    if (isDebugMode()) {
      console.log(`%c[AI Passport Analytics]%c GA4 Initialized with ID: ${id}`, 'color: #00a2ff; font-weight: bold;', 'color: #aaa;');
    }
  } else {
    if (isDebugMode()) {
      console.warn(`%c[AI Passport Analytics]%c Running in Safe Local Debug Mode (No Measurement ID set yet). Set VITE_GA_MEASUREMENT_ID in .env to transmit to GA4.`, 'color: #e74c3c; font-weight: bold;', 'color: #ccc;');
    }
  }
  
  isInitialized = true;
  
  // Attach window global reference for non-module scripts
  window.AIPassportAnalytics = {
    trackEvent,
    trackPageView,
    trackCTA,
    trackFormStart,
    trackFormSubmit,
    trackFormError,
    trackConversion,
    trackExternalClick,
    trackJourneyInteraction,
    trackSectionView
  };
  
  // Check if initial pageview was already fired by standard GA4 <head> tag
  if (typeof window !== 'undefined') {
    if (!window.__ga4_initial_pageview_tracked) {
      window.__ga4_initial_pageview_tracked = true;
      // If gtag script was dynamically injected by analytics.js (no <head> tag present), fire initial pageview once
      if (window.__ga4_script_injected) {
        trackPageView();
      }
    }
  }
  
  // Auto-track UI interactions & observers safely
  setupAutoTrackers();
}

/**
 * Core Non-Blocking Event Tracking Dispatcher
 */
export function trackEvent(eventName, rawParams = {}) {
  if (typeof window === 'undefined') return;
  
  try {
    const attribution = captureAttribution();
    const cleanParams = sanitizeParams(rawParams);
    
    const payload = {
      page_path: window.location.pathname,
      page_title: document.title,
      timestamp: new Date().toISOString(),
      ...attribution,
      ...cleanParams
    };
    
    if (isDebugMode()) {
      console.log(`%c[Analytics Event]%c ${eventName}`, 'color: #2ecc71; font-weight: bold;', 'color: #fff;', payload);
    }
    
    if (typeof window.gtag === 'function' && activeMeasurementId) {
      window.gtag('event', eventName, payload);
    }
  } catch (err) {
    if (isDebugMode()) {
      console.warn('[Analytics Error]', err);
    }
  }
}

/**
 * Page View Event (Used for SPA navigation or explicit page view calls)
 */
export function trackPageView(pagePath = null, pageTitle = null) {
  const path = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '');
  const title = pageTitle || (typeof document !== 'undefined' ? document.title : '');
  
  trackEvent('page_view', {
    page_path: path,
    page_title: title,
    page_location: typeof window !== 'undefined' ? window.location.href : ''
  });
}

/**
 * CTA Click Event
 */
export function trackCTA(ctaName, ctaLocation = 'unknown', destinationUrl = '', extraParams = {}) {
  let eventName = 'cta_click';
  if (extraParams?.custom_event) {
    eventName = extraParams.custom_event;
  } else if (ctaName?.toLowerCase().includes('c11') || destinationUrl?.toLowerCase().includes('c11')) {
    eventName = 'c11_cohort_cta_click';
  } else if (ctaName?.toLowerCase().includes('register') || destinationUrl?.includes('#register') || destinationUrl?.includes('#live')) {
    eventName = 'webinar_cta_click';
  }
  
  trackEvent(eventName, {
    cta_name: ctaName,
    cta_location: ctaLocation,
    destination_url: destinationUrl,
    ...extraParams
  });
}

/**
 * Form Start Event (Triggered once when user first focuses an input)
 */
export function trackFormStart(formName, firstFieldName = 'unknown') {
  if (trackedFormsStarted.has(formName)) return;
  trackedFormsStarted.add(formName);
  
  trackEvent('form_start', {
    form_name: formName,
    first_field: firstFieldName
  });
}

/**
 * Form Submit Attempt Event
 */
export function trackFormSubmit(formName, metadata = {}) {
  trackEvent('form_submit', {
    form_name: formName,
    ...metadata
  });
}

/**
 * Form Error / Registration Friction Event
 */
export function trackFormError(formName, errorType, fieldName = null) {
  trackEvent('registration_error', {
    form_name: formName,
    error_type: errorType, // 'validation_error', 'duplicate_user', 'server_error'
    field_name: fieldName || 'general'
  });
}

/**
 * KEY BUSINESS CONVERSION: Successful Registration
 */
export function trackConversion(conversionName = 'registration_success', metadata = {}) {
  trackEvent(conversionName, {
    conversion_name: conversionName,
    form_name: metadata.form_name || 'webinar_registration',
    passport_id_generated: metadata.passport_id_generated || false,
    ...metadata
  });
}

/**
 * Outbound Link & Social/Contact Tracking
 */
export function trackExternalClick(destinationUrl, linkType = 'outbound', linkText = '', location = 'page_body') {
  let eventName = 'outbound_click';
  if (linkType === 'whatsapp' || destinationUrl.includes('wa.me') || destinationUrl.includes('whatsapp')) {
    eventName = 'whatsapp_click';
  } else if (linkType === 'email' || destinationUrl.startsWith('mailto:')) {
    eventName = 'email_click';
  } else if (linkType === 'phone' || destinationUrl.startsWith('tel:')) {
    eventName = 'phone_click';
  }
  
  trackEvent(eventName, {
    destination_url: destinationUrl,
    link_type: linkType,
    link_text: linkText.substring(0, 50),
    cta_location: location
  });
}

/**
 * AI Journey Interaction Tracking
 */
export function trackJourneyInteraction(stageName, action = 'view', metadata = {}) {
  const key = `${stageName}_${action}`;
  if (action === 'view' && trackedStages.has(key)) return;
  if (action === 'view') trackedStages.add(key);
  
  const stageMap = {
    'EXPLORE': 1,
    'CREATE': 2,
    'INNOVATE': 3,
    'BUILD': 4,
    'LEAD': 5
  };
  
  const level = stageMap[stageName?.toUpperCase()] || 0;
  
  const eventName = action === 'click' || action === 'tab_click' ? 'journey_stage_click' : 'journey_stage_view';
  
  trackEvent(eventName, {
    stage_name: stageName,
    stage_level: level,
    action: action,
    ...metadata
  });
}

/**
 * Homepage & Section Reach Observer Event
 */
export function trackSectionView(sectionId, sectionName = '') {
  if (trackedSections.has(sectionId)) return;
  trackedSections.add(sectionId);
  
  trackEvent('section_view', {
    section_id: sectionId,
    section_name: sectionName || sectionId
  });
}

/* ==========================================================================
   AUTO-TRACKING ENGINE (Non-Intrusive DOM Observers & Event Delegation)
   ========================================================================== */
function setupAutoTrackers() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  // 1. CTA & Outbound Link Delegate
  if (typeof document.addEventListener === 'function') {
    document.addEventListener('click', (e) => {
      try {
        const target = e.target?.closest ? e.target.closest('a, button, .btn, .nav-link, .nav-cta-btn, [data-cta]') : null;
        if (!target) return;
        
        const href = target.getAttribute('href') || target.getAttribute('data-href') || '';
        const text = (target.textContent || target.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ');
        
        // Determine section/location context
        const sectionEl = target.closest('section, header, footer, nav, #register-card');
        const location = sectionEl ? (sectionEl.id || sectionEl.tagName.toLowerCase() || 'page_body') : 'page_body';
        
        // Check Outbound / WhatsApp / Email / Phone
        if (href.startsWith('mailto:')) {
          trackExternalClick(href, 'email', text, location);
          return;
        }
        if (href.startsWith('tel:')) {
          trackExternalClick(href, 'phone', text, location);
          return;
        }
        if (href.includes('wa.me') || href.includes('whatsapp.com')) {
          trackExternalClick(href, 'whatsapp', text, location);
          return;
        }
        if (href.startsWith('http://') || href.startsWith('https://')) {
          const urlHost = new URL(href, window.location.href).hostname;
          if (urlHost !== window.location.hostname) {
            trackExternalClick(href, 'outbound', text, location);
            return;
          }
        }
        
        // Standard CTA Tracking
        if (text && text.length < 80) {
          const customEvent = target.getAttribute('data-track-cta');
          trackCTA(text, location, href, customEvent ? { custom_event: customEvent } : {});
        }
      } catch (err) {
        // Non-blocking
      }
    }, { passive: true });

    // 2. Form Auto-Tracker (Form View, Form Start & Select Interaction)
    document.addEventListener('focusin', (e) => {
      try {
        const form = e.target?.closest ? e.target.closest('form') : null;
        if (!form) return;
        
        const formName = form.id || form.className || 'unnamed_form';
        trackFormStart(formName, e.target.name || e.target.id || 'field');
      } catch (err) {}
    }, { passive: true });

    document.addEventListener('change', (e) => {
      try {
        const target = e.target;
        if (target && target.tagName === 'SELECT' && target.closest('form')) {
          const form = target.closest('form');
          const formName = form.id || 'registration_form';
          trackEvent('form_field_interaction', {
            form_name: formName,
            field_name: target.name || target.id,
            field_value_selected: target.value
          });
        }
      } catch (err) {}
    }, { passive: true });
  }

  // 3. Homepage Section Reach Observer via IntersectionObserver
  if ('IntersectionObserver' in window) {
    const sectionsToTrack = [
      { selector: '#hero, header.hero-section, .hero', id: 'hero', name: 'Hero Section' },
      { selector: '#what-is-ai-passport, .what-is-passport', id: 'what_is_ai_passport', name: 'What is AI Passport?' },
      { selector: '#mastery-levels, .mastery-levels-section', id: 'mastery_levels', name: 'Four Mastery Levels' },
      { selector: '#ai-journey, .cinematic-journey-section', id: 'ai_journey', name: 'Your AI Journey' },
      { selector: '#projects-proof, .proof-section, .projects-showcase', id: 'proof_projects', name: 'Proof & Projects' },
      { selector: '#ecosystem, .ecosystem-section', id: 'ecosystem', name: 'One Ecosystem' },
      { selector: '#live-event, #register-card, .live-webinar-section', id: 'live_webinar', name: 'AI Passport Live Webinar' },
      { selector: '.final-cta, footer', id: 'final_cta', name: 'Final CTA & Footer' }
    ];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          const matched = sectionsToTrack.find(s => entry.target.matches(s.selector));
          if (matched) {
            trackSectionView(matched.id, matched.name);
          }
        }
      });
    }, { threshold: [0.25] });

    setTimeout(() => {
      sectionsToTrack.forEach(item => {
        const els = document.querySelectorAll ? document.querySelectorAll(item.selector) : [];
        els.forEach(el => observer.observe(el));
      });
    }, 1000);

    // AI Journey Stage Tracker
    const stageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          const stageName = entry.target.getAttribute('data-stage-name') || 
                            entry.target.querySelector('h3, h4, .stage-title')?.textContent?.trim() ||
                            entry.target.id;
          if (stageName) {
            trackJourneyInteraction(stageName, 'view');
          }
        }
      });
    }, { threshold: [0.3] });

    setTimeout(() => {
      const stageEls = document.querySelectorAll ? document.querySelectorAll('.journey-stage, .stage-card, [data-stage]') : [];
      stageEls.forEach(el => stageObserver.observe(el));
    }, 1200);
  }

  // 4. Scroll Depth Tracker (25%, 50%, 75%, 90%)
  if (typeof window.addEventListener === 'function') {
    let scrollTimeout = null;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
        try {
          const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
          if (docHeight <= 0) return;
          const scrollPercent = Math.round((window.scrollY / docHeight) * 100);
          
          [25, 50, 75, 90].forEach(threshold => {
            if (scrollPercent >= threshold && !trackedScrollDepths.has(threshold)) {
              trackedScrollDepths.add(threshold);
              trackEvent('scroll_depth', { depth_percentage: threshold });
            }
          });
        } catch (err) {}
      }, 400);
    }, { passive: true });
  }
}
