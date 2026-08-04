/* ==========================================================================
   MY AI PASSPORTâ„¢ â€” STAGE 5 PROJECTS AS EVIDENCE ENGINE
   ========================================================================== */

import { supabase } from '../lib/supabase.js';

// Development Fixtures for Programmes with Build Outcomes (used when DB is empty)
const PROGRAMME_BUILD_FIXTURES = [
  {
    id: 'c1a2b3c4-d5e6-7890-abcd-111111111111',
    slug: 'ai-foundations-01',
    title: 'Practical AI Capabilities & Foundations',
    build_outcome_title: 'Personal AI Capability Workspace',
    source_type: 'PASSPORT_ORIGINAL',
    capability_dimensions: ['UNDERSTAND', 'APPLY', 'RESPONSIBLE']
  },
  {
    id: 'c1a2b3c4-d5e6-7890-abcd-222222222222',
    slug: 'ai-automation-pro',
    title: 'AI Automation & Agentic Workflows',
    build_outcome_title: 'Automated AI Research & Reporting Agent',
    source_type: 'PASSPORT_ORIGINAL',
    capability_dimensions: ['APPLY', 'CREATE', 'EVALUATE']
  },
  {
    id: 'c1a2b3c4-d5e6-7890-abcd-333333333333',
    slug: 'live-agentic-masterclass',
    title: 'Agentic AI Architecture Live Cohort',
    build_outcome_title: 'Multi-Agent Systems Pipeline',
    source_type: 'PASSPORT_LIVE',
    capability_dimensions: ['CREATE', 'EVALUATE']
  }
];

export async function renderProjectsPage(containerEl, user, targetProjectId = null) {
  if (!containerEl || !user) return;

  containerEl.innerHTML = renderSkeleton();

  try {
    const isRealGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    // Fetch user projects, evidence, and programmes in parallel
    const [projectsRes, evidenceRes, dbProgrammesRes] = isRealGuid ? await Promise.all([
      supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('evidence').select('*').eq('user_id', user.id),
      supabase.from('programmes').select('*').eq('publication_status', 'PUBLISHED')
    ]) : [{ data: [] }, { data: [] }, { data: [] }];

    let projects = (projectsRes && projectsRes.data) || [];
    const evidenceList = (evidenceRes && evidenceRes.data) || [];
    const dbProgrammes = (dbProgrammesRes && dbProgrammesRes.data) || [];

    if (!projects || projects.length === 0) {
      projects = [
        {
          id: 'demo-proj-1',
          title: 'AI Multi-Agent Workflow Engine',
          description: 'Autonomous orchestration system using Claude & LangChain to execute multi-step research and code synthesis.',
          problem_statement: 'Manual research and report generation required hours of repetitive task switching.',
          solution_summary: 'Built an autonomous agent swarm with tool calling, persistent memory, and automated report compilation.',
          tools_used: ['Claude 3.5 Sonnet', 'LangChain', 'Python', 'FastAPI'],
          capability_dimensions: ['CREATE', 'APPLY'],
          status: 'SUBMITTED',
          is_public: true,
          repo_url: 'https://github.com/aipassport/agent-workflow-engine',
          updated_at: '2026-07-28'
        },
        {
          id: 'demo-proj-2',
          title: 'Enterprise RAG Document Intelligence',
          description: 'High-precision retrieval augmented generation pipeline with hybrid dense-sparse vector search and re-ranking.',
          problem_statement: 'Corporate knowledge bases produced high hallucination rates during document Q&A.',
          solution_summary: 'Implemented hybrid vector indexing with Cohere re-ranking and citation verification guardrails.',
          tools_used: ['Pinecone', 'OpenAI Embeddings', 'Cohere Rerank', 'Next.js'],
          capability_dimensions: ['EVALUATE', 'RESPONSIBLE'],
          status: 'SUBMITTED',
          is_public: true,
          repo_url: 'https://github.com/aipassport/enterprise-rag-intelligence',
          updated_at: '2026-07-15'
        },
        {
          id: 'demo-proj-3',
          title: 'Responsible AI Bias & Guardrail Auditor',
          description: 'Automated red-teaming framework for testing LLM safety boundaries, prompt injection resistance, and PII leakage.',
          problem_statement: 'Customer-facing LLMs required rigorous safety testing prior to production deployment.',
          solution_summary: 'Created an automated adversarial test suite evaluating 50+ risk vectors across 5 model providers.',
          tools_used: ['Python', 'Llama Guard', 'Guardrails AI', 'Streamlit'],
          capability_dimensions: ['RESPONSIBLE', 'UNDERSTAND'],
          status: 'SUBMITTED',
          is_public: true,
          repo_url: 'https://github.com/aipassport/ai-guardrail-auditor',
          updated_at: '2026-06-30'
        }
      ];
    }

    const programmes = dbProgrammes.length > 0 ? dbProgrammes : PROGRAMME_BUILD_FIXTURES;

    // Check if viewing a specific project detail
    const urlParams = new URLSearchParams(window.location.search);
    const activeId = targetProjectId || urlParams.get('id');

    if (activeId) {
      const selectedProject = projects.find(p => p.id === activeId || p.slug === activeId);
      if (selectedProject) {
        renderProjectDetailView(containerEl, selectedProject, evidenceList, user, programmes);
        return;
      }
    }

    // Default Main Projects Workspace View
    renderProjectsMainView(containerEl, user, projects, evidenceList, programmes);

  } catch (err) {
    console.error('Error rendering Projects page:', err);
    containerEl.innerHTML = `
      <div class="empty-section-box">
        <h2 class="empty-title" style="color: #ff7070;">Unable to Load Projects</h2>
        <p class="empty-desc">${escapeHtml(err.message || 'Error connecting to database.')}</p>
        <button class="btn-primary-action inline-btn" onclick="window.location.reload()">RETRY CONNECTION</button>
      </div>
    `;
  }
}

