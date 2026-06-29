/* ==========================================================================
   AI PASSPORT™ — MASTER INTERACTIVE ENGINE
   Preloader | Smooth Scroll | ScrollTrigger Crossfading | Particles | Parallax
   ========================================================================== */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initLenis();
  initBackgroundCrossfader();
  initParticles();
  initMouseParallax();
  initTimelineDraw();
  initBuildersDivider();
  initAccordion();
  initRegistrationForm();
  initMobileMenu();
});

/* --- 1. Preloader & Intro Sequence --- */
function initPreloader() {
  const progressBar = document.querySelector('.loader-progress');
  const loader = document.getElementById('loader');
  
  // Timeline for the hero entrance animation
  const introTimeline = gsap.timeline({ paused: true });
  
  introTimeline
    .to(loader, { 
      opacity: 0, 
      duration: 1, 
      ease: 'power3.inOut', 
      onComplete: () => {
        loader.style.display = 'none';
      }
    })
    // Fade in the hero background layer
    .to('.bg-layer[data-index="1"]', { 
      opacity: 1, 
      scale: 1, 
      duration: 2, 
      ease: 'power2.out' 
    }, '-=0.5')
    // Trigger Hero texts fade-in sequentially
    .from('.hero-text-block h1', { 
      y: 40, 
      opacity: 0, 
      duration: 1.5, 
      ease: 'power3.out' 
    }, '-=1.2')
    .from('.hero-text-block .section-lead', { 
      y: 30, 
      opacity: 0, 
      duration: 1.2, 
      ease: 'power3.out' 
    }, '-=1.0')
    .from('.hero-text-block .section-subtext', { 
      y: 20, 
      opacity: 0, 
      duration: 1.0, 
      ease: 'power3.out' 
    }, '-=0.8')
    .from('.hero-text-block .btn-group', { 
      y: 15, 
      opacity: 0, 
      duration: 0.8, 
      ease: 'power3.out' 
    }, '-=0.6')
    // Reveal top navigation bar
    .from('.global-nav', { 
      y: -30, 
      opacity: 0, 
      duration: 1.0, 
      ease: 'power2.out' 
    }, '-=0.8');

  // Smooth loading progression
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      progressBar.style.width = '100%';
      
      // Delay slightly at 100% for premium feel, then unveil
      setTimeout(() => {
        introTimeline.play();
      }, 500);
    } else {
      progressBar.style.width = `${progress}%`;
    }
  }, 120);
}

/* --- 2. Smooth Scrolling (Lenis) --- */
let lenisInstance;
function initLenis() {
  lenisInstance = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth Apple-style easeOutQuint
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

  // Sync scroll event with GSAP ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);
  
  // Navbar state change on scroll
  lenisInstance.on('scroll', (e) => {
    const nav = document.querySelector('.global-nav');
    if (e.scroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Connect scroll to section navbar highlight (optional utility)
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      lenisInstance.scrollTo(targetId, { offset: -20, duration: 1.5 });
    });
  });

  // Seat Reservation Nav CTAs scroll mapping
  const ctaButtons = document.querySelectorAll('.nav-cta-btn, .btn[href="#register"]');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      lenisInstance.scrollTo('#register', { offset: -40, duration: 1.8 });
    });
  });

  // Discover AI Passport button action
  const discoverBtn = document.querySelector('.btn[href="#identity"]');
  if (discoverBtn) {
    discoverBtn.addEventListener('click', (e) => {
      e.preventDefault();
      lenisInstance.scrollTo('#identity', { offset: -20, duration: 1.4 });
    });
  }

  // Set up the Infinite scroll loop at page boundary
  let isScrollLooping = false;
  const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
  
  const performLoopScroll = () => {
    if (isScrollLooping) return;
    isScrollLooping = true;
    
    // Crossfade Section 12 background back to Section 1 (Hero) instantly/seamlessly
    gsap.to('.bg-layer[data-index="12"]', { opacity: 0, duration: 1.5 });
    gsap.to('.bg-layer[data-index="1"]', { opacity: 1, duration: 1.5 });
    
    setTimeout(() => {
      lenisInstance.scrollTo('#hero', {
        duration: 2.8,
        easing: (t) => t * (2 - t), // smooth easeOutQuad
        onComplete: () => {
          isScrollLooping = false;
        }
      });
    }, 400);
  };

  scrollToTopBtn.addEventListener('click', performLoopScroll);

  lenisInstance.on('scroll', (e) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    // If the scroll hits the very bottom edge, trigger auto-loop glide to top
    if (e.scroll >= maxScroll - 3 && !isScrollLooping) {
      performLoopScroll();
    }
  });
}

