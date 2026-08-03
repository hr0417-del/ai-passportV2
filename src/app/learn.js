/* ==========================================================================
   MY AI PASSPORT™ — STAGE 4 LEARN PAGE ENGINE
   ========================================================================== */

import { supabase } from '../lib/supabase.js';

// Isolated Development Fixtures (Used when DB catalogue table is empty)
const DEVELOPMENT_FIXTURES = [
  {
    id: 'ai-foundations-01',
    slug: 'ai-foundations-01',
    title: 'Practical AI Capabilities & Foundations',
    subtitle: 'Establish your practical foundation in modern AI systems.',
    short_description: 'Master core AI concepts, prompting frameworks, and practical AI-assisted workflows.',
    description: 'A comprehensive foundational programme designed to move you from theoretical awareness to practical capability across prompting, research, and daily workflow integration.',
    source_type: 'PASSPORT_ORIGINAL',
    format: 'SELF_PACED',
    provider_name: 'AI PASSPORT ACADEMY™',
    capability_dimensions: ['UNDERSTAND', 'APPLY', 'RESPONSIBLE'],
    estimated_minutes: 240,
    level: 'FOUNDATIONAL',
    build_outcome_title: 'Build a Personal AI Capability Workspace',
    why_recommended: 'Essential foundation for all AI Passport learning paths.',
    enrollment_url: '../academy.html',
    is_featured: true,
    publication_status: 'PUBLISHED'
  },
  {
    id: 'ai-automation-pro',
    slug: 'ai-automation-pro',
    title: 'AI Automation & Agentic Workflows',
    subtitle: 'Build autonomous agents and multi-step automated workflows.',
    short_description: 'Design and deploy automated AI research, data extraction, and task execution agents.',
    description: 'Learn to build reliable multi-step AI automations using modern agent frameworks and tool integrations.',
    source_type: 'PASSPORT_ORIGINAL',
    format: 'SELF_PACED',
    provider_name: 'AI PASSPORT ACADEMY™',
    capability_dimensions: ['APPLY', 'CREATE', 'EVALUATE'],
    estimated_minutes: 360,
    level: 'INTERMEDIATE',
    build_outcome_title: 'Build an Automated AI Research & Reporting Agent',
    why_recommended: 'Helps move from understanding AI to building autonomous practical workflows.',
    enrollment_url: '../academy.html',
    is_featured: true,
    publication_status: 'PUBLISHED'
  },
  {
    id: 'live-agentic-masterclass',
    slug: 'live-agentic-masterclass',
    title: 'Agentic AI Architecture Live Cohort',
    subtitle: 'Instructor-led live workshop on building multi-agent systems.',
    short_description: 'Interactive live build session focused on multi-agent collaboration and local execution.',
    description: 'Join practitioner-led live build sessions to construct and evaluate production-ready AI agents.',
    source_type: 'PASSPORT_LIVE',
    format: 'LIVE_WORKSHOP',
    provider_name: 'AI PASSPORT LIVE',
    capability_dimensions: ['CREATE', 'EVALUATE'],
    estimated_minutes: 180,
    level: 'INTERMEDIATE',
    build_outcome_title: 'Deploy a Multi-Agent Systems Pipeline',
    why_recommended: 'Direct practitioner-led live build experience.',
    enrollment_url: '../live.html',
    is_featured: false,
    publication_status: 'PUBLISHED'
  },
  {
    id: 'partner-deep-evaluations',
    slug: 'partner-deep-evaluations',
    title: 'AI System Evaluation & Safety Engineering',
    subtitle: 'Curated pathway on model evaluation, benchmarks, and safety.',
    short_description: 'Rigorous methodology for evaluating AI output quality, hallucination metrics, and safety rules.',
    description: 'Brought into AI Passport for its exceptional practical depth in evaluating AI model reliability.',
    source_type: 'PARTNER_PATHWAY',
    format: 'SELF_PACED',
    provider_name: 'Learning Partner: Anthropic Research',
    capability_dimensions: ['EVALUATE', 'RESPONSIBLE'],
    estimated_minutes: 300,
    level: 'ADVANCED',
    build_outcome_title: 'Build a Model Evaluation & Hallucination Benchmark',
    why_recommended: 'Supports critical development across EVALUATE and RESPONSIBLE dimensions.',
    enrollment_url: '../academy.html',
    is_featured: false,
    publication_status: 'PUBLISHED'
  }
];

