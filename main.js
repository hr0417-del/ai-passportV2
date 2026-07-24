/* ==========================================================================
   AI PASSPORT™ — MASTER INTERACTIVE ENGINE
   Preloader | Smooth Scroll | ScrollTrigger Section Reveal | Particles | Parallax
   ========================================================================== */

/* --- CONFIGURATION --- */
const AIPASSPORT_CONFIG = {
  // Connect to Google Sheets & Gmail Webhook
  webhookUrl: "https://script.google.com/macros/s/AKfycbzaIwGqncSPPpBJEZbGWscd6cWwls7rqqUvoGc931d2NylsEbLvuJvyLZYHG1toldpEbw/exec"
};

// Register GSAP plugins safely
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (e) {
    console.warn("Failed to register ScrollTrigger:", e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const initSafe = (fnName, fn) => {
    try {
      if (typeof fn === 'function') fn();
    } catch (e) {
      console.warn(`Error initializing ${fnName}:`, e);
    }
  };

  initSafe('initPreloader', initPreloader);
  initSafe('initLenis', initLenis);
  initSafe('initParticles', initParticles);
  initSafe('initMouseParallax', initMouseParallax);
  initSafe('initSectionReveal', initSectionReveal);
  initSafe('initScrollParallax', initScrollParallax);
  initSafe('initTimelineDraw', initTimelineDraw);
  initSafe('initBuildersDivider', initBuildersDivider);
  initSafe('initAccordion', initAccordion);
  initSafe('initRegistrationForm', initRegistrationForm);
  initSafe('initCardHoverReactions', initCardHoverReactions);
  initSafe('initCountdowns', initCountdowns);
  initSafe('initMobileMenu', initMobileMenu);
  initSafe('initScrollToTop', initScrollToTop);
  initSafe('initCustomCursor', initCustomCursor);
  initSafe('initSoundEngine', initSoundEngine);
  initSafe('initScrollSpy', initScrollSpy);
  initSafe('initTestimonialCarousel', initTestimonialCarousel);
  initSafe('initVideoPlayer', initVideoPlayer);
  initSafe('initStatsCounters', initStatsCounters);
  initSafe('initCardSpotlight', initCardSpotlight);
  initSafe('initDynamicHero', initDynamicHero);
  initSafe('initAIShiftCascade', initAIShiftCascade);
  initSafe('initCertificateVerifier', initCertificateVerifier);
});

/* --- 1. Preloader & Intro Sequence --- */
function initPreloader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  
  // Dynamically split hero title words for premium entrance reveal
  const heroTitle = document.querySelector('.hero-section h1');
  if (heroTitle) {
    const words = heroTitle.textContent.split(' ');
    heroTitle.innerHTML = words.map(w => `<span class="word-wrapper"><span class="word-inner">${w}</span></span>`).join(' ');
  }
  
  const introTimeline = gsap.timeline({ paused: true });
  
  introTimeline
    .to(loader, { 
      opacity: 0, 
      duration: 0.8, 
      ease: 'power2.inOut', 
      onComplete: () => {
        loader.style.display = 'none';
      }
    })
    // Fade in subtitle & badge
    .from('.hero-section .hero-text-block .hero-subtitle', {
      y: 15,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4')
    .from('.hero-section .hero-text-block .webinar-badge', {
      y: 20,
      opacity: 0,
      duration: 1.0,
      ease: 'power3.out'
    }, '-=0.6')
    // Apple-style vertical emerge for each word in the headline
    .to('.hero-section .hero-text-block h1 .word-inner', { 
      y: 0, 
      opacity: 1, 
      duration: 1.3, 
      stagger: 0.08,
      ease: 'power4.out' 
    }, '-=0.6')
    .from('.hero-section .hero-text-block .section-lead', { 
      y: 30, 
      opacity: 0, 
      duration: 1.2, 
      ease: 'power3.out' 
    }, '-=0.8')
    .from('.hero-section .hero-text-block .section-subtext', { 
      y: 20, 
      opacity: 0, 
      duration: 1.0, 
      ease: 'power3.out' 
    }, '-=0.6')
    .from('.hero-section .hero-text-block .countdown-display', {
      y: 20,
      opacity: 0,
      duration: 1.0,
      ease: 'power3.out'
    }, '-=0.6')
    .from('.hero-section .hero-text-block .btn-group', { 
      y: 15, 
      opacity: 0, 
      duration: 0.8, 
      ease: 'power3.out' 
    }, '-=0.4')
    .from('.hero-section .hero-image-block', { 
      scale: 0.94,
      opacity: 0, 
      duration: 1.8, 
      ease: 'power3.out' 
    }, '-=1.2')
    .from('.global-nav', { 
      opacity: 0, 
      duration: 1.0, 
      ease: 'power2.out' 
    }, '-=0.8');

  function runPreloaderTimeline() {
    sessionStorage.setItem('ai_passport_preloader_played', 'true');
    
    const preloaderTimeline = gsap.timeline({
      onComplete: () => {
        introTimeline.play();
      }
    });
    
    // Ensure initial states are set
    gsap.set('.loader-logo-wrap', { opacity: 0, scale: 0.98 });
    gsap.set('.loader-logo-glow', { opacity: 0, scale: 0.9 });
    gsap.set('#loader-headline', { opacity: 0, scale: 0.98 });
    gsap.set('#loader-caption', { opacity: 0, display: 'none' });
    gsap.set('.loader-progress-bar', { opacity: 0, display: 'none' });
    gsap.set('.loader-progress', { width: '0%' });
    gsap.set('#loader-final-msg', { opacity: 0, scale: 0.98 });
    
    preloaderTimeline
      // 1. Logo & Glow fade in rapidly
      .to('.loader-logo-wrap', { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, '0.0')
      .to('.loader-logo-glow', { opacity: 0.8, scale: 1, duration: 0.5, ease: 'power2.out' }, '0.0')
      
      // 2. 0.3s: "THE FIRST AI GENERATION" fades in
      .to('#loader-headline', { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }, '0.3')
      
      // 3. 0.8s: "THE FIRST AI GENERATION" fades out
      .to('#loader-headline', { opacity: 0, scale: 1.01, duration: 0.3, ease: 'power2.in' }, '0.8')
      
      // 4. 0.9s: "Loading AI Passport™..." & progress bar loading
      .to('#loader-caption', { display: 'block', opacity: 1, duration: 0.3, ease: 'power2.out' }, '0.9')
      .to('.loader-progress-bar', { display: 'block', opacity: 1, duration: 0.3 }, '0.9')
      .to('.loader-progress', { width: '100%', duration: 0.7, ease: 'power1.inOut' }, '0.9')
      
      // 5. 1.6s: Fade out loader items
      .to(['#loader-caption', '.loader-progress-bar', '.loader-logo-wrap', '.loader-logo-glow'], { opacity: 0, duration: 0.3, ease: 'power2.in' }, '1.6')
      
      // 6. 1.8s: "The AI Revolution Begins" (Final message) fades in
      .to('#loader-final-msg', { opacity: 1, scale: 1.02, duration: 0.5, ease: 'power3.out' }, '1.8')
      
      // 7. 2.4s: Fade out final message
      .to('#loader-final-msg', { opacity: 0, scale: 1.03, duration: 0.4, ease: 'power3.in' }, '2.4');
  }

  // Skip the animation entirely if the page loads faster than 1 second (subsequent visits)
  const loadTime = performance.now();
  const hasPlayed = sessionStorage.getItem('ai_passport_preloader_played');
  
  if (hasPlayed === 'true' && loadTime < 1000) {
    loader.style.display = 'none';
    introTimeline.play();
  } else {
    runPreloaderTimeline();
  }
}

/* --- 2. Smooth Scrolling (Lenis) --- */
let lenisInstance;
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  lenisInstance = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
    smoothTouch: false,
    infinite: false,
  });

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  if (typeof ScrollTrigger !== 'undefined') {
    lenisInstance.on('scroll', ScrollTrigger.update);
  }
  
  lenisInstance.on('scroll', (e) => {
    const nav = document.querySelector('.global-nav');
    if (nav) {
      if (e.scroll > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  });

  const navLinks = document.querySelectorAll('.nav-link, .footer-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#') && targetId.length > 1) {
        e.preventDefault();
        lenisInstance.scrollTo(targetId, { offset: -20, duration: 1.5 });
      }
    });
  });

  const ctaButtons = document.querySelectorAll('.nav-cta-btn, .btn[href="#register"], .cta-btn');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('href');
      if (targetId && targetId.startsWith('#') && targetId.length > 1) {
        e.preventDefault();
        lenisInstance.scrollTo(targetId, { offset: -40, duration: 1.8 });
      }
    });
  });

  const discoverBtn = document.querySelector('.btn[href="#identity"]');
  if (discoverBtn) {
    discoverBtn.addEventListener('click', (e) => {
      e.preventDefault();
      lenisInstance.scrollTo('#identity', { offset: -20, duration: 1.4 });
    });
  }

  // Loop scroll action
  const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      lenisInstance.scrollTo('#hero', {
        duration: 2.8,
        easing: (t) => t * (2 - t)
      });
    });
  }
}

