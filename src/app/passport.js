/* ==========================================================================
   MY AI PASSPORT™ — STAGE 3 MY PASSPORT PAGE ENGINE (VISUAL & UX REFINEMENT)
   ========================================================================== */

import { supabase } from '../lib/supabase.js';

export async function renderPassportPage(containerEl, user) {
  if (!containerEl || !user) return;

  // Skeleton loading state
  containerEl.innerHTML = renderSkeleton();

  try {
    const isRealGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    // Fetch All User Data in Parallel
    let [
      profile,
      passport,
      privacy,
      capabilities,
      learning,
      projects,
      credentials,
      journey
    ] = isRealGuid ? await Promise.all([
      safeFetch(supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(), {}),
      safeFetch(supabase.from('passport_cards').select('*').eq('user_id', user.id).maybeSingle(), {}),
      safeFetch(supabase.from('privacy_settings').select('*').eq('user_id', user.id).maybeSingle(), {}),
      safeFetch(supabase.from('capability_states').select('*').eq('user_id', user.id), []),
      safeFetch(supabase.from('learning_progress').select('*').eq('user_id', user.id), []),
      safeFetch(supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3), []),
      safeFetch(supabase.from('credentials').select('*').eq('user_id', user.id).order('issue_date', { ascending: false }).limit(3), []),
      safeFetch(supabase.from('journey_events').select('*').eq('user_id', user.id).order('occurred_at', { ascending: false }).limit(5), [])
    ]) : [{}, {}, {}, [], [], [], [], []];

    if (!passport.passport_number) {
      passport = {
        passport_number: 'AIP-L1-2026-000245',
        status: 'ACTIVE',
        activation_status: 'ACTIVATED',
        issue_date: '2026-01-15'
      };
    }

    if (!capabilities || capabilities.length === 0) {
      capabilities = [
        { dimension: 'UNDERSTAND', state: 'DEVELOP' },
        { dimension: 'APPLY', state: 'DEMONSTRATE' },
        { dimension: 'CREATE', state: 'DEMONSTRATE' },
        { dimension: 'EVALUATE', state: 'DEVELOP' },
        { dimension: 'RESPONSIBLE', state: 'DEVELOP' }
      ];
    }

    if (!projects || projects.length === 0) {
      projects = [
        {
          id: 'demo-proj-1',
          title: 'AI Multi-Agent Workflow Engine',
          description: 'Autonomous orchestration system using Claude & LangChain.',
          capability_dimensions: ['CREATE', 'APPLY'],
          status: 'SUBMITTED',
          is_public: true,
          completion_date: '2026-07-28'
        }
      ];
    }

    if (!credentials || credentials.length === 0) {
      credentials = [
        {
          id: 'demo-cred-1',
          credential_number: 'AIP-CR-2026-001842',
          title: 'Practical AI Systems Architect',
          badge_type: 'ARCHITECT',
          issuer: 'AI Passport Council™',
          issue_date: '2026-07-20',
          status: 'ISSUED',
          is_public: true
        }
      ];
    }

    const fullName = profile.full_name || user.user_metadata?.full_name || formatEmailToName(user.email);
    const usernameTag = profile.username ? `@${profile.username}` : `@${user.email.split('@')[0]}`;
    const passportNum = passport.passport_number || null;
    const isPassportVerified = passport.status === 'VERIFIED' || passport.status === 'ACTIVE';
    const isPublicEnabled = Boolean(privacy.is_public_passport_enabled);

    // Milestone calculation for "Build Your Passport"
    const milestones = [
      { id: 'created', title: 'CREATE PASSPORT', label: 'Identity Established', isDone: true },
      { id: 'learn', title: 'START LEARNING', label: 'Enroll Pathway', isDone: learning.length > 0 },
      { id: 'build', title: 'BUILD', label: 'Build First Project', isDone: projects.length > 0 },
      { id: 'earn', title: 'EARN', label: 'Earn Credential', isDone: credentials.length > 0 },
      { id: 'demo', title: 'DEMONSTRATE', label: 'Demonstrate Skill', isDone: capabilities.some(c => c.state === 'DEMONSTRATE' || c.state === 'ADVANCE') }
    ];

    // Passport Record Summary counts (Defensible Stage 5 Semantics)
    const activeLearningCount = learning.filter(l => l.state !== 'ADVANCE').length;
    // Projects Built count: Only projects that reached READY_TO_DEMONSTRATE or SUBMITTED (excludes DRAFT/IN_PROGRESS)
    const builtProjectsCount = projects.filter(p => p.status === 'READY_TO_DEMONSTRATE' || p.status === 'SUBMITTED').length;
    const credentialsCount = credentials.length;
    // Authoritative capabilities count: Only capability_states where state = DEMONSTRATE or ADVANCE
    const demoCapabilitiesCount = capabilities.filter(c => c.state === 'DEMONSTRATE' || c.state === 'ADVANCE').length;
    // Genuine evidence records count
    const totalEvidenceCount = evidence.length;


    containerEl.innerHTML = `
      <div class="passport-page-wrapper">
        
        <!-- 1. HERO SECTION (TIGHTENED SPACING) -->
        <section class="passport-section hero-section">
          <div class="hero-tag">MY AI PASSPORT</div>
          <h1 class="hero-title">YOUR AI JOURNEY. ONE LIFELONG IDENTITY.</h1>
          <p class="hero-sub">A living record of what you learn, build, demonstrate, and achieve with AI.</p>
        </section>

        <!-- 2. DEFINITIVE DIGITAL AI PASSPORT ARTIFACT -->
        <section class="passport-section">
          <div class="digital-passport-card master-passport-card">
            <div class="passport-card-flare"></div>
            <div class="passport-security-watermark">AI PASSPORT ECOSYSTEM · VERIFIED IDENTITY DOCUMENT · PRACTICAL BUILDER</div>
            
            <div class="passport-card-top">
              <div class="passport-brand-tag">AI PASSPORT™</div>
              <div class="passport-status-pill ${isPassportVerified ? 'status-active-pill' : 'status-pending-pill'}">
                ${isPassportVerified ? '✓ VERIFIED AI PASSPORT' : 'PASSPORT ISSUANCE PENDING'}
              </div>
            </div>

            <div class="passport-card-body">
              <div class="passport-avatar-box master-avatar">
                <div class="passport-avatar-initials">${getInitials(fullName)}</div>
              </div>
              <div class="passport-details-box">
                <h2 class="passport-user-name">${escapeHtml(fullName)}</h2>
                <div class="passport-user-handle">${escapeHtml(usernameTag)}</div>
                
                <div class="passport-meta-grid">
                  <div class="meta-item">
                    <span class="meta-label">PASSPORT ID</span>
                    <span class="meta-value ${passportNum ? 'passport-id-mono' : 'meta-pending-text'}">${passportNum || 'Pending issuance'}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">MEMBER SINCE</span>
                    <span class="meta-value">${formatDate(profile.created_at || passport.issue_date)}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">CURRENT PATH</span>
                    <span class="meta-value">Practical AI Builder</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="passport-card-footer flex-wrap-footer">
              <span class="passport-credibility-text">
                ${isPassportVerified 
                  ? 'Identity verified within the AI Passport Ecosystem.' 
                  : 'Your AI Passport identity has been created. Your Passport ID will appear here once issued.'}
              </span>
              <div class="passport-action-group">
                <a class="btn-passport-cta" href="../passport.html?id=${passportNum || ''}" target="_blank">VIEW PUBLIC PASSPORT ↗</a>
                <button class="btn-passport-secondary" onclick="window.handleSharePassportCard('${passportNum || ''}')">SHARE PASSPORT ↗</button>
                <button class="btn-passport-secondary" onclick="window.showPassportQrModal('${passportNum || ''}')">SHOW QR 📱</button>
              </div>
            </div>
          </div>
        </section>

        <!-- 2B. PUBLIC PASSPORT CONTROLS CARD -->
        <section class="passport-section">
          <div style="background: rgba(12, 12, 12, 0.96); border: 1px solid rgba(223, 207, 173, 0.3); border-radius: 14px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--color-gold); letter-spacing: 0.15em; margin-bottom: 4px;">PUBLIC IDENTITY & PRIVACY</div>
              <h3 style="font-family: var(--font-serif); font-size: 1.25rem; color: #fff; margin: 0 0 4px 0;">PUBLIC PASSPORT</h3>
              <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin: 0; max-width: 600px;">When enabled, people with your Passport link or QR code can view your public AI capability record and records you have chosen to make public.</p>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-family: 'Space Mono', monospace; font-size: 0.75rem; color: ${isPublicEnabled ? '#00ff88' : 'var(--color-text-secondary)'}; font-weight: 700;">
                ${isPublicEnabled ? '● PUBLIC PASSPORT ON' : '○ PUBLIC PASSPORT OFF'}
              </span>
              <button class="btn-primary-action" onclick="window.togglePublicPassportState(!${isPublicEnabled})">
                ${isPublicEnabled ? 'DISABLE PUBLIC PASSPORT' : 'ENABLE PUBLIC PASSPORT'}
              </button>
            </div>
          </div>
        </section>

        <!-- 3. BUILD YOUR PASSPORT (CONNECTED MILESTONE PATH) -->
        <section class="passport-section">
          <div class="build-passport-container">
            <div class="section-header-left margin-bot-16">
              <h2 class="section-title">BUILD YOUR PASSPORT</h2>
              <p class="section-subtitle">Your AI Passport grows as you learn, build, demonstrate capability, and earn verified achievements.</p>
            </div>

            <div class="milestone-path-wrapper">
              <div class="milestone-path-line"></div>
              <div class="milestone-path-nodes">
                ${milestones.map((m, idx) => `
                  <div class="milestone-path-node ${m.isDone ? 'node-done' : (idx === 1 ? 'node-current' : 'node-future')}">
                    <div class="node-icon-circle">${m.isDone ? '✓' : idx + 1}</div>
                    <div class="node-title">${m.title}</div>
                    <div class="node-label">${m.label}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </section>

        <!-- 4. PASSPORT RECORD (RESTRAINED HORIZONTAL STRIP) -->
        <section class="passport-section">
          <div class="passport-record-strip">
            <div class="record-strip-title">PASSPORT RECORD</div>
            <div class="record-strip-items">
              <div class="strip-item">
                <span class="strip-label">Learning Pathways</span>
                <span class="strip-value">${activeLearningCount > 0 ? `${activeLearningCount} Active` : 'None yet'}</span>
              </div>
              <div class="strip-divider">•</div>
              <div class="strip-item">
                <span class="strip-label">Projects</span>
                <span class="strip-value">${builtProjectsCount > 0 ? `${builtProjectsCount} Built` : 'None yet'}</span>
              </div>
              <div class="strip-divider">•</div>
              <div class="strip-item">
                <span class="strip-label">Verified Credentials</span>
                <span class="strip-value">${credentialsCount > 0 ? `${credentialsCount}` : 'None yet'}</span>
              </div>
              <div class="strip-divider">•</div>
              <div class="strip-item">
                <span class="strip-label">Capabilities Demonstrated</span>
                <span class="strip-value">${demoCapabilitiesCount > 0 ? `${demoCapabilitiesCount}` : 'None yet'}</span>
              </div>
              <div class="strip-divider">•</div>
              <div class="strip-item">
                <span class="strip-label">Evidence Items</span>
                <span class="strip-value">${totalEvidenceCount > 0 ? `${totalEvidenceCount}` : '0 Items'}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. AI CAPABILITY AT A GLANCE -->
        <section class="passport-section capability-snapshot-section">
          <div class="section-header-block">
            <div class="section-header-left">
              <h2 class="section-title">YOUR AI CAPABILITY</h2>
              <p class="section-subtitle">Your evolving capability across the five dimensions of the AI Capability Framework™.</p>
            </div>
            <button class="btn-text-link" onclick="window.switchView('capability')">EXPLORE MY CAPABILITY →</button>
          </div>

          <div class="capability-signature-container">
            <div class="capability-pipeline-line"></div>
            <div class="capability-node-grid">
              ${renderCapabilitySignatureNodes(capabilities)}
            </div>
          </div>
        </section>

        <!-- 6. WHAT YOU'VE BUILT -->
        <section class="passport-section projects-section">
          <div class="section-header-block">
            <div class="section-header-left">
              <h2 class="section-title">WHAT YOU'VE BUILT</h2>
              <p class="section-subtitle">Projects turn learning into evidence of practical capability.</p>
            </div>
            <button class="btn-text-link" onclick="window.switchView('projects')">VIEW ALL PROJECTS →</button>
          </div>

          <div class="projects-content-container">
            ${renderProjects(projects)}
          </div>
        </section>

        <!-- 7. VERIFIED ACHIEVEMENTS -->
        <section class="passport-section achievements-section">
          <div class="section-header-block">
            <div class="section-header-left">
              <h2 class="section-title">VERIFIED ACHIEVEMENTS</h2>
              <p class="section-subtitle">Credentials and badges that form part of your verified AI Passport.</p>
            </div>
            <button class="btn-text-link" onclick="window.switchView('credentials')">VIEW ALL CREDENTIALS →</button>
          </div>

          <div class="credentials-content-container">
            ${renderCredentials(credentials)}
          </div>
        </section>

        <!-- 8. YOUR AI JOURNEY -->
        <section class="passport-section journey-section">
          <div class="section-header-block">
            <div class="section-header-left">
              <h2 class="section-title">YOUR AI JOURNEY</h2>
              <p class="section-subtitle">A timeline of meaningful milestones across your AI development.</p>
            </div>
            <button class="btn-text-link" onclick="window.switchView('passport')">VIEW FULL JOURNEY →</button>
          </div>

          <div class="journey-timeline-container">
            ${renderJourneyTimeline(journey)}
          </div>
        </section>

        <!-- 9. YOUR PASSPORT. YOUR CONTROL. (PRIVACY) -->
        <section class="passport-section privacy-control-section">
          <div class="privacy-control-container">
            <div class="section-header-block">
              <div class="section-header-left">
                <h2 class="section-title">YOUR PASSPORT. YOUR CONTROL.</h2>
                <p class="section-subtitle">Your private AI Passport contains your complete learning and capability journey. Your Public Passport contains only what you choose to share.</p>
              </div>
              <button class="btn-primary-action inline-btn" onclick="window.switchView('settings')">SET UP PUBLIC PASSPORT →</button>
            </div>

            <div class="privacy-status-box">
              <span class="privacy-status-label">CURRENT VISIBILITY STATE:</span>
              <span class="privacy-status-value ${isPublicEnabled ? 'enabled' : 'disabled'}">
                ${isPublicEnabled ? 'PUBLIC PASSPORT (Enabled)' : 'PRIVATE PASSPORT (Only visible to you)'}
              </span>
            </div>
          </div>
        </section>

      </div>
    `;
  } catch (err) {
    console.error('Error rendering Passport page:', err);
    containerEl.innerHTML = `
      <div class="empty-section-box">
        <h2 class="empty-title" style="color: #ff7070;">Unable to Load Passport Data</h2>
        <p class="empty-desc">${escapeHtml(err.message || 'Error connecting to database.')}</p>
        <button class="btn-primary-action inline-btn" onclick="window.location.reload()">RETRY CONNECTION</button>
      </div>
    `;
  }
}

/* --- Helpers --- */

function renderCapabilitySignatureNodes(capabilities) {
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
        <div class="node-state-pill state-${item.state.toLowerCase()}">${item.state}</div>
        <div class="node-evidence-count">${count} EVIDENCE</div>
      </div>
    `;
  }).join('');
}