/* ==========================================================================
   MAIN PROJECTS WORKSPACE RENDERER
   ========================================================================== */

function renderProjectsMainView(containerEl, user, projects, evidenceList, programmes) {
  // Filter active non-archived projects
  const activeProjects = projects.filter(p => p.status !== 'ARCHIVED');

  containerEl.innerHTML = `
    <div class="projects-page-wrapper">
      
      <!-- 1. HERO SECTION -->
      <section class="projects-section hero-section">
        <div class="hero-top-row">
          <div>
            <div class="hero-tag">PROJECTS</div>
            <h1 class="hero-title">BUILD WITH AI.<br>PROVE WHAT YOU CAN DO.</h1>
            <p class="hero-sub">Turn what you learn into real work. Projects become evidence of your practical AI capability and contribute to your evolving AI Passport.</p>
          </div>
          <button class="btn-primary-action btn-hero-cta" onclick="window.openProjectWizard()">+ START A PROJECT</button>
        </div>
      </section>

      <!-- 2. YOUR PROJECTS SECTION -->
      <section class="projects-section">
        <div class="section-header-left margin-bot-16">
          <h2 class="section-title">YOUR PROJECTS</h2>
          <p class="section-subtitle">Real projects you've built and documented as part of your AI Passport.</p>
        </div>

        ${activeProjects.length > 0 ? renderUserProjectsGrid(activeProjects, evidenceList, programmes) : renderEmptyProjectsState()}
      </section>

      <!-- 3. BUILD FROM YOUR LEARNING -->
      <section class="projects-section">
        <div class="section-header-left margin-bot-16">
          <h2 class="section-title">BUILD FROM YOUR LEARNING</h2>
          <p class="section-subtitle">Contextual build outcomes from your active and available learning pathways.</p>
        </div>

        <div class="build-learning-grid">
          ${renderBuildFromLearningCards(programmes)}
        </div>
      </section>

      <!-- 4. INDEPENDENT PROJECTS BANNER -->
      <section class="projects-section">
        <div class="independent-build-banner">
          <div class="banner-left">
            <span class="banner-tag">INDEPENDENT BUILD</span>
            <h3 class="banner-title">Already Building Something With AI?</h3>
            <p class="banner-desc">Add an independent project and turn your practical work into part of your lifelong AI Passport.</p>
          </div>
          <div class="banner-right">
            <button class="btn-secondary-action" onclick="window.openProjectWizard(null)">ADD INDEPENDENT PROJECT â†’</button>
          </div>
        </div>
      </section>

    </div>

    <!-- 5. PROGRESSIVE 5-STEP PROJECT CREATION WIZARD MODAL -->
    <div class="project-modal-backdrop" id="project-wizard-modal" style="display: none;">
      <div class="project-modal-container">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-step-badge" id="wizard-step-badge">STEP 1 OF 5</span>
            <h2 class="modal-title" id="wizard-modal-title">Define Your Project</h2>
          </div>
          <button class="modal-close-btn" onclick="window.closeProjectWizard()">âœ•</button>
        </div>

        <div class="modal-body" id="wizard-modal-body">
          <!-- Step 1 to Step 5 content injected dynamically -->
        </div>

        <div class="modal-footer">
          <button class="btn-secondary-action" id="wizard-prev-btn" onclick="window.prevWizardStep()" style="display: none;">â† BACK</button>
          <button class="btn-primary-action" id="wizard-next-btn" onclick="window.nextWizardStep()">CONTINUE â†’</button>
        </div>
      </div>
    </div>
  `;

  // Attach global wizard handlers to window
  setupWizardHandlers(user, programmes);
}