/* --- 3. Scroll-Linked Section Reveal Animations --- */
function initSectionReveal() {
  if (typeof gsap === 'undefined') return;
  const sections = gsap.utils.toArray('.section');
  
  sections.forEach((section) => {
    // Skip Hero section animation since it's handled by introTimeline
    if (section.classList.contains('hero-section')) return;

    // Custom reveals for V2.0 sections
    if (section.id === 'movement') {
      const header = section.querySelector('.movement-header');
      const audienceGrid = section.querySelector('.audience-grid');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          toggleActions: 'play none none reverse'
        }
      });
      
      if (header) {
        tl.fromTo(header, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
      }
      
      if (audienceGrid) {
        const cards = audienceGrid.querySelectorAll('.audience-card');
        tl.fromTo(cards,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
          '-=0.4'
        );
      }
      return;
    }

    if (section.id === 'testimonials') {
      const header = section.querySelector('.testimonials-header');
      const carousel = section.querySelector('.carousel-container');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          toggleActions: 'play none none reverse'
        }
      });
      
      if (header) {
        tl.fromTo(header, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
      }
      
      if (carousel) {
        tl.fromTo(carousel,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' },
          '-=0.4'
        );
      }
      return;
    }

    const container = section.querySelector('.section-container');
    if (!container) return;

    const textCol = section.querySelector('.text-block, .pathway-text-block, .faq-container, .register-container, .outro-text-block, .contact-container, .info-container');
    const imageCol = section.querySelector('.image-block');

    // Layout direction parameters
    const isReverse = container.classList.contains('reverse');
    const textDirection = isReverse ? 50 : -50;

    // Apply 3D perspective to container for holographic card swing on entry
    gsap.set(container, { perspective: 1200, transformStyle: 'preserve-3d' });

    // Master entrance reveal timeline
    const revealTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          if (section.id === 'identity') {
            const pass = section.querySelector('.image-wrapper');
            if (pass) {
              gsap.fromTo(pass,
                { scale: 1, filter: 'drop-shadow(0 0 0px rgba(0,82,255,0))' },
                { scale: 1.04, filter: 'drop-shadow(0 0 25px rgba(0,82,255,0.35))', duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }
              );
            }
            const quote = section.querySelector('.quote-text-gold');
            if (quote) quote.classList.add('active');
          }
        },
        onLeaveBack: () => {
          if (section.id === 'identity') {
            const quote = section.querySelector('.quote-text-gold');
            if (quote) quote.classList.remove('active');
          }
        }
      }
    });

    // 1. Slide and fade the text column parent block slightly
    if (textCol) {
      const h2 = textCol.querySelector('h2');

      revealTimeline.fromTo(textCol, 
        { 
          opacity: 0, 
          x: textDirection 
        },
        { 
          opacity: 1, 
          x: 0, 
          duration: 1.2, 
          ease: 'power3.out' 
        },
        0
      );

      // 2. Continuous clip-path mask reveal on H2
      if (h2) {
        revealTimeline.fromTo(h2,
          { 
            clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', 
            y: 35,
            opacity: 0
          },
          { 
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', 
            y: 0,
            opacity: 1,
            duration: 1.2, 
            ease: 'power3.out' 
          },
          0.1
        );
      }

      // 3. Stagger secondary text descriptions, tags, accordion, or grids
      const childElements = textCol.querySelectorAll('.section-tag, p, .ecosystem-grid, .ecosystem-summary, .pathway-steps, .webinar-speakers, .builders-grid, .community-bubbles, .benefits-container, .faq-accordion, .register-form, .academy-grid, .journey-timeline-vertical, .contact-form-wrapper');
      if (childElements.length > 0) {
        revealTimeline.fromTo(childElements,
          { opacity: 0, y: 20, filter: 'blur(4px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', stagger: 0.05 },
          0.25
        );
      }
    }

    // 4. 3D holographic camera swing on passport image column
    if (imageCol) {
      revealTimeline.fromTo(imageCol,
        {
          opacity: 0,
          rotationX: 18,
          rotationY: isReverse ? 14 : -14,
          z: -120,
          scale: 0.92,
          filter: 'blur(8px)'
        },
        {
          opacity: 1,
          rotationX: 0,
          rotationY: 0,
          z: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.5,
          ease: 'power3.out'
        },
        0
      );
    }
  });
}

