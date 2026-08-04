/* ==========================================================================
   MY AI PASSPORT™ — STAGE 4 LEARN PAGE ENGINE (UX REFINEMENT PASS)
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
    is_partner: false,
    capability_dimensions: ['UNDERSTAND', 'APPLY', 'RESPONSIBLE'],
    estimated_minutes: 240,
    level: 'FOUNDATIONAL',
    build_outcome_title: 'Personal AI Capability Workspace',
    why_recommended: "You're beginning your AI Passport journey. This pathway establishes the foundation for the capabilities you'll build and demonstrate later.",
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
    is_partner: false,
    capability_dimensions: ['APPLY', 'CREATE', 'EVALUATE'],
    estimated_minutes: 360,
    level: 'INTERMEDIATE',
    build_outcome_title: 'Automated AI Research & Reporting Agent',
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
    is_partner: false,
    capability_dimensions: ['CREATE', 'EVALUATE'],
    estimated_minutes: 180,
    level: 'INTERMEDIATE',
    build_outcome_title: 'Multi-Agent Systems Pipeline',
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
    provider_name: 'Anthropic Research',
    is_partner: true,
    capability_dimensions: ['EVALUATE', 'RESPONSIBLE'],
    estimated_minutes: 300,
    level: 'ADVANCED',
    build_outcome_title: 'Model Evaluation & Hallucination Benchmark',
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
      supabase.from('learning_progress').select('*').eq('user_id', user.id),
      supabase.from('programmes').select('*').eq('publication_status', 'PUBLISHED'),
      supabase.from('capability_states').select('*').eq('user_id', user.id)
    ]) : [{ data: [] }, { data: [] }, { data: [] }];

    let userProgress = (progressRes && progressRes.data) || [];
    const dbProgrammes = (dbProgrammesRes && dbProgrammesRes.data) || [];
    const userCapabilities = (capabilityRes && capabilityRes.data) || [];

    if (!userProgress || userProgress.length === 0) {
      userProgress = [
        { programme_id: 'foundations-of-practical-ai', module_id: 'mod-1', state: 'DEMONSTRATE', completed_at: '2026-07-10' },
        { programme_id: 'ai-automation-pro', module_id: 'mod-1', state: 'DEVELOP', completed_at: null }
      ];
    }

    // Use DB programmes if present, else fallback to DEVELOPMENT_FIXTURES
    const programmes = dbProgrammes.length > 0 ? dbProgrammes : DEVELOPMENT_FIXTURES;

    let currentSourceFilter = 'ALL';
    let currentCapabilityFilter = 'ALL';

    containerEl.innerHTML = `
      <div class="learn-page-wrapper">
        
        <!-- LAYER 1: HERO SECTION -->
        <section class="learn-section hero-section">
          <div class="hero-tag">LEARN</div>
          <h1 class="hero-title">LEARN AI.<br>BUILD CAPABILITY.</h1>
          <p class="hero-sub">Practical learning pathways designed to help you understand AI, apply it, build with it, and demonstrate what you can do.</p>
          <div class="hero-micro-line">Every learning experience contributes to your evolving AI Passport.</div>
        </section>

        <!-- LAYER 2: MERGED "YOUR NEXT MOVE" / "CONTINUE BUILDING" -->
        <section class="learn-section">
          ${renderNextMoveCard(userProgress, userCapabilities, programmes)}
        </section>

        <!-- LAYER 3: YOUR PATHWAYS -->
        <section class="learn-section pathways-section">
          <div class="section-header-left margin-bot-12">
            <h2 class="section-title">YOUR PATHWAYS</h2>
            <p class="section-subtitle">Learning journeys you've started or completed as part of your AI Passport.</p>
          </div>

          ${renderYourPathways(userProgress, programmes)}
        </section>

        <!-- LAYER 4: CONSOLIDATED LEARNING DISCOVERY (SINGLE MASTER CATALOGUE) -->
        <section class="learn-section explore-section" id="section-explore-ecosystem">
          <div class="section-header-block margin-bot-16">
            <div class="section-header-left">
              <h2 class="section-title">EXPLORE THE ECOSYSTEM</h2>
              <p class="section-subtitle">Discover practical learning across AI Passport Originals, live experiences, and carefully curated external pathways.</p>
            </div>
          </div>

          <!-- Dual Filter Bar (Source & Capability) -->
          <div class="filter-controls-wrapper">
            <div class="filter-group">
              <span class="filter-group-label">SOURCE:</span>
              <button class="filter-chip active" onclick="window.filterSource('ALL', this)">ALL</button>
              <button class="filter-chip" onclick="window.filterSource('PASSPORT_ORIGINAL', this)">AI PASSPORT ORIGINALS</button>
              <button class="filter-chip" onclick="window.filterSource('PASSPORT_LIVE', this)">AI PASSPORT LIVE</button>
              <button class="filter-chip" onclick="window.filterSource('PARTNER_PATHWAY', this)">PARTNER PATHWAYS</button>
            </div>

            <div class="filter-group margin-top-8">
              <span class="filter-group-label">CAPABILITY:</span>
              <button class="filter-chip active" onclick="window.filterCapability('ALL', this)">ALL</button>
              <button class="filter-chip" onclick="window.filterCapability('UNDERSTAND', this)">UNDERSTAND</button>
              <button class="filter-chip" onclick="window.filterCapability('APPLY', this)">APPLY</button>
              <button class="filter-chip" onclick="window.filterCapability('CREATE', this)">CREATE</button>
              <button class="filter-chip" onclick="window.filterCapability('EVALUATE', this)">EVALUATE</button>
              <button class="filter-chip" onclick="window.filterCapability('RESPONSIBLE', this)">RESPONSIBLE</button>
            </div>
          </div>

          <!-- Master Catalogue Grid -->
          <div class="catalogue-grid" id="learn-catalogue-grid">
            ${renderCatalogueCards(programmes)}
          </div>
        </section>

        <!-- LAYER 5: EDUCATIONAL PIPELINE CONCLUSION -->
        <section class="learn-section philosophy-section">
          <div class="philosophy-container">
            <div class="section-header-left margin-bot-16">
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

    // Attach client filter handlers to window
    window.filterSource = function(srcType, btnElement) {
      currentSourceFilter = srcType;
      btnElement.parentElement.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      btnElement.classList.add('active');
      applyCombinedFilters();
    };

    window.filterCapability = function(dim, btnElement) {
      currentCapabilityFilter = dim;
      btnElement.parentElement.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      btnElement.classList.add('active');
      applyCombinedFilters();
    };

    function applyCombinedFilters() {
      const gridEl = document.getElementById('learn-catalogue-grid');
      if (!gridEl) return;

      let filtered = programmes;

      if (currentSourceFilter !== 'ALL') {
        filtered = filtered.filter(p => p.source_type === currentSourceFilter);
      }

      if (currentCapabilityFilter !== 'ALL') {
        filtered = filtered.filter(p => p.capability_dimensions && p.capability_dimensions.includes(currentCapabilityFilter));
      }

      gridEl.innerHTML = renderCatalogueCards(filtered);
    }

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

function renderNextMoveCard(userProgress, userCapabilities, programmes) {
  // If active progress exists, render CONTINUE BUILDING
  if (userProgress && userProgress.length > 0) {
    const activeItem = userProgress[0];
    const matchingProg = programmes.find(p => p.id === activeItem.programme_id || p.slug === activeItem.programme_id) || programmes[0];

    return `
      <div class="next-move-card">
        <div class="next-move-left">
          <span class="next-move-tag">CONTINUE BUILDING</span>
          <h3 class="next-move-title">${escapeHtml(matchingProg.title)}</h3>
          <p class="next-move-desc">Current Activity: ${escapeHtml(matchingProg.build_outcome_title || 'Building practical workflow')}</p>
          <div class="rec-meta">
            <span class="rec-focus-label">Capability Focus:</span>
            <div class="dim-tags">
              ${(matchingProg.capability_dimensions || ['UNDERSTAND', 'APPLY']).map(d => `<span class="dim-chip">${d}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="next-move-right">
          <a class="btn-primary-action" href="${matchingProg.enrollment_url || '#'}" target="_blank">CONTINUE →</a>
        </div>
      </div>
    `;
  }

  // New learner onboarding recommendation
  const defaultFoundational = programmes.find(p => p.level === 'FOUNDATIONAL' || p.capability_dimensions.includes('UNDERSTAND')) || programmes[0];

  return `
    <div class="next-move-card">
      <div class="next-move-left">
        <span class="next-move-tag">YOUR NEXT MOVE</span>
        <h3 class="next-move-title">Begin with ${escapeHtml(defaultFoundational.title)}</h3>
        <p class="next-move-desc">Build the practical foundation for your AI Passport across Understand, Apply, and Responsible.</p>

        <div class="why-this-box">
          <span class="why-label">WHY THIS?</span>
          <span class="why-text">${escapeHtml(defaultFoundational.why_recommended || "You're beginning your AI Passport journey. This pathway establishes the foundation for the capabilities you'll build and demonstrate later.")}</span>
        </div>

        <div class="rec-meta">
          <span class="rec-focus-label">Capability Focus:</span>
          <div class="dim-tags">
            ${(defaultFoundational.capability_dimensions || ['UNDERSTAND', 'APPLY', 'RESPONSIBLE']).map(d => `<span class="dim-chip">${d}</span>`).join('')}
          </div>
        </div>
      </div>
      
      <div class="next-move-right">
        <a class="btn-primary-action" href="${defaultFoundational.enrollment_url || '#'}" target="_blank">START PATHWAY →</a>
        <a class="btn-secondary-action" href="#section-explore-ecosystem">EXPLORE ALL PATHWAYS</a>
      </div>
    </div>
  `;
}

function renderYourPathways(userProgress, programmes) {
  if (!userProgress || userProgress.length === 0) {
    return `
      <div class="empty-section-compact">
        <span class="empty-compact-text">No pathways started yet. Your first pathway will appear here once you begin.</span>
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
    return `<div class="empty-compact-text" style="grid-column: 1/-1; padding: 20px; text-align: center;">No learning pathways match the selected filters.</div>`;
  }

  return programmes.map(p => `
    <div class="learning-programme-card compact-card">
      <div>
        <div class="programme-card-top">
          <span class="source-badge badge-${p.source_type.toLowerCase().replace('_', '-')}">${formatSourceTag(p.source_type)}</span>
          <span class="format-label">${p.format ? p.format.replace('_', ' ') : 'SELF PACED'}</span>
        </div>

        <h3 class="programme-title">${escapeHtml(p.title)}</h3>
        <p class="programme-desc">${escapeHtml(p.short_description || p.description)}</p>

        <div class="programme-build-row">
          <span class="build-row-label">BUILD:</span>
          <span class="build-row-title">${escapeHtml(p.build_outcome_title || 'Practical Capability Evidence')}</span>
        </div>
      </div>

      <div class="programme-card-bottom">
        <div class="programme-attribution">
          ${formatAttribution(p)}
        </div>
        
        <div class="programme-dim-tags">
          ${(p.capability_dimensions || []).map(d => `<span class="dim-chip">${d}</span>`).join('')}
        </div>
        
        <a class="btn-secondary-action card-btn" href="${p.enrollment_url || '#'}" target="_blank">VIEW PATHWAY →</a>
      </div>
    </div>
  `).join('');
}

function formatSourceTag(sourceType) {
  switch(sourceType) {
    case 'PASSPORT_ORIGINAL': return 'AI PASSPORT ORIGINAL';
    case 'PASSPORT_LIVE': return 'AI PASSPORT LIVE';
    case 'PARTNER_PATHWAY': return 'CURATED PARTNER PATHWAY';
    default: return 'AI PASSPORT PATHWAY';
  }
}

function formatAttribution(programme) {
  if (programme.source_type === 'PARTNER_PATHWAY') {
    if (programme.is_partner) {
      return `LEARNING PARTNER: <strong style="color:#ffffff;">${escapeHtml(programme.provider_name)}</strong>`;
    }
    return `CURATED FROM: <strong style="color:#ffffff;">${escapeHtml(programme.provider_name)}</strong>`;
  }
  return `Delivered by <strong style="color:#ffffff;">${escapeHtml(programme.provider_name || 'AI PASSPORT ACADEMY™')}</strong>`;
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