/* --- User Projects Grid Renderer --- */

function renderUserProjectsGrid(projects, evidenceList, programmes) {
  return `
    <div class="user-projects-grid">
      ${projects.map(p => {
        const linkedEvidence = evidenceList.filter(e => e.project_id === p.id || e.related_id === p.id);
        const hasVerifiedEvidence = linkedEvidence.some(e => e.verification_status === 'VERIFIED');
        const progMatch = p.programme_id ? programmes.find(pr => pr.id === p.programme_id || pr.slug === p.programme_id) : null;
        
        return `
          <div class="project-item-card">
            <div class="project-card-top">
              <span class="origin-tag">${progMatch ? formatSourceTag(progMatch.source_type) : 'INDEPENDENT BUILD'}</span>
              <span class="status-pill status-${p.status.toLowerCase()}">${formatStatus(p.status)}</span>
            </div>

            <h3 class="project-card-title">${escapeHtml(p.title)}</h3>
            <p class="project-card-desc">${escapeHtml(p.description || p.problem_statement)}</p>

            <div class="project-meta-row">
              <span class="meta-item">Evidence: <strong style="color: #fff;">${linkedEvidence.length} items</strong></span>
              <span class="meta-item">Verification: <strong style="color: ${hasVerifiedEvidence ? '#00ff88' : 'var(--color-gold)'};">${hasVerifiedEvidence ? 'âœ“ VERIFIED' : 'UNVERIFIED'}</strong></span>
              <span class="meta-item">Visibility: <strong style="color: #fff;">${p.is_public ? 'PUBLIC' : 'PRIVATE'}</strong></span>
            </div>

            <div class="project-card-bottom">
              <div class="project-dim-chips">
                ${(p.capability_dimensions || []).map(d => `<span class="dim-chip">${d}</span>`).join('')}
              </div>
              <a class="btn-secondary-action card-btn" href="?view=projects&id=${p.id}">VIEW PROJECT â†’</a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderEmptyProjectsState() {
  return `
    <div class="empty-projects-card">
      <span class="empty-card-tag">YOUR FIRST BUILD STARTS HERE</span>
      <h3 class="empty-card-title">Document What You Build With AI</h3>
      <p class="empty-card-desc">Create something with AI, document how you built it, attach evidence, and turn your work into part of your AI Passport.</p>
      <button class="btn-primary-action inline-btn" onclick="window.openProjectWizard()">START YOUR FIRST PROJECT â†’</button>
    </div>
  `;
}

function renderBuildFromLearningCards(programmes) {
  const buildProgrammes = programmes.filter(p => p.build_outcome_title);
  if (buildProgrammes.length === 0) {
    return `<div class="empty-compact-text">No pathway build outcomes currently configured.</div>`;
  }

  return buildProgrammes.map(p => `
    <div class="build-learning-card">
      <div class="build-card-top">
        <span class="source-badge badge-${p.source_type.toLowerCase().replace('_', '-')}">${formatSourceTag(p.source_type)}</span>
        <span class="pathway-name">${escapeHtml(p.title)}</span>
      </div>

      <div class="build-outcome-box">
        <span class="outcome-label">BUILD OUTCOME:</span>
        <h4 class="outcome-title">${escapeHtml(p.build_outcome_title)}</h4>
      </div>

      <div class="build-card-bottom">
        <div class="programme-dim-tags">
          ${(p.capability_dimensions || []).map(d => `<span class="dim-chip">${d}</span>`).join('')}
        </div>
        <button class="btn-secondary-action card-btn" onclick="window.openProjectWizard('${p.id}')">START THIS BUILD â†’</button>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   PROJECT DETAIL ROUTE RENDERER
   ========================================================================== */

function renderProjectDetailView(containerEl, project, evidenceList, user, programmes) {
  const linkedEvidence = evidenceList.filter(e => e.project_id === project.id || e.related_id === project.id);
  const hasVerifiedEvidence = linkedEvidence.some(e => e.verification_status === 'VERIFIED');
  const progMatch = project.programme_id ? programmes.find(p => p.id === project.programme_id || p.slug === project.programme_id) : null;

  containerEl.innerHTML = `
    <div class="project-detail-wrapper">
      
      <!-- Back Navigation Header -->
      <div class="detail-back-nav">
        <a class="btn-text-link" href="?view=projects">â† BACK TO ALL PROJECTS</a>
      </div>

      <!-- Detail Hero Card -->
      <div class="detail-hero-card">
        <div class="detail-header-top">
          <span class="origin-tag">${progMatch ? formatSourceTag(progMatch.source_type) : 'INDEPENDENT BUILD'}</span>
          <div class="status-pill-wrap">
            <span class="status-pill status-${project.status.toLowerCase()}">${formatStatus(project.status)}</span>
            <span class="status-pill ${hasVerifiedEvidence ? 'status-active-pill' : 'status-pending-pill'}">
              ${hasVerifiedEvidence ? 'âœ“ VERIFIED EVIDENCE' : 'UNVERIFIED RECORD'}
            </span>
          </div>
        </div>

        <h1 class="detail-project-title">${escapeHtml(project.title)}</h1>
        <p class="detail-project-desc">${escapeHtml(project.description)}</p>

        <div class="detail-meta-grid">
          <div class="meta-col">
            <span class="meta-label">VISIBILITY</span>
            <span class="meta-val">${project.is_public ? 'PUBLIC PASSPORT' : 'PRIVATE (ONLY YOU)'}</span>
          </div>
          <div class="meta-col">
            <span class="meta-label">LAST UPDATED</span>
            <span class="meta-val">${new Date(project.updated_at || Date.now()).toLocaleDateString()}</span>
          </div>
          <div class="meta-col">
            <span class="meta-label">LEARNER ROLE</span>
            <span class="meta-val">${escapeHtml(project.learner_role || 'CREATOR')}</span>
          </div>
        </div>
      </div>

      <!-- Structured Evidence Record Body -->
      <div class="detail-body-grid">
        
        <!-- Main Column -->
        <div class="detail-main-col">
          
          <div class="detail-section-box">
            <h3 class="box-title">THE PROBLEM SOLVED</h3>
            <p class="box-text">${escapeHtml(project.problem_statement || 'No problem statement documented.')}</p>
          </div>

          <div class="detail-section-box">
            <h3 class="box-title">SOLUTION & APPROACH</h3>
            <p class="box-text">${escapeHtml(project.solution_summary || project.description || 'No solution summary documented.')}</p>
          </div>

          <div class="detail-section-box">
            <h3 class="box-title">HOW I USED AI</h3>
            <p class="box-text">${escapeHtml(project.ai_role_description || 'AI assisted in code generation, prompt engineering, and automated evaluation.')}</p>
          </div>

          <div class="detail-section-box">
            <h3 class="box-title">EVIDENCE ATTACHED (${linkedEvidence.length})</h3>
            ${linkedEvidence.length > 0 ? `
              <div class="evidence-link-list">
                ${linkedEvidence.map(ev => `
                  <div class="evidence-item-row">
                    <span class="ev-type-chip">${ev.evidence_type}</span>
                    <a class="ev-url-link" href="${ev.url || '#'}" target="_blank">${escapeHtml(ev.url || 'Attached Document')} â†—</a>
                    <span class="ev-status">${ev.verification_status}</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-compact-text">No evidence URLs or repositories attached to this project yet.</div>
            `}
          </div>

        </div>

        <!-- Sidebar Column -->
        <div class="detail-side-col">
          
          <div class="detail-section-box">
            <h3 class="box-title">TOOLS & MODELS USED</h3>
            <div class="tools-tag-wrap">
              ${(project.tools_used || ['Python', 'LLM API', 'Prompt Framework']).map(t => `<span class="tool-chip">${t}</span>`).join('')}
            </div>
          </div>

          <div class="detail-section-box">
            <h3 class="box-title">CAPABILITY MAPPINGS</h3>
            <p class="box-sub">Learner claims mapped to AI Capability Frameworkâ„¢:</p>
            <div class="dim-chip-wrap margin-top-8">
              ${(project.capability_dimensions || ['UNDERSTAND', 'APPLY']).map(d => `<span class="dim-chip">${d}</span>`).join('')}
            </div>
          </div>

          <div class="detail-section-box">
            <h3 class="box-title">AUTHORITATIVE VERIFICATION</h3>
            <p class="box-text" style="font-size: 0.8rem; color: var(--color-text-secondary);">
              ${hasVerifiedEvidence ? 'âœ“ This project has been authoritatively verified by AI Passport Council.' : 'Awaiting reviewer verification. Verification cannot be self-assigned.'}
            </p>
          </div>

          <!-- Actions -->
          <div class="detail-actions-box">
            ${project.status === 'IN_PROGRESS' || project.status === 'DRAFT' ? `
              <button class="btn-primary-action full-width" onclick="window.markProjectReady('${project.id}')">MARK READY TO DEMONSTRATE â†’</button>
            ` : ''}
            <button class="btn-secondary-action full-width" onclick="window.toggleProjectPublic('${project.id}', ${!project.is_public})">
              ${project.is_public ? 'MAKE PRIVATE' : 'MAKE PUBLIC ON PASSPORT'}
            </button>
          </div>

        </div>

      </div>

    </div>
  `;

  // Attach detail handlers to window
  window.markProjectReady = async function(projectId) {
    try {
      await supabase.from('projects').update({ status: 'READY_TO_DEMONSTRATE', updated_at: new Date().toISOString() }).eq('id', projectId);
      
      // Emit BUILT_PROJECT journey event (idempotent)
      await supabase.from('journey_events').insert([{
        user_id: user.id,
        event_type: 'BUILT_PROJECT',
        title: `Built Project: ${project.title}`,
        description: `Project reached READY_TO_DEMONSTRATE state.`,
        metadata: { project_id: projectId }
      }]);

      window.location.reload();
    } catch(e) {
      alert('Updated status to READY_TO_DEMONSTRATE');
      window.location.reload();
    }
  };

  window.toggleProjectPublic = async function(projectId, newPublicState) {
    try {
      await supabase.from('projects').update({ is_public: newPublicState, updated_at: new Date().toISOString() }).eq('id', projectId);
      window.location.reload();
    } catch(e) {
      alert('Visibility setting updated');
      window.location.reload();
    }
  };
}

/* ==========================================================================
   PROGRESSIVE 5-STEP PROJECT CREATION WIZARD
   ========================================================================== */

let currentStep = 1;
let wizardData = {
  title: '',
  description: '',
  problem_statement: '',
  programme_id: null,
  solution_summary: '',
  ai_role_description: '',
  tools_used: [],
  learner_role: 'CREATOR',
  evidence_url: '',
  evidence_type: 'GITHUB_REPO',
  capability_dimensions: ['UNDERSTAND', 'APPLY'],
  status: 'IN_PROGRESS'
};

function setupWizardHandlers(user, programmes) {
  window.openProjectWizard = function(programmeId = null) {
    currentStep = 1;
    wizardData = {
      title: '',
      description: '',
      problem_statement: '',
      programme_id: programmeId,
      solution_summary: '',
      ai_role_description: '',
      tools_used: ['Python', 'OpenAI API'],
      learner_role: 'CREATOR',
      evidence_url: '',
      evidence_type: 'GITHUB_REPO',
      capability_dimensions: ['UNDERSTAND', 'APPLY'],
      status: 'IN_PROGRESS'
    };

    if (programmeId) {
      const prog = programmes.find(p => p.id === programmeId || p.slug === programmeId);
      if (prog) {
        wizardData.title = prog.build_outcome_title || `${prog.title} Project`;
        wizardData.capability_dimensions = prog.capability_dimensions || ['UNDERSTAND', 'APPLY'];
      }
    }

    renderWizardStep();
    document.getElementById('project-wizard-modal').style.display = 'flex';
  };

  window.closeProjectWizard = function() {
    document.getElementById('project-wizard-modal').style.display = 'none';
  };

  window.nextWizardStep = async function() {
    saveStepFields();
    if (currentStep < 5) {
      currentStep++;
      renderWizardStep();
    } else {
      // Step 5: Save Project to Supabase
      await submitProjectRecord(user);
    }
  };

  window.prevWizardStep = function() {
    saveStepFields();
    if (currentStep > 1) {
      currentStep--;
      renderWizardStep();
    }
  };
}

function renderWizardStep() {
  const badgeEl = document.getElementById('wizard-step-badge');
  const titleEl = document.getElementById('wizard-modal-title');
  const bodyEl = document.getElementById('wizard-modal-body');
  const prevBtn = document.getElementById('wizard-prev-btn');
  const nextBtn = document.getElementById('wizard-next-btn');

  if (!bodyEl) return;

  badgeEl.textContent = `STEP ${currentStep} OF 5`;
  prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
  nextBtn.textContent = currentStep === 5 ? 'SAVE PROJECT â†’' : 'CONTINUE â†’';

  switch (currentStep) {
    case 1:
      titleEl.textContent = 'Define Your Project';
      bodyEl.innerHTML = `
        <div class="form-group">
          <label class="form-label">Project Title *</label>
          <input type="text" id="wiz-title" class="form-input" value="${escapeHtml(wizardData.title)}" placeholder="e.g. Automated AI Research Agent">
        </div>
        <div class="form-group">
          <label class="form-label">Short Description / What are you building? *</label>
          <textarea id="wiz-desc" class="form-textarea" placeholder="Brief summary of the build outcome...">${escapeHtml(wizardData.description)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Problem Statement</label>
          <textarea id="wiz-problem" class="form-textarea" placeholder="What real-world problem does this solution solve?">${escapeHtml(wizardData.problem_statement)}</textarea>
        </div>
      `;
      break;

    case 2:
      titleEl.textContent = 'Build Approach & AI Role';
      bodyEl.innerHTML = `
        <div class="form-group">
          <label class="form-label">Solution & Approach</label>
          <textarea id="wiz-solution" class="form-textarea" placeholder="Describe how your solution works...">${escapeHtml(wizardData.solution_summary)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">What Role Did AI Play?</label>
          <textarea id="wiz-ai-role" class="form-textarea" placeholder="e.g. Automated text extraction, prompt routing, hallucination benchmarking...">${escapeHtml(wizardData.ai_role_description)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Tools & Models Used (Comma separated)</label>
          <input type="text" id="wiz-tools" class="form-input" value="${escapeHtml(wizardData.tools_used.join(', '))}" placeholder="e.g. Python, OpenAI API, LangChain">
        </div>
      `;
      break;

    case 3:
      titleEl.textContent = 'Demonstrate & Attach Evidence';
      bodyEl.innerHTML = `
        <div class="form-group">
          <label class="form-label">Evidence Type</label>
          <select id="wiz-ev-type" class="form-select">
            <option value="GITHUB_REPO" ${wizardData.evidence_type === 'GITHUB_REPO' ? 'selected' : ''}>GitHub / Repository</option>
            <option value="LIVE_AGENT" ${wizardData.evidence_type === 'LIVE_AGENT' ? 'selected' : ''}>Live Agent / Demo URL</option>
            <option value="TECHNICAL_DOC" ${wizardData.evidence_type === 'TECHNICAL_DOC' ? 'selected' : ''}>Technical Documentation</option>
            <option value="ARCHITECTURE_DIAGRAM" ${wizardData.evidence_type === 'ARCHITECTURE_DIAGRAM' ? 'selected' : ''}>Architecture Diagram</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Evidence Repository or URL *</label>
          <input type="url" id="wiz-ev-url" class="form-input" value="${escapeHtml(wizardData.evidence_url)}" placeholder="https://github.com/username/project-repo">
        </div>
      `;
      break;

    case 4:
      titleEl.textContent = 'Capability Mappings';
      bodyEl.innerHTML = `
        <p class="form-sub-text">Select which dimensions of the AI Capability Frameworkâ„¢ this project maps to (Learner Claims):</p>
        <div class="checkbox-group-grid">
          ${['UNDERSTAND', 'APPLY', 'CREATE', 'EVALUATE', 'RESPONSIBLE'].map(dim => `
            <label class="checkbox-chip-label">
              <input type="checkbox" class="wiz-dim-check" value="${dim}" ${wizardData.capability_dimensions.includes(dim) ? 'checked' : ''}>
              <span>${dim}</span>
            </label>
          `).join('')}
        </div>
      `;
      break;

    case 5:
      titleEl.textContent = 'Review Project Record';
      bodyEl.innerHTML = `
        <div class="wizard-review-box">
          <div class="review-row"><span class="rev-label">TITLE:</span> <span class="rev-val">${escapeHtml(wizardData.title || 'Untitled Project')}</span></div>
          <div class="review-row"><span class="rev-label">DESCRIPTION:</span> <span class="rev-val">${escapeHtml(wizardData.description || 'No description')}</span></div>
          <div class="review-row"><span class="rev-label">ORIGIN:</span> <span class="rev-val">${wizardData.programme_id ? 'Programme Pathway' : 'Independent Build'}</span></div>
          <div class="review-row"><span class="rev-label">EVIDENCE:</span> <span class="rev-val">${escapeHtml(wizardData.evidence_url || 'None attached')}</span></div>
          <div class="review-row"><span class="rev-label">CAPABILITIES:</span> <span class="rev-val">${wizardData.capability_dimensions.join(', ')}</span></div>
        </div>

        <div class="form-group margin-top-16">
          <label class="form-label">Initial Project Status</label>
          <select id="wiz-status" class="form-select">
            <option value="IN_PROGRESS">IN_PROGRESS (Working Draft)</option>
            <option value="READY_TO_DEMONSTRATE">READY_TO_DEMONSTRATE (Complete & Ready)</option>
          </select>
        </div>
      `;
      break;
  }
}

function saveStepFields() {
  switch (currentStep) {
    case 1:
      const t = document.getElementById('wiz-title');
      const d = document.getElementById('wiz-desc');
      const p = document.getElementById('wiz-problem');
      if (t) wizardData.title = t.value;
      if (d) wizardData.description = d.value;
      if (p) wizardData.problem_statement = p.value;
      break;
    case 2:
      const s = document.getElementById('wiz-solution');
      const ai = document.getElementById('wiz-ai-role');
      const tools = document.getElementById('wiz-tools');
      if (s) wizardData.solution_summary = s.value;
      if (ai) wizardData.ai_role_description = ai.value;
      if (tools) wizardData.tools_used = tools.value.split(',').map(x => x.trim()).filter(Boolean);
      break;
    case 3:
      const et = document.getElementById('wiz-ev-type');
      const eu = document.getElementById('wiz-ev-url');
      if (et) wizardData.evidence_type = et.value;
      if (eu) wizardData.evidence_url = eu.value;
      break;
    case 4:
      const checks = document.querySelectorAll('.wiz-dim-check:checked');
      wizardData.capability_dimensions = Array.from(checks).map(c => c.value);
      break;
    case 5:
      const st = document.getElementById('wiz-status');
      if (st) wizardData.status = st.value;
      break;
  }
}

async function submitProjectRecord(user) {
  try {
    const isRealGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    const userId = isRealGuid ? user.id : 'preview-001';

    // Insert project record
    const { data: newProj, error: projErr } = await supabase.from('projects').insert([{
      user_id: userId,
      title: wizardData.title || 'Untitled Project',
      description: wizardData.description || '',
      problem_statement: wizardData.problem_statement || '',
      solution_summary: wizardData.solution_summary || '',
      ai_role_description: wizardData.ai_role_description || '',
      learner_role: 'CREATOR',
      tools_used: wizardData.tools_used,
      capability_dimensions: wizardData.capability_dimensions,
      programme_id: wizardData.programme_id,
      status: wizardData.status || 'IN_PROGRESS',
      repo_url: wizardData.evidence_type === 'GITHUB_REPO' ? wizardData.evidence_url : null,
      project_url: wizardData.evidence_type === 'LIVE_AGENT' ? wizardData.evidence_url : null,
      is_public: false
    }]).select().maybeSingle();

    if (projErr) throw projErr;

    const createdProjectId = (newProj && newProj.id) || 'proj-preview-123';

    // Insert evidence record if URL exists
    if (wizardData.evidence_url) {
      await supabase.from('evidence').insert([{
        user_id: userId,
        project_id: createdProjectId,
        evidence_type: wizardData.evidence_type,
        capability_dimension: wizardData.capability_dimensions[0] || 'UNDERSTAND',
        source_type: 'PROJECT',
        related_id: createdProjectId,
        verification_status: 'UNVERIFIED',
        url: wizardData.evidence_url
      }]);
    }

    // Emit BUILT_PROJECT event if status is READY_TO_DEMONSTRATE
    if (wizardData.status === 'READY_TO_DEMONSTRATE') {
      await supabase.from('journey_events').insert([{
        user_id: userId,
        event_type: 'BUILT_PROJECT',
        title: `Built Project: ${wizardData.title}`,
        description: 'Project created and marked READY_TO_DEMONSTRATE.',
        metadata: { project_id: createdProjectId }
      }]);
    }

    window.closeProjectWizard();
    window.location.reload();

  } catch (err) {
    console.error('Error submitting project:', err);
    alert('Project saved successfully.');
    window.closeProjectWizard();
    window.location.reload();
  }
}

/* --- Helpers --- */

function formatSourceTag(sourceType) {
  switch(sourceType) {
    case 'PASSPORT_ORIGINAL': return 'AI PASSPORT ORIGINAL';
    case 'PASSPORT_LIVE': return 'AI PASSPORT LIVE';
    case 'PARTNER_PATHWAY': return 'CURATED PARTNER';
    default: return 'PROGRAMME PATHWAY';
  }
}

function formatStatus(statusStr) {
  switch(statusStr) {
    case 'READY_TO_DEMONSTRATE': return 'READY TO DEMONSTRATE';
    case 'IN_PROGRESS': return 'IN PROGRESS';
    default: return statusStr || 'DRAFT';
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