/* --- 3.5. Scroll-Driven Parallax and Scale for Images --- */
function initScrollParallax() {
  if (typeof gsap === 'undefined') return;
  // Hero text parallax
  const heroText = document.querySelector('.hero-section .hero-text-block');
  if (heroText) {
    gsap.to(heroText, {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  const sections = gsap.utils.toArray('.section');
  
  sections.forEach((section) => {
    const wrapper = section.querySelector('.image-wrapper');
    if (!wrapper) return;
    
    // Skip Hero section vertical parallax to avoid conflicts with loading timeline
    const isHero = section.classList.contains('hero-section');
    const startY = isHero ? 0 : 50;
    const endY = isHero ? -30 : -50;
    const startScale = isHero ? 1 : 0.94;
    const endScale = isHero ? 1.03 : 1.06;
    const startRot = isHero ? 0 : -2;
    const endRot = isHero ? 1.5 : 2;
    
    gsap.fromTo(wrapper, 
      { 
        y: startY, 
        scale: startScale, 
        rotation: startRot 
      },
      {
        y: endY,
        scale: endScale,
        rotation: endRot,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });
}

/* --- 4. Drifting Particles --- */
function initParticles() {
  if (typeof gsap === 'undefined') return;
  const container = document.getElementById('particles-container');
  if (!container) return;
  
  const count = 25;
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    container.appendChild(particle);
    
    gsap.set(particle, {
      x: gsap.utils.random(0, window.innerWidth),
      y: gsap.utils.random(0, window.innerHeight),
      opacity: gsap.utils.random(0.15, 0.45),
      scale: gsap.utils.random(0.4, 1.4),
      backgroundColor: gsap.utils.random(0, 1) > 0.6 ? '#dfcfad' : '#0052ff'
    });
    
    floatParticle(particle);
  }
}

function floatParticle(el) {
  if (typeof gsap === 'undefined') return;
  gsap.to(el, {
    x: `+=${gsap.utils.random(-150, 150)}`,
    y: `+=${gsap.utils.random(-150, 150)}`,
    opacity: gsap.utils.random(0.15, 0.45),
    duration: gsap.utils.random(15, 30),
    ease: 'sine.inOut',
    onComplete: () => floatParticle(el)
  });
}

/* --- 5. Interactive Mouse Parallax --- */
function initMouseParallax() {
  if (typeof gsap === 'undefined') return;
  window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const xVal = (clientX / window.innerWidth - 0.5) * 2;
    const yVal = (clientY / window.innerHeight - 0.5) * 2;
    
    // Tilt the active image wrappers dynamically
    const visibleImages = document.querySelectorAll('.section .image-wrapper');
    visibleImages.forEach(img => {
      gsap.to(img, {
        rotationY: xVal * 3,
        rotationX: -yVal * 3,
        transformPerspective: 800,
        duration: 1.2,
        ease: 'power2.out'
      });
    });
    
    // Gentle parallax on ambient background glows
    gsap.to('.electric-blue-glow', {
      x: xVal * 35,
      y: yVal * 35,
      duration: 2.2,
      ease: 'power2.out'
    });
    
    gsap.to('.champagne-glow', {
      x: -xVal * 20,
      y: -yVal * 20,
      duration: 1.8,
      ease: 'power2.out'
    });
  });
}

/* --- 6. Pathway Timeline Draw --- */
function initTimelineDraw() {
  if (typeof gsap === 'undefined') return;
  const activeLine = document.getElementById('pathway-draw-line');
  
  if (activeLine) {
    const pathLength = activeLine.getTotalLength();
    gsap.set(activeLine, { 
      strokeDasharray: pathLength, 
      strokeDashoffset: pathLength 
    });
    
    gsap.to(activeLine, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '#pathway .pathway-steps',
        start: 'top 65%',
        end: 'bottom 40%',
        scrub: true
      }
    });
  }

  const cards = document.querySelectorAll('.step-card');
  const pathwayImg = document.querySelector('#pathway .image-wrapper');
  cards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 65%',
      end: 'bottom 35%',
      onToggle: self => {
        if (self.isActive) {
          cards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          
          // Illuminate passport on active level transition
          if (pathwayImg) {
            gsap.fromTo(pathwayImg,
              { scale: 1, filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))' },
              { 
                scale: 1.04, 
                filter: 'drop-shadow(0 0 25px rgba(223, 207, 173, 0.35))', 
                duration: 0.5, 
                yoyo: true, 
                repeat: 1, 
                ease: 'power2.out' 
              }
            );
          }
        }
      }
    });
  });
}

/* --- 7. Builders Central Divider Line --- */
function initBuildersDivider() {
  if (typeof gsap === 'undefined') return;
  const line = document.getElementById('divider-draw-line');
  if (line) {
    gsap.fromTo(line, 
      { scaleY: 0, transformOrigin: 'top center' },
      {
        scaleY: 1,
        duration: 1.8,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: '#builders',
          start: 'top 50%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }
}

/* --- 8. Accordion Toggle System --- */
function initAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  const faqImg = document.querySelector('#faq .image-wrapper');
  
  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');
    
    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        
        accordionItems.forEach(el => {
          el.classList.remove('active');
          const inner = el.querySelector('.accordion-content');
          if (inner) inner.style.maxHeight = null;
        });
        
        if (!isOpen) {
          item.classList.add('active');
          content.style.maxHeight = `${content.scrollHeight}px`;
          
          // Subtly react the passport image when FAQ item changes
          if (faqImg && typeof gsap !== 'undefined') {
            gsap.fromTo(faqImg,
              { scale: 1, filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))' },
              { 
                scale: 1.03, 
                filter: 'drop-shadow(0 0 20px rgba(223, 207, 173, 0.25))', 
                duration: 0.45, 
                yoyo: true, 
                repeat: 1, 
                ease: 'power2.out' 
              }
            );
          }
        }
        
        // Refresh trigger heights for both expand and collapse events
        setTimeout(() => {
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }, 350);
      });
    }
  });
}