export async function renderLearnPage(containerEl, user) {
  if (!containerEl || !user) return;

  containerEl.innerHTML = renderSkeleton();

  try {
    const isRealGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    // Fetch user progress and programmes in parallel
    const [progressRes, dbProgrammesRes, capabilityRes] = isRealGuid ? await Promise.all([
      supabase.from('learning_progress').select('*').eq('user_id', user.id).catch(() => ({ data: [] })),
      supabase.from('programmes').select('*').eq('publication_status', 'PUBLISHED').catch(() => ({ data: [] })),
      supabase.from('capability_states').select('*').eq('user_id', user.id).catch(() => ({ data: [] }))
    ]) : [{ data: [] }, { data: [] }, { data: [] }];

    const userProgress = (progressRes && progressRes.data) || [];
    const dbProgrammes = (dbProgrammesRes && dbProgrammesRes.data) || [];
    const userCapabilities = (capabilityRes && capabilityRes.data) || [];

    // Use DB programmes if present, else fallback to DEVELOPMENT_FIXTURES
    const programmes = dbProgrammes.length > 0 ? dbProgrammes : DEVELOPMENT_FIXTURES;

    // Filter categories
    const originals = programmes.filter(p => p.source_type === 'PASSPORT_ORIGINAL');
    const liveProgrammes = programmes.filter(p => p.source_type === 'PASSPORT_LIVE');
    const partnerPathways = programmes.filter(p => p.source_type === 'PARTNER_PATHWAY');

    // Compute recommendation logic
    const recommendation = computeRecommendation(userProgress, userCapabilities, programmes);

    containerEl.innerHTML = `
      <div class="learn-page-wrapper">
        
        <!-- 1. HERO SECTION -->
        <section class="learn-section hero-section">
          <div class="hero-tag">LEARN</div>
          <h1 class="hero-title">LEARN AI.<br>BUILD CAPABILITY.</h1>
          <p class="hero-sub">Practical learning pathways designed to help you understand AI, apply it, build with it, and demonstrate what you can do.</p>
          <div class="hero-micro-line">Every learning experience contributes to your evolving AI Passport.</div>
        </section>

        <!-- 2. CONTINUE LEARNING / START YOUR AI JOURNEY -->
        <section class="learn-section">
          ${renderContinueLearning(userProgress, programmes)}
        </section>

        <!-- 3. RECOMMENDED FOR YOUR NEXT MOVE -->
        ${recommendation ? `
          <section class="learn-section recommendation-section">
            <div class="section-header-left margin-bot-14">
              <h2 class="section-title">RECOMMENDED FOR YOUR NEXT MOVE</h2>
              <p class="section-subtitle">Intelligent pathway suggestion based on your current AI Passport state.</p>
            </div>
            
            <div class="recommendation-card">
              <div class="rec-card-left">
                <div class="rec-why-tag">WHY THIS?</div>
                <h3 class="rec-title">${escapeHtml(recommendation.title)}</h3>
                <p class="rec-reason">${escapeHtml(recommendation.why_reason)}</p>
                <div class="rec-meta">
                  <span class="rec-focus-label">Capability Focus:</span>
                  <div class="dim-tags">
                    ${recommendation.capability_dimensions.map(d => `<span class="dim-chip">${d}</span>`).join('')}
                  </div>
                </div>
              </div>
              <div class="rec-card-right">
                <a class="btn-primary-action inline-btn" href="${recommendation.enrollment_url || '#'}" target="_blank">VIEW PATHWAY →</a>
              </div>
            </div>
          </section>
        ` : ''}

        <!-- 4. YOUR PATHWAYS (ENROLLED / ACTIVE) -->
        <section class="learn-section pathways-section">
          <div class="section-header-left margin-bot-14">
            <h2 class="section-title">YOUR PATHWAYS</h2>
            <p class="section-subtitle">Learning journeys you've started or completed as part of your AI Passport.</p>
          </div>

          ${renderYourPathways(userProgress, programmes)}
        </section>

        <!-- 5. EXPLORE LEARNING (INTENT FILTERS & CATALOGUE) -->
        <section class="learn-section explore-section">
          <div class="section-header-block">
            <div class="section-header-left">
              <h2 class="section-title">EXPLORE LEARNING</h2>
              <p class="section-subtitle">Choose learning based on what capability you want to understand, build, or demonstrate.</p>
            </div>
          </div>

          <!-- Intent Filters -->
          <div class="intent-filter-bar">
            <button class="filter-chip active" onclick="window.filterCatalogue('ALL', this)">ALL INTENTS</button>
            <button class="filter-chip" onclick="window.filterCatalogue('UNDERSTAND', this)">UNDERSTAND</button>
            <button class="filter-chip" onclick="window.filterCatalogue('APPLY', this)">APPLY</button>
            <button class="filter-chip" onclick="window.filterCatalogue('CREATE', this)">CREATE</button>
            <button class="filter-chip" onclick="window.filterCatalogue('EVALUATE', this)">EVALUATE</button>
            <button class="filter-chip" onclick="window.filterCatalogue('RESPONSIBLE', this)">RESPONSIBLE</button>
          </div>

          <!-- Catalogue Grid -->
          <div class="catalogue-grid" id="learn-catalogue-grid">
            ${renderCatalogueCards(programmes)}
          </div>
        </section>

        <!-- 6. AI PASSPORT ORIGINALS -->
        <section class="learn-section originals-section">
          <div class="section-header-left margin-bot-14">
            <h2 class="section-title">AI PASSPORT ORIGINALS</h2>
            <p class="section-subtitle">Core capability pathways developed directly by AI Passport Academy™.</p>
          </div>

          <div class="originals-grid">
            ${renderSourceGroupCards(originals)}
          </div>
        </section>

        <!-- 7. AI PASSPORT LIVE -->
        <section class="learn-section live-section">
          <div class="section-header-left margin-bot-14">
            <h2 class="section-title">AI PASSPORT LIVE</h2>
            <p class="section-subtitle">Learn directly with practitioners through workshops, cohorts, masterclasses, and guided build experiences.</p>
          </div>

          <div class="live-grid">
            ${renderSourceGroupCards(liveProgrammes)}
          </div>
        </section>

        <!-- 8. CURATED PARTNER PATHWAYS -->
        <section class="learn-section partner-section">
          <div class="section-header-left margin-bot-14">
            <h2 class="section-title">CURATED PARTNER PATHWAYS</h2>
            <p class="section-subtitle">Selected learning experiences from trusted partners, brought into the AI Passport journey for their practical value.</p>
          </div>

          <div class="partner-grid">
            ${renderSourceGroupCards(partnerPathways)}
          </div>
        </section>

        <!-- 9. HOW LEARNING BUILDS YOUR PASSPORT -->
        <section class="learn-section philosophy-section">
          <div class="philosophy-container">
            <div class="section-header-left margin-bot-20">
              <h2 class="section-title">LEARNING IS ONLY THE BEGINNING.</h2>
              <p class="section-subtitle">How your learning progresses from knowledge into lifelong verified capability.</p>
            </div>

            <div class="philosophy-pipeline">
              <div class="ph-step">
                <span class="ph-num">1</span>
                <span class="ph-title">LEARN</span>
                <span class="ph-desc">Develop knowledge and practical understanding.</span>
              </div>
              <div class="ph-arrow">→</div>
              <div class="ph-step">
                <span class="ph-num">2</span>
                <span class="ph-title">BUILD</span>
                <span class="ph-desc">Turn learning into real projects.</span>
              </div>
              <div class="ph-arrow">→</div>
              <div class="ph-step">
                <span class="ph-num">3</span>
                <span class="ph-title">DEMONSTRATE</span>
                <span class="ph-desc">Show what you can actually do.</span>
              </div>
              <div class="ph-arrow">→</div>
              <div class="ph-step">
                <span class="ph-num">4</span>
                <span class="ph-title">VERIFY</span>
                <span class="ph-desc">Earn trusted evidence and credentials.</span>
              </div>
              <div class="ph-arrow">→</div>
              <div class="ph-step">
                <span class="ph-num">5</span>
                <span class="ph-title">GROW</span>
                <span class="ph-desc">Your AI Passport evolves with your capability.</span>
              </div>
            </div>

            <div class="philosophy-tagline">Don't Just Learn AI. Build With It.</div>
          </div>
        </section>

      </div>
    `;

    // Attach client filter handler to window
    window.filterCatalogue = function(dimension, btnElement) {
      document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      if (btnElement) btnElement.classList.add('active');

      const gridEl = document.getElementById('learn-catalogue-grid');
      if (!gridEl) return;

      if (dimension === 'ALL') {
        gridEl.innerHTML = renderCatalogueCards(programmes);
      } else {
        const filtered = programmes.filter(p => p.capability_dimensions && p.capability_dimensions.includes(dimension));
        gridEl.innerHTML = renderCatalogueCards(filtered);
      }
    };

  } catch (err) {
    console.error('Error rendering Learn page:', err);
    containerEl.innerHTML = `
      <div class="empty-section-box">
        <h2 class="empty-title" style="color: #ff7070;">Unable to Load Learning Data</h2>
        <p class="empty-desc">${escapeHtml(err.message || 'Error connecting to database.')}</p>
        <button class="btn-primary-action inline-btn" onclick="window.location.reload()">RETRY CONNECTION</button>
      </div>
    `;
  }
}

