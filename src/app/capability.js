/* ==========================================================================
   MY AI PASSPORT™ â€” STAGE 7 CAPABILITY INTELLIGENCE ENGINE
   ========================================================================== */

import { supabase } from '../lib/supabase.js';

// The 5 Canonical Dimensions of the AI Capability Framework™
export const CAPABILITY_DIMENSIONS = [
  {
    id: 'UNDERSTAND',
    name: 'UNDERSTAND',
    shortName: 'Understanding',
    description: 'Comprehend how AI systems work, what they can and cannot do, and the principles that shape their behaviour.'
  },
  {
    id: 'APPLY',
    name: 'APPLY',
    shortName: 'Application',
    description: 'Use AI effectively within practical tasks, workflows, and real-world contexts.'
  },
  {
    id: 'CREATE',
    name: 'CREATE',
    shortName: 'Creation & Build',
    description: 'Design, build, or produce meaningful solutions, systems, and experiences using AI.'
  },
  {
    id: 'EVALUATE',
    name: 'EVALUATE',
    shortName: 'Evaluation & Testing',
    description: 'Test, compare, critique, and improve AI outputs, models, workflows, and systems.'
  },
  {
    id: 'RESPONSIBLE',
    name: 'RESPONSIBLE',
    shortName: 'Responsible AI',
    description: 'Exercise sound judgment around safety, ethics, privacy, bias, transparency, and human responsibility when working with AI.'
  }
];

// The 4 Categorical Progression States
export const PROGRESSION_STATES = ['EXPLORE', 'DEVELOP', 'DEMONSTRATE', 'ADVANCE'];

// State Explanations contextualized per state
export const STATE_EXPLANATIONS = {
  EXPLORE: 'Beginning engagement with this capability dimension. You are building baseline awareness.',
  DEVELOP: 'Actively building knowledge, judgment, and practical experience within this capability dimension.',
  DEMONSTRATE: 'Authoritatively recognised evidence supports meaningful practical capability within this dimension.',
  ADVANCE: 'Authoritative recognition of deeper, sustained, and increasingly sophisticated capability within this dimension.'
};

// 20 Deterministic Next Frontier Guidance Combinations (5 dimensions Ã— 4 states)
export const NEXT_FRONTIER_GUIDANCE = {
  UNDERSTAND: {
    EXPLORE: 'Begin exploring core AI principles, model capabilities, prompt structures, and systemic limitations through structured pathways.',
    DEVELOP: 'Deepen conceptual comprehension by analyzing model architectures, context windows, and real-world failure modes.',
    DEMONSTRATE: 'Consolidate conceptual understanding by documenting technical insights and architecture choices across complex builds.',
    ADVANCE: 'Sustain advanced conceptual clarity. Mentor others, analyze emerging model benchmarks, and evaluate next-generation paradigms.'
  },
  APPLY: {
    EXPLORE: 'Integrate basic AI tools into your daily workflows and document initial productivity gains.',
    DEVELOP: 'Construct automated prompt chains, tool integrations, and multi-step AI workflows in professional contexts.',
    DEMONSTRATE: 'Produce verified evidence of robust, error-handled AI workflows that solve real operational problems.',
    ADVANCE: 'Expand the scale and reliability of applied AI workflows, demonstrating cross-functional impact and efficiency.'
  },
  CREATE: {
    EXPLORE: 'Begin translating AI concepts into practical builds. Start with a small solution where you clearly explain the problem and AI\'s role.',
    DEVELOP: 'Strengthen your capability through independent builds and document the design decisions, iterations, and evidence behind your work.',
    DEMONSTRATE: 'Deepen the sophistication, independence, and breadth of your work. Stronger evidence may show architecture decisions and evaluation.',
    ADVANCE: 'Continue expanding the depth, complexity, and influence of your practice. Advanced capability is sustained rather than completed.'
  },
  EVALUATE: {
    EXPLORE: 'Start reviewing and auditing AI outputs for accuracy, hallucination, and alignment.',
    DEVELOP: 'Build structured testing suites, benchmark comparisons, and systematic evaluation criteria for AI models.',
    DEMONSTRATE: 'Provide verified evidence showing how you tested, audited, or benchmarked model performance under edge cases.',
    ADVANCE: 'Design authoritative evaluation frameworks for enterprise AI applications, safety guardrails, and model fine-tuning.'
  },
  RESPONSIBLE: {
    EXPLORE: 'Familiarize yourself with AI safety principles, data privacy boundaries, and ethical considerations.',
    DEVELOP: 'Incorporate risk assessments, human-in-the-loop controls, and bias checks into your project builds.',
    DEMONSTRATE: 'Produce verified evidence of formal privacy assessments, safety guardrails, or ethical AI audits.',
    ADVANCE: 'Lead responsible AI practices, establishing governance, transparency guidelines, and safety protocols for AI systems.'
  }
};