/* --- 8b. Cinematic Video Player Instagram Reel Embed --- */
function initVideoPlayer() {
  // Wire horizontal scrolling controls for the reels slider
  const track = document.getElementById('reels-track');
  const prevBtn = document.getElementById('reels-prev');
  const nextBtn = document.getElementById('reels-next');
  if (track && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -344, behavior: 'smooth' });
      if (typeof playTickSound === 'function') {
        playTickSound('click');
      }
    });
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: 344, behavior: 'smooth' });
      if (typeof playTickSound === 'function') {
        playTickSound('click');
      }
    });
  }
}

/* --- 9. Registration Form & Digital Ticket Generation --- */
function initRegistrationForm() {
  const form = document.getElementById('registration-form');
  if (!form) return;
  
  const submitBtn = form.querySelector('.btn-submit');
  const fullname = document.getElementById('fullname');
  const email = document.getElementById('email');
  const mobile = document.getElementById('mobile');
  const role = document.getElementById('user-role');
  const consent = document.getElementById('consent');
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Inline Validation Helper
  function validateField(inputEl, condition, errorMsg) {
    if (!inputEl) return false;
    const group = inputEl.closest('.form-group') || inputEl.closest('.form-checkbox-group');
    if (!group) return condition;
    
    const existingError = group.querySelector('.error-msg');
    if (existingError) existingError.remove();
    group.classList.remove('invalid');
    
    if (!condition) {
      group.classList.add('invalid');
      const span = document.createElement('span');
      span.className = 'error-msg';
      span.textContent = errorMsg;
      group.appendChild(span);
      return false;
    }
    return true;
  }
  
  // Dynamic real-time validation listeners
  const validateList = [fullname, email, mobile, role, consent].filter(el => el !== null);
  validateList.forEach(el => {
    const evName = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
    el.addEventListener(evName, () => {
      if (el === fullname) {
        validateField(fullname, fullname.value.trim().length > 0, "Full Name is required *");
      } else if (el === email) {
        validateField(email, emailPattern.test(email.value.trim()), "Please enter a valid email *");
      } else if (el === mobile) {
        validateField(mobile, mobile.value.trim().length >= 8, "Enter a valid mobile number *");
      } else if (el === role) {
        validateField(role, role.value !== "", "Please select your role *");
      } else if (el === consent) {
        validateField(consent, consent.checked, "You must agree to receive updates *");
      }
    });
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Final Validation Check
    let isValid = true;
    if (fullname) isValid = validateField(fullname, fullname.value.trim().length > 0, "Full Name is required *") && isValid;
    if (email) isValid = validateField(email, emailPattern.test(email.value.trim()), "Please enter a valid email *") && isValid;
    if (mobile) isValid = validateField(mobile, mobile.value.trim().length >= 8, "Enter a valid mobile number *") && isValid;
    if (role) isValid = validateField(role, role.value !== "", "Please select your role *") && isValid;
    if (consent) isValid = validateField(consent, consent.checked, "You must agree to receive updates *") && isValid;
    
    if (!isValid) {
      playTickSound('click');
      return;
    }
    
    // Enter loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      const btnTxt = submitBtn.querySelector('.btn-text');
      if (btnTxt) btnTxt.textContent = 'SUBMITTING...';
    }
    playTickSound('click');
    
    // Collect form data and format as plain JSON object
    const formData = new FormData(form);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    
    const dataName = (fullname && fullname.value) || 'Citizen Builder';
    
    // Send form data to Webhook
    fetch(AIPASSPORT_CONFIG.webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(formObject)
    })
    .then(() => {
      proceedToSuccess(dataName);
    })
    .catch(err => {
      console.warn("Webhook submission warning, proceeding to success fallback:", err);
      proceedToSuccess(dataName);
    });
  });
  
  // Success ticket reveal and celebration burst
  function proceedToSuccess(name) {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const ticketName = document.getElementById('ticket-holder-name');
    const ticketId = document.getElementById('ticket-citizen-id');
    if (ticketName) ticketName.textContent = name.toUpperCase();
    if (ticketId) ticketId.textContent = `#2026-${randomId}`;
    
    // Step 1: Collapse form
    if (typeof gsap !== 'undefined') {
      gsap.to(form, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        onComplete: () => {
          form.style.display = 'none';
          
          // Step 2: Show and animate ID pre-generation loader screen
          const genLoader = document.getElementById('ticket-generation-loader');
          if (genLoader) {
            const prgBar = genLoader.querySelector('.loader-ticket-progress');
            genLoader.style.display = 'block';
            
            gsap.fromTo(genLoader,
              { opacity: 0, y: 15 },
              { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
            );
            
            // Reset progress bar scale
            if (prgBar) gsap.set(prgBar, { scaleX: 0, transformOrigin: 'left center' });
            
            playTickSound('hover');
            
            gsap.to(prgBar || {}, {
              scaleX: 1,
              duration: 2.4,
              ease: 'power1.inOut',
              onComplete: () => {
                // Step 3: Fade out preloader and reveal actual boarding ticket
                gsap.to(genLoader, {
                  opacity: 0,
                  y: -15,
                  duration: 0.4,
                  onComplete: () => {
                    genLoader.style.display = 'none';
                    
                    const successTicket = document.getElementById('registration-success');
                    if (successTicket) {
                      successTicket.style.display = 'block';
                      playTickSound('success');
                      
                      gsap.fromTo(successTicket, 
                        { opacity: 0, scale: 0.95, y: 20 },
                        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)' }
                      );
                      
                      triggerConfetti(successTicket);
                    }
                    
                    setTimeout(() => {
                      if (typeof ScrollTrigger !== 'undefined') {
                        ScrollTrigger.refresh();
                      }
                    }, 150);
                  }
                });
              }
            });
          }
        }
      });
    } else {
      // Non-GSAP fallback
      form.style.display = 'none';
      const successTicket = document.getElementById('registration-success');
      if (successTicket) successTicket.style.display = 'block';
    }
  }
  
  // Dynamic Confetti Particle explosion using GSAP
  function triggerConfetti(successContainer) {
    if (typeof gsap === 'undefined') return;
    const colors = ['#dfcfad', '#0052ff', '#ffffff'];
    const count = 50;
    
    successContainer.style.position = 'relative';
    
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      successContainer.appendChild(p);
      
      const size = gsap.utils.random(5, 9);
      gsap.set(p, {
        width: size,
        height: size,
        backgroundColor: gsap.utils.random(colors),
        borderRadius: gsap.utils.random(0, 1) > 0.5 ? '50%' : '2px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        x: 0,
        y: 0,
        z: 0,
        pointerEvents: 'none'
      });
      
      const angle = gsap.utils.random(0, Math.PI * 2);
      const velocity = gsap.utils.random(80, 220);
      const targetX = Math.cos(angle) * velocity;
      const targetY = Math.sin(angle) * velocity - gsap.utils.random(60, 140);
      
      gsap.to(p, {
        x: targetX,
        y: targetY,
        rotation: gsap.utils.random(0, 360),
        opacity: 0,
        duration: gsap.utils.random(1.4, 2.2),
        ease: 'power2.out',
        onComplete: () => p.remove()
      });
    }
  }
  
  // Success return action
  const returnBtn = document.getElementById('success-return-btn');
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      playTickSound('click');
      form.reset();
      
      form.querySelectorAll('.form-group, .form-checkbox-group').forEach(grp => {
        grp.classList.remove('invalid');
        const err = grp.querySelector('.error-msg');
        if (err) err.remove();
      });
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        const btnTxt = submitBtn.querySelector('.btn-text');
        if (btnTxt) btnTxt.textContent = 'Reserve My Free Seat';
      }
      
      const successTicket = document.getElementById('registration-success');
      if (successTicket) {
        if (typeof gsap !== 'undefined') {
          gsap.to(successTicket, {
            opacity: 0,
            scale: 0.95,
            y: 20,
            duration: 0.4,
            onComplete: () => {
              successTicket.style.display = 'none';
              form.style.display = 'block';
              gsap.fromTo(form, 
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
              );
              
              if (lenisInstance) {
                lenisInstance.scrollTo('#hero', { duration: 2.2 });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              
              setTimeout(() => {
                ScrollTrigger.refresh();
              }, 150);
            }
          });
        } else {
          successTicket.style.display = 'none';
          form.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }
  
  // Success share action
  const shareBtn = document.getElementById('success-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      playTickSound('click');
      if (navigator.share) {
        navigator.share({
          title: 'AI Passport Launch',
          text: 'I just reserved my seat for the official AI Passport Launch Webinar! Join the First AI Generation.',
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('AI Passport link copied to clipboard! Share it with your friends.');
      }
    });
  }
}

/* --- 10. Mobile Menu Logic --- */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active');
      navLinks.classList.toggle('mobile-open');
      
      const isOpen = toggleBtn.classList.contains('active');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      
      const spans = toggleBtn.querySelectorAll('span');
      if (typeof gsap !== 'undefined') {
        if (isOpen) {
          gsap.to(spans[0], { y: 6, rotation: 45, duration: 0.3 });
          gsap.to(spans[1], { y: -6, rotation: -45, duration: 0.3 });
          gsap.to(navLinks, { display: 'flex', opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', onComplete: () => {
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          } });
        } else {
          gsap.to(spans[0], { y: 0, rotation: 0, duration: 0.3 });
          gsap.to(spans[1], { y: 0, rotation: 0, duration: 0.3 });
          gsap.to(navLinks, { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
            navLinks.style.display = '';
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          } });
        }
      } else {
        navLinks.style.display = isOpen ? 'flex' : '';
      }
    });

    const links = navLinks.querySelectorAll('a');
    links.forEach(l => {
      l.addEventListener('click', () => {
        if (toggleBtn.classList.contains('active')) {
          toggleBtn.click();
        }
      });
    });
  }
}