/* --- Helper Renderers --- */

function renderContinueLearning(userProgress, programmes) {
  if (!userProgress || userProgress.length === 0) {
    return `
      <div class="start-journey-banner">
        <div class="banner-left">
          <span class="banner-tag">START YOUR AI JOURNEY</span>
          <h3 class="banner-title">Begin Your First Capability Pathway</h3>
          <p class="banner-desc">Choose a practical pathway and begin building the capabilities that will grow with your AI Passport.</p>
        </div>
        <div class="banner-right">
          <a class="btn-primary-action inline-btn" href="#learn-catalogue-grid">EXPLORE PATHWAYS →</a>
        </div>
      </div>
    `;
  }

  // Active item
  const activeItem = userProgress[0];
  const matchingProg = programmes.find(p => p.id === activeItem.programme_id || p.slug === activeItem.programme_id) || programmes[0];

  return `
    <div class="continue-learning-card">
      <div class="continue-header">
        <span class="continue-tag">CONTINUE LEARNING</span>
        <span class="continue-source">${formatSourceTag(matchingProg.source_type)}</span>
      </div>
      <div class="continue-body">
        <div class="continue-main-info">
          <h3 class="continue-title">${escapeHtml(matchingProg.title)}</h3>
          <div class="continue-module-label">Module 1 of 4 • Building Practical Workflows</div>
          <div class="continue-next-act">Next Activity: ${escapeHtml(matchingProg.build_outcome_title || 'Build first workflow')}</div>
        </div>
        <div class="continue-action-wrap">
          <a class="btn-primary-action inline-btn" href="${matchingProg.enrollment_url || '#'}" target="_blank">CONTINUE →</a>
        </div>
      </div>
    </div>
  `;
}

