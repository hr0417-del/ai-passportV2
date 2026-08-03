/* ==========================================================================
   MY AI PASSPORT™ — STAGE 2 OVERVIEW ENGINE
   ========================================================================== */

import { supabase } from '../lib/supabase.js';

export async function renderOverview(containerEl, user) {
  if (!containerEl || !user) return;

  // Render Skeleton Loading State first
  containerEl.innerHTML = renderSkeleton();

  try {
    // 1. Fetch All Overview Data in Parallel
    const [
      profileRes,
      passportRes,
      privacyRes,
      capabilityRes,
      learningRes,
      projectsRes,
      credentialsRes,
      journeyRes
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('passport_cards').select('*').eq('user_id', user.id).single(),
      supabase.from('privacy_settings').select('*').eq('user_id', user.id).single(),
      supabase.from('capability_states').select('*').eq('user_id', user.id),
      supabase.from('learning_progress').select('*').eq('user_id', user.id),
      supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('credentials').select('*').eq('user_id', user.id).order('issue_date', { ascending: false }).limit(3),
      supabase.from('journey_events').select('*').eq('user_id', user.id).order('occurred_at', { ascending: false }).limit(5)
    ]);

    const profile = profileRes.data || {};
    const passport = passportRes.data || {};
    const privacy = privacyRes.data || {};
    const capabilities = capabilityRes.data || [];
    const learning = learningRes.data || [];
    const projects = projectsRes.data || [];
    const credentials = credentialsRes.data || [];
    const journey = journeyRes.data || [];

    // Compute Greeting Time
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    if (hour >= 17 || hour < 5) timeOfDay = 'evening';

    const firstName = (profile.full_name || user.user_metadata?.full_name || user.email.split('@')[0]).split(' ')[0];

    // Compute Recommendation
    const nextMove = computeNextMove(learning, projects, credentials, capabilities);

    // Build Overview HTML
    containerEl.innerHTML = `
      <div class="overview-wrapper">
        
        <!-- 1. GREETING / IDENTITY -->
        <section class="overview-section greeting-section">
          <div class="greeting-header">
            <div class="greeting-tag">KEEP BUILDING</div>
            <h1 class="greeting-title">Good ${timeOfDay}, ${escapeHtml(firstName)}.</h1>
            <p class="greeting-sub">Your learning, projects, credentials, and AI capability — all in one place.</p>
          </div>
        </section>

        <!-- 2. DIGITAL AI PASSPORT -->
        <section class="overview-section passport-card-section">
          <div class="digital-passport-card">
            <div class="passport-card-flare"></div>
            <div class="passport-card-top">
              <div class="passport-brand-tag">🆔 DIGITAL AI PASSPORT™</div>
              <div class="passport-status-pill ${passport.status === 'ACTIVE' ? 'active' : ''}">
                🟢 ${passport.status || 'ACTIVATED'}
              </div>
            </div>

            <div class="passport-card-body">
              <div class="passport-avatar-box">
                <div class="passport-avatar-initials">${getInitials(profile.full_name || firstName)}</div>
              </div>
              <div class="passport-details-box">
                <h2 class="passport-user-name">${escapeHtml(profile.full_name || firstName)}</h2>
                <div class="passport-meta-grid">
                  <div class="meta-item">
                    <span class="meta-label">PASSPORT ID</span>
                    <span class="meta-value monospace-gold">${passport.passport_number || 'AIP-L1-2026-PENDING'}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">MEMBER SINCE</span>
                    <span class="meta-value">${formatDate(profile.created_at || passport.issue_date)}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">ACTIVATION</span>
                    <span class="meta-value">${passport.activation_status || 'ACTIVATED'}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">PATHWAY</span>
                    <span class="meta-value">Practical AI Builder</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="passport-card-footer">
              <span class="passport-ledger-text">AUTHENTICATED LEDGER RECORD • VERIFIED</span>
              <button class="btn-passport-cta" onclick="window.switchView('passport')">VIEW MY PASSPORT →</button>
            </div>
          </div>
        </section>

        <!-- 3. CONTINUE BUILDING + YOUR NEXT MOVE (2-Column Grid) -->
        <section class="overview-section two-col-grid">
          
          <!-- LEFT: CONTINUE BUILDING -->
          <div class="overview-card build-card">
            <div class="card-header-bar">
              <span class="card-section-label">CONTINUE BUILDING</span>
              <span class="card-status-dot"></span>
            </div>
            ${renderContinueBuilding(learning)}
          </div>

          <!-- RIGHT: YOUR NEXT MOVE -->
          <div class="overview-card next-move-card">
            <div class="card-header-bar">
              <span class="card-section-label">YOUR NEXT MOVE</span>
              <span class="dimension-badge">${nextMove.dimensionTag}</span>
            </div>
            <div class="next-move-content">
              <h3 class="next-move-title">${nextMove.title}</h3>
              <p class="next-move-desc">${nextMove.description}</p>
              
              <div class="next-challenge-box">
                <div class="challenge-meta">
                  <span class="challenge-label">NEXT CHALLENGE</span>
                  <span class="challenge-time">⏱️ ${nextMove.estimatedTime}</span>
                </div>
                <div class="challenge-name">${nextMove.challengeName}</div>
              </div>

              <button class="btn-primary-action" onclick="window.switchView('${nextMove.actionRoute}')">
                ${nextMove.actionLabel}
              </button>
            </div>
          </div>
        </section>

        <!-- 4. AI CAPABILITY SNAPSHOT -->
        <section class="overview-section capability-snapshot-section">
          <div class="section-header-block">
            <div>
              <h2 class="section-title">YOUR AI CAPABILITY</h2>
              <p class="section-subtitle">A snapshot of how your learning and verified work are developing your practical AI capability.</p>
            </div>
            <button class="btn-text-link" onclick="window.switchView('capability')">VIEW CAPABILITY PROFILE →</button>
          </div>

          <div class="capability-node-grid">
            ${renderCapabilityNodes(capabilities)}
          </div>
        </section>

        <!-- 5. WHAT YOU'VE BUILT -->
        <section class="overview-section projects-section">
          <div class="section-header-block">
            <div>
              <h2 class="section-title">WHAT YOU'VE BUILT</h2>
              <p class="section-subtitle">Your projects are evidence of what you can do with AI.</p>
            </div>
            <button class="btn-text-link" onclick="window.switchView('projects')">VIEW ALL PROJECTS →</button>
          </div>

          <div class="projects-grid">
            ${renderProjects(projects)}
          </div>
        </section>

        <!-- 6. RECENT ACHIEVEMENTS -->
        <section class="overview-section achievements-section">
          <div class="section-header-block">
            <div>
              <h2 class="section-title">RECENT ACHIEVEMENTS</h2>
              <p class="section-subtitle">Verified credentials, badges, and pathway certifications.</p>
            </div>
            <button class="btn-text-link" onclick="window.switchView('credentials')">VIEW ALL CREDENTIALS →</button>
          </div>

          <div class="credentials-grid">
            ${renderCredentials(credentials)}
          </div>
        </section>

        <!-- 7. YOUR AI JOURNEY -->
        <section class="overview-section journey-section">
          <div class="section-header-block">
            <div>
              <h2 class="section-title">YOUR AI JOURNEY</h2>
              <p class="section-subtitle">Your AI Passport grows with every meaningful milestone.</p>
            </div>
            <button class="btn-text-link" onclick="window.switchView('passport')">VIEW FULL JOURNEY →</button>
          </div>

          <div class="journey-timeline-container">
            ${renderJourneyTimeline(journey)}
          </div>
        </section>

      </div>
    `;
  } catch (err) {
    console.error('Error rendering Overview data:', err);
    containerEl.innerHTML = `
      <div class="stage1-placeholder-card">
        <h2 class="card-heading" style="color: #ff7070;">Unable to Load Overview Data</h2>
        <p class="card-body-text">${escapeHtml(err.message || 'Error connecting to database.')}</p>
        <button class="auth-submit-btn" onclick="window.location.reload()">RETRY CONNECTION</button>
      </div>
    `;
  }
}