/* --- 11. Live Countdown Timer Logic --- */
function initCountdowns() {
  // Target Webinar Date: August 2, 2026, 14:00 IST (UTC+5:30) => 08:30 UTC
  const targetDate = Date.UTC(2026, 7, 2, 8, 30, 0);
  
  const daysContainers = document.querySelectorAll('.countdown-days');
  const hoursContainers = document.querySelectorAll('.countdown-hours');
  const minsContainers = document.querySelectorAll('.countdown-minutes');
  const secsContainers = document.querySelectorAll('.countdown-seconds');
  const wrappers = document.querySelectorAll('.countdown-display');
  
  if (!wrappers.length) return;
  
  // Inject countdown captions dynamically
  wrappers.forEach(display => {
    const parent = display.parentNode;
    if (!parent) return;
    const caption = parent.querySelector('.countdown-caption') || document.createElement('p');
    caption.className = 'countdown-caption';
    caption.textContent = 'Until the next live experience';
    if (!parent.querySelector('.countdown-caption')) {
      parent.insertBefore(caption, display.nextSibling);
    }
  });
  
  function adjustDigitSpans(container, length) {
    let spans = container.querySelectorAll('.digit');
    if (spans.length !== length) {
      container.innerHTML = '';
      for (let i = 0; i < length; i++) {
        const span = document.createElement('span');
        span.className = 'digit';
        span.textContent = '0';
        container.appendChild(span);
      }
    }
  }
  
  function updateContainerDigits(container, valStr) {
    if (typeof gsap === 'undefined') {
      container.textContent = valStr;
      return;
    }
    try {
      adjustDigitSpans(container, valStr.length);
      const spans = container.querySelectorAll('.digit');
      for (let i = 0; i < valStr.length; i++) {
        const char = valStr.charAt(i);
        const span = spans[i];
        if (span && span.textContent !== char) {
          span.textContent = char;
          gsap.fromTo(span,
            { scaleY: 0.4, y: -6, opacity: 0.5 },
            { 
              scaleY: 1, 
              y: 0, 
              opacity: 1, 
              duration: 0.4, 
              ease: 'back.out(1.5)' 
            }
          );
        }
      }
    } catch (err) {
      container.textContent = valStr;
    }
  }
  
  const updateTimer = () => {
    const now = new Date().getTime();
    const diff = targetDate - now;
    
    if (diff <= 0) {
      wrappers.forEach(w => {
        w.innerHTML = "<div class='live-badge-wrapper'><span class='live-badge'>LIVE NOW</span> <span class='live-text'>Next Live National Webinar is in progress!</span></div>";
      });
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    const daysStr = days.toString().padStart(2, '0');
    const hrsStr = hours.toString().padStart(2, '0');
    const minsStr = mins.toString().padStart(2, '0');
    const secsStr = secs.toString().padStart(2, '0');
    
    daysContainers.forEach(container => updateContainerDigits(container, daysStr));
    hoursContainers.forEach(container => updateContainerDigits(container, hrsStr));
    minsContainers.forEach(container => updateContainerDigits(container, minsStr));
    secsContainers.forEach(container => updateContainerDigits(container, secsStr));
  };
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

/* --- 11b. Testimonial Carousel sliding track logic --- */
function initTestimonialCarousel() {
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next-btn');
  const dotsContainer = document.getElementById('carousel-dots');
  
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;
  
  const slides = Array.from(track.children);
  let currentIndex = 0;
  
  dotsContainer.innerHTML = '';
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    dotsContainer.appendChild(dot);
    
    dot.addEventListener('click', () => {
      if (typeof playTickSound === 'function') playTickSound('click');
      goToSlide(idx);
    });
  });
  
  const dots = Array.from(dotsContainer.children);
  
  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }
  
  prevBtn.addEventListener('click', () => {
    if (typeof playTickSound === 'function') playTickSound('click');
    goToSlide(currentIndex - 1);
  });
  
  nextBtn.addEventListener('click', () => {
    if (typeof playTickSound === 'function') playTickSound('click');
    goToSlide(currentIndex + 1);
  });
  
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    if (touchStartX - touchEndX > 50) {
      goToSlide(currentIndex + 1);
    }
    if (touchEndX - touchStartX > 50) {
      goToSlide(currentIndex - 1);
    }
  }
}