function renderYourPathways(userProgress, programmes) {
  if (!userProgress || userProgress.length === 0) {
    return `
      <div class="empty-section-compact">
        <span class="empty-compact-text">NO ENROLLED PATHWAYS YET. Explore the catalogue below to start your first pathway.</span>
        <a class="btn-text-link" href="#learn-catalogue-grid">EXPLORE LEARNING →</a>
      </div>
    `;
  }

  return `
    <div class="pathways-list-grid">
      ${userProgress.map(prog => {
        const matching = programmes.find(p => p.id === prog.programme_id || p.slug === prog.programme_id) || programmes[0];
        return `
          <div class="pathway-item-card">
            <div class="pathway-card-top">
              <span class="pathway-title">${escapeHtml(matching.title)}</span>
              <span class="pathway-status-pill status-${prog.state.toLowerCase()}">${prog.state}</span>
            </div>
            <div class="pathway-meta">${matching.provider_name} • ${matching.estimated_minutes ? `${Math.round(matching.estimated_minutes/60)} hours` : 'Self-paced'}</div>
            <div class="pathway-actions">
              <a class="btn-text-action" href="${matching.enrollment_url || '#'}" target="_blank">CONTINUE LEARNING →</a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderCatalogueCards(programmes) {
  if (!programmes || programmes.length === 0) {
    return `<div class="empty-compact-text" style="grid-column: 1/-1; padding: 20px; text-align: center;">No programmes match this capability filter.</div>`;
  }

  return programmes.map(p => `
    <div class="learning-programme-card">
      <div class="programme-card-top">
        <span class="source-badge badge-${p.source_type.toLowerCase().replace('_', '-')}">${formatSourceTag(p.source_type)}</span>
        <span class="format-label">${p.format ? p.format.replace('_', ' ') : 'SELF PACED'}</span>
      </div>

      <h3 class="programme-title">${escapeHtml(p.title)}</h3>
      <p class="programme-desc">${escapeHtml(p.short_description || p.description)}</p>

      <div class="programme-outcome-box">
        <span class="outcome-label">BUILD OUTCOME:</span>
        <span class="outcome-title">${escapeHtml(p.build_outcome_title || 'Practical Capability Evidence')}</span>
      </div>

      <div class="programme-card-bottom">
        <div class="programme-provider-text">${escapeHtml(p.provider_name)}</div>
        <div class="programme-dim-tags">
          ${(p.capability_dimensions || []).map(d => `<span class="dim-chip">${d}</span>`).join('')}
        </div>
        <a class="btn-secondary-action card-btn" href="${p.enrollment_url || '#'}" target="_blank">VIEW PATHWAY →</a>
      </div>
    </div>
  `).join('');
}

function renderSourceGroupCards(programmes) {
  if (!programmes || programmes.length === 0) {
    return `<div class="empty-compact-text" style="padding: 16px;">Catalogue update in progress. Check back soon.</div>`;
  }
  return renderCatalogueCards(programmes);
}

function computeRecommendation(userProgress, userCapabilities, programmes) {
  if (!programmes || programmes.length === 0) return null;

  if (!userProgress || userProgress.length === 0) {
    const foundational = programmes.find(p => p.level === 'FOUNDATIONAL' || p.capability_dimensions.includes('UNDERSTAND')) || programmes[0];
    return {
      title: foundational.title,
      why_reason: "You're beginning your AI Passport. Establish your practical foundation in AI capabilities and workflows.",
      capability_dimensions: foundational.capability_dimensions || ['UNDERSTAND', 'APPLY'],
      enrollment_url: foundational.enrollment_url
    };
  }

  const buildProg = programmes.find(p => p.capability_dimensions.includes('CREATE')) || programmes[0];
  return {
    title: buildProg.title,
    why_reason: "You've developed foundational understanding. This pathway helps you move from understanding AI to building practical workflows.",
    capability_dimensions: buildProg.capability_dimensions || ['APPLY', 'CREATE'],
    enrollment_url: buildProg.enrollment_url
  };
}

function formatSourceTag(sourceType) {
  switch(sourceType) {
    case 'PASSPORT_ORIGINAL': return 'AI PASSPORT ORIGINAL';
    case 'PASSPORT_LIVE': return 'AI PASSPORT LIVE';
    case 'PARTNER_PATHWAY': return 'CURATED PARTNER PATHWAY';
    default: return 'AI PASSPORT PATHWAY';
  }
}

function renderSkeleton() {
  return `
    <div class="overview-skeleton-wrapper">
      <div class="skeleton-box greeting-skeleton"></div>
      <div class="skeleton-box passport-skeleton"></div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