/* --- Sub-render Helpers --- */

function renderContinueBuilding(learningList) {
  const active = learningList.find(l => l.state !== 'ADVANCE');
  
  if (active) {
    return `
      <div class="build-active-content">
        <h3 class="build-course-title">${escapeHtml(active.programme_id || 'AI Systems Professional')}</h3>
        <div class="build-module-tag">Module ${escapeHtml(active.module_id || '01')}</div>
        <div class="build-progress-wrap">
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: 45%;"></div></div>
          <span class="progress-text">In Progress</span>
        </div>
        <button class="btn-secondary-action" onclick="window.switchView('learn')">CONTINUE BUILDING →</button>
      </div>
    `;
  }

  // Intentional Empty State
  return `
    <div class="empty-card-body">
      <div class="empty-icon">🔨</div>
      <h3 class="empty-title">READY TO BUILD SOMETHING?</h3>
      <p class="empty-desc">Choose your next learning pathway or project to start developing practical capability.</p>
      <button class="btn-primary-action" onclick="window.switchView('learn')">EXPLORE LEARNING →</button>
    </div>
  `;
}

function renderCapabilityNodes(capabilities) {
  const defaultDimensions = [
    { dimension: 'UNDERSTAND', label: 'Understand', state: 'EXPLORE', evidenceCount: 0 },
    { dimension: 'APPLY', label: 'Apply', state: 'EXPLORE', evidenceCount: 0 },
    { dimension: 'CREATE', label: 'Create', state: 'EXPLORE', evidenceCount: 0 },
    { dimension: 'EVALUATE', label: 'Evaluate', state: 'EXPLORE', evidenceCount: 0 },
    { dimension: 'RESPONSIBLE', label: 'Responsible', state: 'EXPLORE', evidenceCount: 0 }
  ];

  const map = {};
  capabilities.forEach(c => { map[c.dimension] = c; });

  return defaultDimensions.map(d => {
    const item = map[d.dimension] || d;
    const count = (item.evidence_ids && Array.isArray(item.evidence_ids)) ? item.evidence_ids.length : 0;
    
    return `
      <div class="capability-node-card">
        <div class="node-dim-name">${item.dimension}</div>
        <div class="node-state-tag state-${item.state.toLowerCase()}">${item.state}</div>
        <div class="node-evidence-count">${count} EVIDENCE ${count === 1 ? 'ITEM' : 'ITEMS'}</div>
      </div>
    `;
  }).join('');
}