/* --- 3. Scroll-Linked Background Crossfader --- */
function initBackgroundCrossfader() {
  const sections = gsap.utils.toArray('.section');
  const bgLayers = gsap.utils.toArray('.bg-layer');
  const qr = document.getElementById('qr-pulse');

  sections.forEach((section, i) => {
    const bgIndex = section.getAttribute('data-bg');
    
    // Create ScrollTrigger to manage background active classes for reliability
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: self => {
        if (self.isActive) {
          // Sync active class (triggers CSS scales as backup)
          bgLayers.forEach(layer => {
            if (layer.getAttribute('data-index') === bgIndex) {
              layer.classList.add('active');
            } else {
              layer.classList.remove('active');
            }
          });
          
          // QR pulse frequency adjustment in Section 11/12 (Registration and Loop Outro)
          if (bgIndex === '11' || bgIndex === '12') {
            qr.classList.add('slow');
          } else {
            qr.classList.remove('slow');
          }
        }
      }
    });

    // Animate content reveal inside text blocks
    const tags = section.querySelectorAll('.animate-text-fade');
    const words = section.querySelectorAll('.animate-text-word');
    
    if (tags.length > 0) {
      gsap.from(tags, {
        opacity: 0,
        y: 30,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      });
    }

    if (words.length > 0) {
      gsap.from(words, {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      });
    }

    // Precise ScrollTrigger opacity crossfade between layers
    if (i === 0) return; // Keep hero loaded
    
    const prevBgIndex = sections[i - 1].getAttribute('data-bg');
    const prevLayer = document.querySelector(`.bg-layer[data-index="${prevBgIndex}"]`);
    const nextLayer = document.querySelector(`.bg-layer[data-index="${bgIndex}"]`);
    
    if (prevLayer && nextLayer) {
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom', // Start fade as section enters viewport
          end: 'top top',    // End fade when section fully fills screen
          scrub: true
        }
      })
      .to(prevLayer, { opacity: 0, scale: 0.98, ease: 'none' })
      .to(nextLayer, { opacity: 1, scale: 1, ease: 'none' }, 0);
    }
  });
}

/* --- 4. Drifting Particles --- */
function initParticles() {
  const container = document.getElementById('particles-container');
  const count = 30;
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    container.appendChild(particle);
    
    // Distribute particles across canvas randomly
    gsap.set(particle, {
      x: gsap.utils.random(0, window.innerWidth),
      y: gsap.utils.random(0, window.innerHeight),
      opacity: gsap.utils.random(0.15, 0.45),
      scale: gsap.utils.random(0.4, 1.4),
      backgroundColor: gsap.utils.random(0, 1) > 0.6 ? '#dfcfad' : '#0052ff' // Champagne gold or Electric blue
    });
    
    // Start continuous floating motion loop
    floatParticle(particle);
  }
}