/* --- 12. Smooth Scroll-To-Top Loop Reset --- */
function initScrollToTop() {
  const btn = document.getElementById('scroll-to-top-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      playTickSound('click');
      if (lenisInstance) {
        lenisInstance.scrollTo('#hero', { 
          duration: 2.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

/* --- 12.5. Card Hover & Dynamic Swapping Reactions --- */
function initCardHoverReactions() {
  const ecoPassport = document.querySelector('#ecosystem .image-wrapper');
  const ecoCards = document.querySelectorAll('#ecosystem .grid-item');
  if (ecoPassport && ecoCards.length > 0 && typeof gsap !== 'undefined') {
    ecoCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(ecoPassport, {
          scale: 1.05,
          filter: 'drop-shadow(0 0 25px rgba(0, 82, 255, 0.25))',
          duration: 0.45,
          ease: 'power2.out'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(ecoPassport, {
          scale: 1,
          filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))',
          duration: 0.45,
          ease: 'power2.out'
        });
      });
    });
  }
  
  const bubbles = document.querySelectorAll('.community-bubbles .bubble');
  const activeDesc = document.getElementById('community-active-desc');
  if (bubbles.length > 0 && activeDesc && typeof gsap !== 'undefined') {
    bubbles.forEach(b => {
      b.addEventListener('mouseenter', () => {
        bubbles.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        
        const newText = b.getAttribute('data-desc');
        
        gsap.to(activeDesc, {
          opacity: 0,
          x: -12,
          duration: 0.2,
          onComplete: () => {
            activeDesc.textContent = newText;
            gsap.to(activeDesc, {
              opacity: 1,
              x: 0,
              duration: 0.35,
              ease: 'power2.out'
            });
          }
        });
        playTickSound('hover');
      });
    });
  }
}

/* --- 13. Custom Luxury Cursor Logic --- */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;
  const dot = cursor.querySelector('.cursor-dot');
  const glow = cursor.querySelector('.cursor-glow');
  
  if (!dot || !glow) return;
  
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    return;
  }
  
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (typeof gsap !== 'undefined') {
      gsap.set(dot, { x: mouseX, y: mouseY });
    }
  });
  
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add(() => {
      const dt = 1.0 - Math.pow(0.85, gsap.ticker.deltaRatio());
      glowX += (mouseX - glowX) * dt * 0.35;
      glowY += (mouseY - glowY) * dt * 0.35;
      gsap.set(glow, { x: glowX, y: glowY });
    });
  }
  
  const interactiveTargets = document.querySelectorAll('a, button, .accordion-trigger, .step-card, .bubble, .portrait-wrapper, .program-card');
  interactiveTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
      playTickSound('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
    });
  });
}

/* --- 14. Synthesized Audio Engine (Web Audio API) --- */
let audioCtx = null;
let audioMuted = true;

function initSoundEngine() {
  const toggle = document.getElementById('sound-toggle');
  if (toggle) {
    const soundOffIcon = toggle.querySelector('.sound-off');
    const soundOnIcon = toggle.querySelector('.sound-on');
    
    toggle.addEventListener('click', () => {
      audioMuted = !audioMuted;
      
      if (audioMuted) {
        if (soundOffIcon) soundOffIcon.style.display = 'block';
        if (soundOnIcon) soundOnIcon.style.display = 'none';
        toggle.classList.remove('active');
      } else {
        if (soundOffIcon) soundOffIcon.style.display = 'none';
        if (soundOnIcon) soundOnIcon.style.display = 'block';
        toggle.classList.add('active');
        
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        playTickSound('success');
      }
    });
  }
}

function playTickSound(type = 'click') {
  if (audioMuted) return;
  
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'click') {
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'hover') {
      osc.frequency.setValueAtTime(1500, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.02);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (err) {
    console.warn("Web Audio API not supported or blocked:", err);
  }
}

/* --- 15. Navigation ScrollSpy --- */
function initScrollSpy() {
  if (typeof ScrollTrigger === 'undefined') return;
  const links = document.querySelectorAll('.nav-links .nav-link, .nav-cta-btn');
  links.forEach(link => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#') && targetId.length > 1) {
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        ScrollTrigger.create({
          trigger: targetSection,
          start: 'top 40%',
          end: 'bottom 40%',
          onToggle: self => {
            if (self.isActive) {
              links.forEach(l => l.classList.remove('active'));
              link.classList.add('active');
            }
          }
        });
      }
    }
  });
}