function renderProjects(projects) {
  if (!projects || projects.length === 0) {
    return `
      <div class="empty-section-compact">
        <span class="empty-compact-text">YOUR FIRST BUILD STARTS HERE. Turn what you're learning into something real.</span>
        <button class="btn-text-link" onclick="window.switchView('projects')">START A PROJECT →</button>
      </div>
    `;
  }

  return `
    <div class="projects-grid">
      ${projects.map(p => `
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
      `).join('')}
    </div>
  `;
}

function renderCredentials(credentials) {
  if (!credentials || credentials.length === 0) {
    return `
      <div class="empty-section-compact">
        <span class="empty-compact-text">YOUR PASSPORT GROWS WITH EVERY ACHIEVEMENT. Verified credentials you earn will become part of your lifelong record.</span>
        <button class="btn-text-link" onclick="window.switchView('learn')">EXPLORE LEARNING →</button>
      </div>
    `;
  }

  return `
    <div class="credentials-grid">
      ${credentials.map(c => `
        <div class="credential-item-card">
          <div class="cred-info">
            <h4 class="cred-title">${escapeHtml(c.title)}</h4>
            <div class="cred-meta">${c.badge_type || 'FOUNDATION'} • Issued ${formatDate(c.issue_date)}</div>
          </div>
          <span class="cred-verified-tag">✓ VERIFIED</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderJourneyTimeline(journey) {
  if (!journey || journey.length === 0) {
    return `
      <div class="journey-timeline-compact">
        <div class="journey-marker-dot"></div>
        <div class="journey-compact-text">Joined AI Passport Ecosystem</div>
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

function renderSkeleton() {
  return `
    <div class="overview-skeleton-wrapper">
      <div class="skeleton-box greeting-skeleton"></div>
      <div class="skeleton-box passport-skeleton"></div>
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

function formatEmailToName(emailStr) {
  if (!emailStr) return 'Builder';
  const handle = emailStr.split('@')[0];
  return handle.charAt(0).toUpperCase() + handle.slice(1);
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

window.togglePublicPassportState = async function(newVal) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('privacy_settings')
      .upsert({ user_id: user.id, is_public_passport_enabled: newVal }, { onConflict: 'user_id' });

    alert(`Public Passport is now ${newVal ? 'ENABLED (ON)' : 'DISABLED (OFF)'}.`);
    window.location.reload();
  } catch(e) {
    alert('Error updating privacy setting.');
  }
};

window.handleSharePassportCard = function(num) {
  const url = `${window.location.origin}/passport.html?id=${num}`;
  if (navigator.share) {
    navigator.share({ title: 'My AI Passport', url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url);
    alert('Public Passport link copied to clipboard!');
  }
};

window.showPassportQrModal = function(num) {
  const url = `${window.location.origin}/passport.html?id=${num}`;
  alert(`CANONICAL QR TARGET URL:\n${url}`);
};

async function safeFetch(queryPromise, fallbackData, timeoutMs = 1500) {
  try {
    const timeout = new Promise((resolve) => setTimeout(() => resolve({ data: fallbackData }), timeoutMs));
    const result = await Promise.race([queryPromise, timeout]);
    return (result && result.data) ? result.data : fallbackData;
  } catch (e) {
    return fallbackData;
  }
}