function renderProjects(projects) {
  if (!projects || projects.length === 0) {
    return `
      <div class="empty-section-box">
        <div class="empty-title">YOUR FIRST BUILD STARTS HERE.</div>
        <p class="empty-desc">Turn what you're learning into something real. Projects are evidence of practical capability.</p>
        <button class="btn-primary-action inline-btn" onclick="window.switchView('projects')">START A PROJECT →</button>
      </div>
    `;
  }

  return projects.map(p => `
    <div class="project-item-card">
      <div class="project-card-top">
        <h3 class="project-title">${escapeHtml(p.title)}</h3>
        <span class="project-status-tag status-${(p.status || 'IN_PROGRESS').toLowerCase()}">${p.status || 'IN_PROGRESS'}</span>
      </div>
      <p class="project-desc">${escapeHtml(p.description || 'Practical AI capability build.')}</p>
      <div class="project-card-bottom">
        <div class="project-tags">
          ${(p.capability_dimensions || ['CREATE']).map(dim => `<span class="dim-chip">${dim}</span>`).join('')}
        </div>
        <button class="btn-text-action" onclick="window.switchView('projects')">VIEW PROJECT →</button>
      </div>
    </div>
  `).join('');
}

function renderCredentials(credentials) {
  if (!credentials || credentials.length === 0) {
    return `
      <div class="empty-section-box">
        <div class="empty-title">YOUR ACHIEVEMENTS WILL APPEAR HERE.</div>
        <p class="empty-desc">Complete programmes, build projects, and demonstrate capability to grow your AI Passport wallet.</p>
      </div>
    `;
  }

  return credentials.map(c => `
    <div class="credential-item-card">
      <div class="cred-badge-icon">🛡️</div>
      <div class="cred-info">
        <h4 class="cred-title">${escapeHtml(c.title)}</h4>
        <div class="cred-meta">${c.badge_type || 'FOUNDATION'} • Issued ${formatDate(c.issue_date)}</div>
      </div>
      <span class="cred-verified-tag">✓ VERIFIED</span>
    </div>
  `).join('');
}