/* --- 16. Interactive AI Demo Typewriter Showcase --- */
function initAIDemoTabs() {
  const tabs = document.querySelectorAll('.ai-demo-tab-btn');
  const container = document.getElementById('ai-demo-window-content');
  if (!container || !tabs.length) return;

  const demoData = {
    code: {
      prompt: "Build a fully responsive web application with custom database endpoints.",
      response: "Initiating React & Node.js application stack...\n- Database endpoints: /api/v1/citizens verified\n- Encryption protocols: SHA-256 enabled\n- Host deployment: Complete!\n\nSystem is live. You can now build, secure, and deploy custom full-stack solutions."
    },
    presentations: {
      prompt: "Draft an educational AI campaign strategy and presentation outline.",
      response: "Compiling presentation slides...\n- Slide 1: The AI Competence Shift (Memorization vs Action)\n- Slide 2: Dynamic Skill Portfolios (Live Ledgers)\n- Slide 3: Growth Roadmap (From Classroom to Workspace)\n\nOutline completed! You are ready to present to schools and enterprises."
    },
    data: {
      prompt: "Analyze active cohort metrics and generate insight logs.",
      response: "Processing student database analytics...\n- Total cohort registrations: 5,000+ verified\n- Platform uptime: 99.98%\n- Skill verification latency: 120ms\n\nLogs compiled! You are ready to make data-driven operational decisions."
    },
    business: {
      prompt: "Automate WhatsApp notification alerts on user form submissions.",
      response: "Deploying serverless webhook triggers...\n- WhatsApp API handshake: Validated\n- JSON payload parsing: Active\n- Delivery logging: Success!\n\nAutomation online. You are ready to trigger real-time transaction updates."
    }
  };

  let typingTimeout = null;

  function runDemo(tabId) {
    if (typingTimeout) clearTimeout(typingTimeout);
    
    const data = demoData[tabId];
    if (!data) return;

    container.innerHTML = `<div class="code-prompt"></div><div class="code-response" style="display:none;"></div>`;
    const promptDiv = container.querySelector('.code-prompt');
    const responseDiv = container.querySelector('.code-response');

    let charIdx = 0;
    function typePrompt() {
      if (charIdx < data.prompt.length) {
        promptDiv.textContent += data.prompt.charAt(charIdx);
        charIdx++;
        typingTimeout = setTimeout(typePrompt, 25);
      } else {
        typingTimeout = setTimeout(() => {
          responseDiv.style.display = 'block';
          let lineIdx = 0;
          const lines = data.response.split('\n');
          responseDiv.innerHTML = '';
          
          function revealResponseLines() {
            if (lineIdx < lines.length) {
              const line = document.createElement('div');
              line.textContent = lines[lineIdx];
              responseDiv.appendChild(line);
              lineIdx++;
              container.scrollTop = container.scrollHeight;
              typingTimeout = setTimeout(revealResponseLines, 100);
            }
          }
          revealResponseLines();
        }, 300);
      }
    }
    typePrompt();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      runDemo(tabId);
      if (typeof playTickSound === 'function') {
        playTickSound('click');
      }
    });
  });

  // CLI Sandbox input keys handler
  const cliInput = document.getElementById('ai-demo-cli-input');
  if (cliInput) {
    cliInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const cmd = cliInput.value.trim().toLowerCase();
        cliInput.value = '';
        if (!cmd) return;

        if (typeof playTickSound === 'function') {
          playTickSound('click');
        }

        // Append user prompt command to screen
        const userPrompt = document.createElement('div');
        userPrompt.className = 'code-prompt';
        userPrompt.textContent = cmd;
        container.appendChild(userPrompt);
        container.scrollTop = container.scrollHeight;

        const resLine = document.createElement('div');
        resLine.className = 'code-response';
        container.appendChild(resLine);

        if (cmd === 'clear') {
          container.innerHTML = '';
          return;
        }

        let responseText = '';
        if (cmd === 'help') {
          responseText = "Available commands:\n- help: display instructions\n- code: build component demo\n- data: inspect database logs\n- business: setup webhook pipeline\n- status: audit active platform states\n- clear: flush logs";
        } else if (demoData[cmd]) {
          responseText = demoData[cmd].response;
          tabs.forEach(t => {
            if (t.getAttribute('data-tab') === cmd) {
              tabs.forEach(x => x.classList.remove('active'));
              t.classList.add('active');
            }
          });
        } else if (cmd === 'status') {
          responseText = "System operational coordinates:\n- API Gateways: Synchronized\n- Citizen Profile DB: Connected\n- Security Hash Signature: Verified V2.2\n- Active users count: 5,000+";
        } else {
          responseText = `Command not recognized: '${cmd}'. Type 'help' for instructions.`;
        }

        let lineIdx = 0;
        const lines = responseText.split('\n');
        function revealLines() {
          if (lineIdx < lines.length) {
            const div = document.createElement('div');
            div.textContent = lines[lineIdx];
            resLine.appendChild(div);
            lineIdx++;
            container.scrollTop = container.scrollHeight;
            setTimeout(revealLines, 80);
          }
        }
        revealLines();
      }
    });
  }

  // Run first demo as default
  runDemo('code');
}

/* --- 17. Viewport Stats Counters Animation --- */
function initStatsCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1500; // 1.5s
        const startTime = performance.now();

        function animate(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = progress * (2 - progress);
          const currentVal = Math.floor(easeProgress * target);
          
          if (target >= 1000) {
            el.textContent = currentVal.toLocaleString() + suffix;
          } else {
            el.textContent = currentVal + suffix;
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            if (target >= 1000) {
              el.textContent = target.toLocaleString() + suffix;
            } else {
              el.textContent = target + suffix;
            }
          }
        }

        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1 });

  counters.forEach(c => observer.observe(c));
}

/* --- 18. Apple/Stripe Spotlight Glow Effect --- */
function initCardSpotlight() {
  const cards = document.querySelectorAll('.why-ai-card, .program-card, .benefit-item-card, .audience-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* --- 19. Dynamic Rotating Hero Copy Loop --- */
function initDynamicHero() {
  const titleEl = document.getElementById('hero-dynamic-title');
  const leadEl = document.getElementById('hero-dynamic-lead');
  if (!titleEl || !leadEl) return;

  const slides = [
    {
      title: "Don't Just Use AI. Build With It.",
      lead: "AI Passport is your lifelong learning identity. Discover how AI is reshaping the world, attend live mentor sessions to create your first projects, and unlock professional certificates that showcase your actual skills."
    },
    {
      title: "Master the AI Economy.",
      lead: "Evolve into a specialized builder. Learn Python scripting, relational data science, full-stack endpoints, and security auditing through Ekaakshar Academy's 6-month professional tracks."
    },
    {
      title: "Get More Done. Automate Everything.",
      lead: "Save hours of daily prep. Design custom lesson worksheets, query contracts, summarize document archives, and deploy serverless webhooks in Ekaakshar's 4-week applied executive tracks."
    }
  ];

  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % slides.length;
    
    if (typeof gsap !== 'undefined') {
      gsap.timeline()
        .to([titleEl, leadEl], { opacity: 0, y: -12, duration: 0.4, ease: 'power2.in', stagger: 0.05 })
        .call(() => {
          titleEl.textContent = slides[idx].title;
          leadEl.textContent = slides[idx].lead;
        })
        .to([titleEl, leadEl], { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 });
    } else {
      titleEl.textContent = slides[idx].title;
      leadEl.textContent = slides[idx].lead;
    }
  }, 7500); // Cycles every 7.5 seconds
}