export async function renderCapabilityPage(containerEl, user, targetDimensionId = null) {
  if (!containerEl || !user) return;

  containerEl.innerHTML = renderSkeleton();

  try {
    const isRealGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    // Single Scoped Fetch of All Learner Signals & Authoritative State
    const [capStatesRes, evidenceRes, projectsRes, learnProgressRes, programmesRes, credsRes] = isRealGuid ? await Promise.all([
      supabase.from('capability_states').select('*').eq('user_id', user.id),
      supabase.from('evidence').select('*').eq('user_id', user.id),
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('learning_progress').select('*').eq('user_id', user.id),
      supabase.from('programmes').select('*'),
      supabase.from('credentials').select('*').eq('user_id', user.id)
    ]) : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];

    const capStates = (capStatesRes && capStatesRes.data) || [];
    const evidenceList = (evidenceRes && evidenceRes.data) || [];
    const projectsList = (projectsRes && projectsRes.data) || [];
    const learningProgress = (learnProgressRes && learnProgressRes.data) || [];
    const programmesList = (programmesRes && programmesRes.data) || [];
    const credentialsList = (credsRes && credsRes.data) || [];

    // Check URL selected dimension
    const urlParams = new URLSearchParams(window.location.search);
    const activeDimension = targetDimensionId || urlParams.get('dim') || 'CREATE';

    renderCapabilityMainView(containerEl, user, capStates, evidenceList, projectsList, learningProgress, programmesList, credentialsList, activeDimension);

  } catch (err) {
    console.error('Error rendering Capability page:', err);
    containerEl.innerHTML = `
      <div class="empty-section-box">
        <h2 class="empty-title" style="color: #ff7070;">Unable to Load Capability Workspace</h2>
        <p class="empty-desc">${escapeHtml(err.message || 'Error connecting to database.')}</p>
        <button class="btn-primary-action inline-btn" onclick="window.location.reload()">RETRY CONNECTION</button>
      </div>
    `;
  }
}

/* ==========================================================================
   MAIN CAPABILITY WORKSPACE RENDERER
   ========================================================================== */