function floatParticle(el) {
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
  window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    
    // Map mouse position to range [-1, 1]
    const xVal = (clientX / window.innerWidth - 0.5) * 2;
    const yVal = (clientY / window.innerHeight - 0.5) * 2;
    
    // Shift background layers gently for structural depth
    gsap.to('.bg-canvas', {
      x: xVal * 12,
      y: yVal * 12,
      rotationY: xVal * 1.5,
      rotationX: -yVal * 1.5,
      duration: 1.5,
      ease: 'power2.out',
      transformPerspective: 1000
    });
    
    // Parallax shifting on ambient overlays for dynamic reflections
    gsap.to('.electric-blue-glow', {
      x: xVal * 40,
      y: yVal * 40,
      duration: 2.5,
      ease: 'power2.out'
    });
    
    gsap.to('.champagne-glow', {
      x: -xVal * 25,
      y: -yVal * 25,
      duration: 2.0,
      ease: 'power2.out'
    });
  });
}

/* --- 6. Pathway Timeline Draw --- */
function initTimelineDraw() {
  const activeLine = document.getElementById('pathway-draw-line');
  
  if (activeLine) {
    const pathLength = activeLine.getTotalLength();
    
    // Set SVG stroke variables for draw-in
    gsap.set(activeLine, { 
      strokeDasharray: pathLength, 
      strokeDashoffset: pathLength 
    });
    
    // ScrollTrigger to draw the line as user scrolls down
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

  // Activate timeline cards as scroll progresses
  const cards = document.querySelectorAll('.step-card');
  cards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 65%',
      end: 'bottom 35%',
      onToggle: self => {
        if (self.isActive) {
          cards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        }
      }
    });
  });
}

/* --- 7. Builders Central Divider Line --- */
function initBuildersDivider() {
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
  
  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');
    
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Close all open items
      accordionItems.forEach(el => {
        el.classList.remove('active');
        el.querySelector('.accordion-content').style.maxHeight = null;
      });
      
      // If clicked item was not open, open it
      if (!isOpen) {
        item.classList.add('active');
        content.style.maxHeight = `${content.scrollHeight}px`;
        
        // Push scroll position down slightly if needed to keep the accordion in viewport
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 300);
      }
    });
  });
}

/* --- 9. Registration Form Actions --- */
function initRegistrationForm() {
  const form = document.getElementById('registration-form');
  const statusDiv = document.getElementById('form-status');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simple visual submission validation animation
      const submitBtn = form.querySelector('.btn-submit');
      const originalText = submitBtn.querySelector('.btn-text').textContent;
      
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'VERIFYING IDENTITY...';
      
      setTimeout(() => {
        // Collect form data
        const name = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        
        // Show success status
        statusDiv.className = 'form-status success animate-text-fade';
        statusDiv.textContent = `Welcome, ${name}. Your seats for the Launch Webinar are secured. Check your email (${email}) for ticket verification code.`;
        
        // Reset button
        submitBtn.querySelector('.btn-text').textContent = 'INVITATION SECURED';
        submitBtn.style.backgroundColor = '#0052ff';
        submitBtn.style.color = '#ffffff';
        submitBtn.style.boxShadow = '0 0 25px rgba(0, 82, 255, 0.4)';
        
        // Clear all form values to clean UI
        form.querySelectorAll('.form-input').forEach(input => {
          input.disabled = true;
        });
      }, 1500);
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
      
      // Animate line shapes to 'X' icon
      const spans = toggleBtn.querySelectorAll('span');
      if (toggleBtn.classList.contains('active')) {
        gsap.to(spans[0], { y: 7, rotation: 45, duration: 0.3 });
        gsap.to(spans[1], { opacity: 0, duration: 0.2 });
        gsap.to(spans[2], { y: -7, rotation: -45, duration: 0.3 });
        gsap.to(navLinks, { display: 'flex', opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      } else {
        gsap.to(spans[0], { y: 0, rotation: 0, duration: 0.3 });
        gsap.to(spans[1], { opacity: 1, duration: 0.2 });
        gsap.to(spans[2], { y: 0, rotation: 0, duration: 0.3 });
        gsap.to(navLinks, { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
          navLinks.style.display = '';
        }});
      }
    });

    // Close menu drawer on clicking any navigation link
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