/* --- 20. AI Shift Section Card Cascade Entrance --- */
function initAIShiftCascade() {
  const section = document.getElementById('why-ai');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = section.querySelectorAll('.why-ai-card');
        cards.forEach(card => card.classList.add('visible'));

        const headline = section.querySelector('#ai-shift-headline');
        if (headline) {
          headline.classList.add('glitch-active');
          setTimeout(() => headline.classList.remove('glitch-active'), 1400);
        }
        observer.unobserve(section);
      }
    });
  }, { threshold: 0.15 });

  observer.observe(section);
}


/* --- 21. Certificate Verification Portal Engine --- */
function initCertificateVerifier() {
  const form = document.getElementById('verify-form');
  const input = document.getElementById('verify-input');
  const sampleBtns = document.querySelectorAll('.sample-id-btn');
  const statusBanner = document.getElementById('verify-status-banner');
  const statusTitle = document.getElementById('status-title');
  const statusSubtext = document.getElementById('status-subtext');
  const statusIcon = document.getElementById('status-icon');
  const timestamp = document.getElementById('verification-timestamp');
  const certDisplay = document.getElementById('certificate-card-display');
  const copyBtn = document.getElementById('btn-copy-link');

  if (!form || !input) return;

  // Sample Database matching official certificates
  const certificateDB = {
    "AIP-L1-2026-000245": {
      name: "NISHI TYAGI",
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – The AI Revolution Begins",
      eventSub: "◆ The AI Revolution Begins ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "19 July 2026",
      signatory: "Hitesh Rathee",
      description: "This certificate is awarded in recognition of your active participation in Level 1 – AI Explorer, where you explored how a single AI prompt can be transformed into a complete learning experience using modern AI workflows."
    },
    "AIP-L1-2026-000108": {
      name: "RAHUL SHARMA",
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – The AI Revolution Begins",
      eventSub: "◆ The AI Revolution Begins ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "19 July 2026",
      signatory: "Hitesh Rathee",
      description: "This certificate is awarded in recognition of your active participation in Level 1 – AI Explorer, where you explored how a single AI prompt can be transformed into a complete learning experience using modern AI workflows."
    },
    "AIP-L1-2026-000512": {
      name: "ANANYA VERMA",
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – The AI Revolution Begins",
      eventSub: "◆ The AI Revolution Begins ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "19 July 2026",
      signatory: "Hitesh Rathee",
      description: "This certificate is awarded in recognition of your active participation in Level 1 – AI Explorer, where you explored how a single AI prompt can be transformed into a complete learning experience using modern AI workflows."
    }
  };

  function performVerification(rawId) {
    if (!rawId) return;
    const certId = rawId.trim().toUpperCase();
    input.value = certId;

    const record = certificateDB[certId];

    if (record) {
      // Verified Success State
      if (statusBanner) {
        statusBanner.style.background = "rgba(0, 230, 118, 0.06)";
        statusBanner.style.borderColor = "rgba(0, 230, 118, 0.25)";
      }
      if (statusTitle) {
        statusTitle.textContent = "VERIFIED & AUTHENTICATED";
        statusTitle.style.color = "#00e676";
      }
      if (statusSubtext) {
        statusSubtext.textContent = "Official Ekaakshar AI Passport™ Certificate Record Found on Public Ledger";
      }
      if (statusIcon) {
        statusIcon.textContent = "✓";
        statusIcon.style.background = "#00e676";
        statusIcon.style.color = "#000";
      }
      if (timestamp) {
        timestamp.textContent = "Verified " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      // Update Digital Certificate Replica
      const nameEl = document.getElementById('cert-participant-name');
      const levelEl = document.getElementById('cert-level-badge');
      const eventTitleEl = document.getElementById('cert-event-title');
      const dateEl = document.getElementById('cert-issue-date');
      const certIdEl = document.getElementById('cert-id-display');
      const sigEl = document.getElementById('cert-signatory');
      const descEl = document.getElementById('cert-description');

      if (nameEl) nameEl.textContent = record.name;
      if (levelEl) levelEl.textContent = record.level;
      if (eventTitleEl) eventTitleEl.textContent = record.event;
      if (dateEl) dateEl.textContent = record.date;
      if (certIdEl) certIdEl.textContent = certId;
      if (sigEl) sigEl.textContent = record.signatory;
      if (descEl) descEl.innerHTML = record.description;

      if (certDisplay) certDisplay.style.display = "block";

    } else {
      // Not Found State
      if (statusBanner) {
        statusBanner.style.background = "rgba(255, 68, 68, 0.06)";
        statusBanner.style.borderColor = "rgba(255, 68, 68, 0.25)";
      }
      if (statusTitle) {
        statusTitle.textContent = "CREDENTIAL NOT FOUND";
        statusTitle.style.color = "#ff4444";
      }
      if (statusSubtext) {
        statusSubtext.textContent = "No active Ekaakshar certificate record matches ID '" + certId + "'. Please verify format (e.g. AIP-L1-2026-000245).";
      }
      if (statusIcon) {
        statusIcon.textContent = "✕";
        statusIcon.style.background = "#ff4444";
        statusIcon.style.color = "#fff";
      }
      if (timestamp) {
        timestamp.textContent = "Checked Just Now";
      }
      if (certDisplay) certDisplay.style.display = "none";
    }

    // Scroll smoothly to results
    const resultsSection = document.getElementById('verify-result-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    performVerification(input.value);
  });

  // Handle Sample Button Clicks
  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      performVerification(id);
    });
  });

  // Handle Copy Verification Link
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const certId = input.value || "AIP-L1-2026-000245";
      const shareUrl = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(certId);
      navigator.clipboard.writeText(shareUrl).then(() => {
        const origText = copyBtn.textContent;
        copyBtn.textContent = "✓ Link Copied!";
        setTimeout(() => { copyBtn.textContent = origText; }, 2000);
      });
    });
  }

  // Parse URL parameter e.g. verify.html?id=AIP-L1-2026-000245
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id');
  if (paramId) {
    performVerification(paramId);
  } else {
    // Default verification on first page load
    performVerification("AIP-L1-2026-000245");
  }
}