function renderCapabilityMainView(containerEl, user, capStates, evidenceList, projectsList, learningProgress, programmesList, credentialsList, selectedDimId) {
  
  // Calculate Real Profile Summary Stats
  const demoCount = capStates.filter(c => c.state === 'DEMONSTRATE').length;
  const advanceCount = capStates.filter(c => c.state === 'ADVANCE').length;
  const verifiedEvCount = evidenceList.filter(e => e.verification_status === 'VERIFIED').length;

  const currentDimObj = CAPABILITY_DIMENSIONS.find(d => d.id === selectedDimId) || CAPABILITY_DIMENSIONS[2];

  containerEl.innerHTML = `
    <div class="capability-page-wrapper">
      
      <!-- 1. HERO SECTION -->
      <section class="capability-section hero-section">
        <div class="hero-top-row">
          <div>
            <div class="hero-tag">AI CAPABILITY FRAMEWORK™</div>
            <h1 class="hero-title">YOUR AI CAPABILITY.<br>BUILT THROUGH EVIDENCE.</h1>
            <p class="hero-sub">A living view of how your ability to understand, apply, create, evaluate, and use AI responsibly develops through learning, building, evidence, and experience.</p>
          </div>
          <button class="btn-secondary-action" onclick="window.toggleExplainabilityModal()">HOW IS CAPABILITY DETERMINED? ðŸ›ˆ</button>
        </div>
      </section>

      <!-- 2. CAPABILITY PROFILE SUMMARY STRIP -->
      <section class="capability-section">
        <div class="capability-profile-summary">
          <div class="summary-item">
            <span class="sum-lbl">FRAMEWORK DIMENSIONS</span>
            <span class="sum-val">5 Dimensions</span>
          </div>
          <div class="summary-divider">â€¢</div>
          <div class="summary-item">
            <span class="sum-lbl">DEMONSTRATED</span>
            <span class="sum-val">${demoCount} Dimensions</span>
          </div>
          <div class="summary-divider">â€¢</div>
          <div class="summary-item">
            <span class="sum-lbl">ADVANCED</span>
            <span class="sum-val">${advanceCount} Dimensions</span>
          </div>
          <div class="summary-divider">â€¢</div>
          <div class="summary-item">
            <span class="sum-lbl">VERIFIED EVIDENCE</span>
            <span class="sum-val">${verifiedEvCount} Records</span>
          </div>
        </div>
      </section>

      <!-- 3. MAIN DUAL-COLUMN ARCHITECTURE: MATRIX TRACKS + DETAIL DRAWER -->
      <section class="capability-section">
        <div class="capability-workspace-grid">
          
          <!-- Left Column: 5-Axis Horizontal Track Matrix -->
          <div class="capability-matrix-container">
            <div class="matrix-header">
              <span class="matrix-title">AI CAPABILITY MATRIX</span>
              <span class="matrix-sub">Select a dimension to inspect evidence, signals & frontier</span>
            </div>

            <div class="capability-tracks-list">
              ${CAPABILITY_DIMENSIONS.map(dim => {
                const userCapState = capStates.find(c => c.dimension === dim.id)?.state || 'EXPLORE';
                const isSelected = dim.id === selectedDimId;
                const dimVerifiedEv = evidenceList.filter(e => e.capability_dimension === dim.id && e.verification_status === 'VERIFIED');

                return `
                  <div class="capability-track-card ${isSelected ? 'track-selected' : ''}" onclick="window.selectDimension('${dim.id}')">
                    <div class="track-left">
                      <h3 class="track-dim-name">${dim.name}</h3>
                      <span class="track-ev-count">${dimVerifiedEv.length} Verified Evidence</span>
                    </div>

                    <div class="track-right-pipeline">
                      ${PROGRESSION_STATES.map(st => {
                        const isCurrentState = userCapState === st;
                        const stateIndex = PROGRESSION_STATES.indexOf(st);
                        const userIndex = PROGRESSION_STATES.indexOf(userCapState);
                        const isPassed = stateIndex <= userIndex;

                        return `
                          <div class="pipeline-node-wrap ${isCurrentState ? 'node-active' : ''} ${isPassed ? 'node-passed' : ''}">
                            <div class="node-dot"></div>
                            <span class="node-label">${st}</span>
                          </div>
                        `;
                      }).join('<div class="pipeline-connector"></div>')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right Column: Expandable Dimension Detail Panel -->
          <div class="capability-detail-drawer" id="capability-detail-drawer">
            ${renderDimensionDetail(currentDimObj, capStates, evidenceList, projectsList, learningProgress, programmesList, credentialsList)}
          </div>

        </div>
      </section>

      <!-- 4. HOW CAPABILITY WORKS INSTITUTIONAL SECTION -->
      <section class="capability-section">
        <div class="how-capability-card">
          <div class="how-header">
            <span class="how-tag">FRAMEWORK INTEGRITY</span>
            <h3 class="how-title">How Capability Progression Works</h3>
            <p class="how-desc">AI Passport capability is an evolving evidence architecture, not a self-declared score.</p>
          </div>

          <div class="how-grid">
            <div class="how-col">
              <span class="how-step-num">01 / MAP</span>
              <h4>LEARNING & BUILDS</h4>
              <p>Pathways and projects connect your daily activity to framework dimensions.</p>
            </div>
            <div class="how-col">
              <span class="how-step-num">02 / EVIDENCE</span>
              <h4>ATTACH PROOF</h4>
              <p>Code repos, live agents, and technical docs provide concrete evidence.</p>
            </div>
            <div class="how-col">
              <span class="how-step-num">03 / VERIFY</span>
              <h4>AUTHORITATIVE REVIEW</h4>
              <p>Selected evidence undergoes review by authorized processes.</p>
            </div>
            <div class="how-col">
              <span class="how-step-num">04 / RECOGNISE</span>
              <h4>AUTHORITATIVE STATE</h4>
              <p>Trusted progression state records your long-term capability growth.</p>
            </div>
          </div>
        </div>
      </section>

    </div>

    <!-- EXPLAINABILITY MODAL -->
    <div class="project-modal-backdrop" id="explainability-modal" style="display: none;">
      <div class="project-modal-container" style="width: 620px;">
        <div class="modal-header">
          <div>
            <span class="modal-step-badge">EXPLAINABILITY & TRUST</span>
            <h2 class="modal-title">How Is My Capability Determined?</h2>
          </div>
          <button class="modal-close-btn" onclick="window.toggleExplainabilityModal()">âœ•</button>
        </div>
        <div class="modal-body" style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5;">
          <p><strong style="color: #fff;">1. Learning & Projects Provide Context:</strong> When you complete learning pathways or build projects, you map those activities to capability dimensions. These form your active Learning Signals and Project Mappings.</p>
          <p><strong style="color: #fff;">2. Verified Evidence Provides Proof:</strong> When code repositories, live agent links, or technical documentation undergo verification, they become Supporting Verified Evidence.</p>
          <p><strong style="color: #fff;">3. Authoritative Progression:</strong> Progression across EXPLORE, DEVELOP, DEMONSTRATE, and ADVANCE is authoritative and cannot be self-assigned. It reflects trusted recognition over time.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-primary-action" onclick="window.toggleExplainabilityModal()">UNDERSTOOD</button>
        </div>
      </div>
    </div>
  `;

  // Attach Dimension Selection & Modal Handlers to window
  window.selectDimension = function(dimId) {
    const url = new URL(window.location.href);
    url.searchParams.set('dim', dimId);
    window.history.pushState({}, '', url);
    renderCapabilityMainView(containerEl, user, capStates, evidenceList, projectsList, learningProgress, programmesList, credentialsList, dimId);
  };

  window.toggleExplainabilityModal = function() {
    const m = document.getElementById('explainability-modal');
    if (m) m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
  };
}

/* ==========================================================================
   DIMENSION DETAIL PANEL RENDERER
   ========================================================================== */

function renderDimensionDetail(dim, capStates, evidenceList, projectsList, learningProgress, programmesList, credentialsList) {
  const currentState = capStates.find(c => c.dimension === dim.id)?.state || 'EXPLORE';
  
  // 1. Supporting Verified Evidence
  const verifiedEv = evidenceList.filter(e => e.capability_dimension === dim.id && e.verification_status === 'VERIFIED');
  const pendingEv = evidenceList.filter(e => e.capability_dimension === dim.id && (e.verification_status === 'PENDING' || e.verification_status === 'UNVERIFIED'));

  // 2. Project Mappings
  const mappedProjects = projectsList.filter(p => (p.capability_dimensions || []).includes(dim.id));

  // 3. Learning Signals
  const mappedProgrammes = programmesList.filter(p => (p.capability_dimensions || []).includes(dim.id));

  // 4. Related Achievements (Credentials linked via programme_id or project_id)
  const relatedCreds = credentialsList.filter(c => {
    if (c.programme_id && mappedProgrammes.some(p => p.id === c.programme_id)) return true;
    if (c.project_id && mappedProjects.some(p => p.id === c.project_id)) return true;
    return false;
  });

  // 5. Next Frontier Guidance
  const nextFrontierText = NEXT_FRONTIER_GUIDANCE[dim.id]?.[currentState] || NEXT_FRONTIER_GUIDANCE.CREATE.EXPLORE;

  return `
    <div class="dim-detail-wrapper">
      
      <!-- Detail Header -->
      <div class="dim-detail-header">
        <span class="dim-tag">${dim.name} DIMENSION</span>
        <h2 class="dim-title">${dim.shortName}</h2>
        <p class="dim-desc">${escapeHtml(dim.description)}</p>

        <div class="current-state-badge-row margin-top-16">
          <span class="state-label">AUTHORITATIVE STATE:</span>
          <span class="state-pill state-${currentState.toLowerCase()}">${currentState}</span>
        </div>
        <p class="state-explanation-text">${escapeHtml(STATE_EXPLANATIONS[currentState])}</p>
      </div>

      <!-- 1. SUPPORTING VERIFIED EVIDENCE -->
      <div class="detail-section-box">
        <h4 class="box-title">SUPPORTING VERIFIED EVIDENCE (${verifiedEv.length})</h4>
        <p class="box-sub">Authoritative evidence supporting your capability record:</p>
        ${verifiedEv.length > 0 ? `
          <div class="evidence-item-list">
            ${verifiedEv.map(ev => `
              <div class="evidence-row">
                <span class="ev-chip">${ev.evidence_type}</span>
                <a href="${ev.url || '#'}" target="_blank" class="ev-link">${escapeHtml(ev.url || 'Attached Proof')} ↗</a>
                <span class="ev-status">âœ“ VERIFIED</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-compact-text">No verified evidence currently attached to this dimension.</div>
        `}

        ${pendingEv.length > 0 ? `
          <div class="pending-evidence-box margin-top-16">
            <span class="pending-lbl">EVIDENCE IN DEVELOPMENT / IN REVIEW (${pendingEv.length}):</span>
            <div class="pending-sub-list">
              ${pendingEv.map(pe => `<div class="pending-sub-item">â€¢ ${pe.evidence_type} (${pe.verification_status})</div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- 2. PROJECT MAPPINGS (Learner Self-Claims) -->
      <div class="detail-section-box">
        <h4 class="box-title">PROJECT MAPPINGS (${mappedProjects.length})</h4>
        <p class="box-sub">Projects you have mapped to this dimension:</p>
        ${mappedProjects.length > 0 ? `
          <div class="mapped-projects-list">
            ${mappedProjects.map(p => `
              <div class="mapped-proj-card">
                <span class="proj-name">${escapeHtml(p.title)}</span>
                <a href="?view=projects&id=${p.id}" class="btn-text-link">VIEW PROJECT →</a>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-compact-text">No projects currently mapped to ${dim.name}.</div>
        `}
      </div>

      <!-- 3. LEARNING SIGNALS -->
      <div class="detail-section-box">
        <h4 class="box-title">LEARNING SIGNALS (${mappedProgrammes.length})</h4>
        <p class="box-sub">Pathways that focus on or develop this dimension:</p>
        ${mappedProgrammes.length > 0 ? `
          <div class="learning-signals-list">
            ${mappedProgrammes.map(prog => `
              <div class="signal-row">
                <span class="signal-name">${escapeHtml(prog.title)}</span>
                <button class="btn-text-link" onclick="window.switchView('learn')">EXPLORE PATHWAY →</button>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-compact-text">No active learning pathways focusing on this dimension.</div>
        `}
      </div>

      <!-- 4. RELATED ACHIEVEMENTS (Only if relationally justified) -->
      ${relatedCreds.length > 0 ? `
        <div class="detail-section-box">
          <h4 class="box-title">RELATED ACHIEVEMENTS (${relatedCreds.length})</h4>
          <div class="related-creds-list">
            ${relatedCreds.map(c => `
              <div class="rel-cred-item">
                <span class="rel-cred-title">${escapeHtml(c.title)}</span>
                <a href="?view=credentials&id=${c.id}" class="btn-text-link">VIEW CREDENTIAL →</a>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 5. NEXT FRONTIER GUIDANCE -->
      <div class="detail-section-box next-frontier-box">
        <span class="frontier-tag">NEXT FRONTIER</span>
        <h4 class="frontier-title">How Stronger Capability Grows</h4>
        <p class="frontier-text">${escapeHtml(nextFrontierText)}</p>
      </div>

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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