function renderJourneyTimeline(journey) {
  if (!journey || journey.length === 0) {
    return `
      <div class="journey-timeline-empty">
        <div class="journey-dot"></div>
        <div class="journey-text">Joined AI Passport Ecosystem</div>
      </div>
    `;
  }

  return `
    <div class="journey-timeline-list">
      ${journey.map(e => `
        <div class="journey-timeline-item">
          <div class="journey-marker"></div>
          <div class="journey-content">
            <span class="journey-date">${formatDate(e.occurred_at)}</span>
            <h4 class="journey-event-title">${escapeHtml(e.title)}</h4>
            ${e.description ? `<p class="journey-event-desc">${escapeHtml(e.description)}</p>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function computeNextMove(learning, projects, credentials, capabilities) {
  if (!learning || learning.length === 0) {
    return {
      dimensionTag: 'STRENGTHEN UNDERSTAND',
      title: 'Begin Your First Pathway',
      description: 'Establish your practical foundation by enrolling in your first AI capability module.',
      challengeName: 'Practical AI Capabilities & Foundations',
      estimatedTime: '2 hours',
      actionLabel: 'EXPLORE LEARNING →',
      actionRoute: 'learn'
    };
  }

  const activeLearning = learning.find(l => l.state !== 'ADVANCE');
  if (activeLearning) {
    return {
      dimensionTag: 'DEVELOP APPLY',
      title: 'Continue Active Module',
      description: 'You are currently developing your ability to build and deploy AI systems.',
      challengeName: `Complete Module: ${activeLearning.module_id}`,
      estimatedTime: '3 hours',
      actionLabel: 'CONTINUE LEARNING →',
      actionRoute: 'learn'
    };
  }

  if (projects.length === 0) {
    return {
      dimensionTag: 'DEMONSTRATE CREATE',
      title: 'Build Your First Project',
      description: 'Turn your learning into verifiable proof. Build an agent or RAG pipeline.',
      challengeName: 'Build & Deploy AI Assistant',
      estimatedTime: '4 hours',
      actionLabel: 'START BUILDING →',
      actionRoute: 'projects'
    };
  }

  return {
    dimensionTag: 'ADVANCE EVALUATE',
    title: 'Submit Project Evidence',
    description: 'Document your codebase and submit repo links for peer verification.',
    challengeName: 'Verify Autonomous Agent System',
    estimatedTime: '1 hour',
    actionLabel: 'ADD EVIDENCE →',
    actionRoute: 'projects'
  };
}

function renderSkeleton() {
  return `
    <div class="overview-skeleton-wrapper">
      <div class="skeleton-box greeting-skeleton"></div>
      <div class="skeleton-box passport-skeleton"></div>
      <div class="skeleton-grid-2">
        <div class="skeleton-box card-skel"></div>
        <div class="skeleton-box card-skel"></div>
      </div>
    </div>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Aug 2026';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch(e) {
    return '2026';
  }
}

function getInitials(nameStr) {
  if (!nameStr) return 'VB';
  const parts = nameStr.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
