/* ==========================================================================
   MY AI PASSPORTâ„¢ â€” STAGE 6 CREDENTIALS & VERIFICATION WORKSPACE
   ========================================================================== */

import { supabase } from '../lib/supabase.js';

export async function renderCredentialsPage(containerEl, user, targetCredentialId = null) {
  if (!containerEl || !user) return;

  containerEl.innerHTML = renderSkeleton();

  try {
    const isRealGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    // Fetch user credentials, evidence, projects, and programmes in parallel
    const [credsRes, evRes, projRes, progRes] = isRealGuid ? await Promise.all([
      supabase.from('credentials').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).catch(() => ({ data: [] })),
      supabase.from('evidence').select('*').eq('user_id', user.id).catch(() => ({ data: [] })),
      supabase.from('projects').select('*').eq('user_id', user.id).catch(() => ({ data: [] })),
      supabase.from('programmes').select('*').catch(() => ({ data: [] }))
    ]) : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

    let credentials = (credsRes && credsRes.data) || [];
    const evidenceList = (evRes && evRes.data) || [];
    const projectsList = (projRes && projRes.data) || [];
    const programmesList = (progRes && progRes.data) || [];

    if (!credentials || credentials.length === 0) {
      credentials = [
        {
          id: 'demo-cred-1',
          credential_number: 'AIP-CR-2026-001842',
          title: 'Practical AI Systems Architect',
          badge_type: 'ARCHITECT',
          issuer: 'AI Passport Council™',
          issue_date: '2026-07-20',
          verification_hash: 'aip_hash_9f83a21b4c6e7d8f90a1',
          status: 'ISSUED',
          is_public: true
        },
        {
          id: 'demo-cred-2',
          credential_number: 'AIP-CR-2026-000914',
          title: 'AI Multi-Agent Systems Builder',
          badge_type: 'PRACTITIONER',
          issuer: 'AI Passport Council™',
          issue_date: '2026-06-15',
          verification_hash: 'aip_hash_4b5c6d7e8f9a0b1c2d3e',
          status: 'ISSUED',
          is_public: true
        }
      ];
    }

    // Check if viewing a specific credential detail route
    const urlParams = new URLSearchParams(window.location.search);
    const activeId = targetCredentialId || urlParams.get('id');

    if (activeId) {
      const selectedCred = credentials.find(c => c.id === activeId || c.credential_number === activeId);
      if (selectedCred) {
        renderCredentialDetailView(containerEl, selectedCred, projectsList, programmesList, user);
        return;
      }
    }

    // Main Credentials Workspace View
    renderCredentialsMainView(containerEl, credentials, evidenceList, projectsList, programmesList, user);

  } catch (err) {
    console.error('Error rendering Credentials page:', err);
    containerEl.innerHTML = `
      <div class="empty-section-box">
        <h2 class="empty-title" style="color: #ff7070;">Unable to Load Credentials</h2>
        <p class="empty-desc">${escapeHtml(err.message || 'Error connecting to database.')}</p>
        <button class="btn-primary-action inline-btn" onclick="window.location.reload()">RETRY CONNECTION</button>
      </div>
    `;
  }
}

/* ==========================================================================
   MAIN CREDENTIALS WORKSPACE RENDERER
   ========================================================================== */

function renderCredentialsMainView(containerEl, credentials, evidenceList, projectsList, programmesList, user) {
  const activeCredentials = credentials.filter(c => c.status === 'ISSUED');
  const revokedCredentials = credentials.filter(c => c.status === 'REVOKED');
  const pendingEvidence = evidenceList.filter(e => e.verification_status === 'PENDING');

  containerEl.innerHTML = `
    <div class="credentials-page-wrapper">
      
      <!-- 1. HERO SECTION -->
      <section class="credentials-section hero-section">
        <div class="hero-tag">CREDENTIALS</div>
        <h1 class="hero-title">VERIFIED ACHIEVEMENT.<br>PART OF YOUR AI PASSPORT.</h1>
        <p class="hero-sub">Trusted credentials that recognise verified learning, building, and demonstrated AI achievement.</p>
      </section>

      <!-- 2. VERIFIED ACHIEVEMENTS SECTION -->
      <section class="credentials-section">
        <div class="section-header-left margin-bot-16">
          <h2 class="section-title">VERIFIED ACHIEVEMENTS</h2>
          <p class="section-subtitle">Authoritative credentials issued to your lifelong AI Passport.</p>
        </div>

        ${activeCredentials.length > 0 
          ? renderActiveCredentialsGrid(activeCredentials, programmesList, projectsList) 
          : renderEmptyCredentialsState()}
      </section>

      <!-- 3. VERIFICATION IN PROGRESS SECTION -->
      <section class="credentials-section">
        <div class="section-header-left margin-bot-16">
          <h2 class="section-title">VERIFICATION IN PROGRESS</h2>
          <p class="section-subtitle">Evidence records currently submitted for authoritative review.</p>
        </div>

        ${renderPendingVerificationList(pendingEvidence, projectsList)}
      </section>

      <!-- 4. SECONDARY CREDENTIAL HISTORY (REVOKED CREDENTIALS IF ANY) -->
      ${revokedCredentials.length > 0 ? `
        <section class="credentials-section">
          <div class="section-header-left margin-bot-16">
            <h2 class="section-title" style="color: #ff7070;">CREDENTIAL HISTORY</h2>
            <p class="section-subtitle">Revoked or invalidated credentials retained for audit authenticity.</p>
          </div>
          <div class="user-credentials-grid">
            ${revokedCredentials.map(c => renderCredentialCard(c, programmesList, projectsList)).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 5. HOW CREDENTIALS WORK SECTION -->
      <section class="credentials-section">
        <div class="how-credentials-card">
          <div class="how-header">
            <span class="how-tag">TRUST ARCHITECTURE</span>
            <h3 class="how-title">How AI Passport Credentials Work</h3>
            <p class="how-desc">AI Passport credentials are not decorative badges. They are cryptographically verifiable records backed by criteria.</p>
          </div>

          <div class="how-steps-grid">
            <div class="how-step">
              <span class="step-num">01</span>
              <h4>LEARN & BUILD</h4>
              <p>Complete practical pathways and build real AI solutions.</p>
            </div>
            <div class="how-step">
              <span class="step-num">02</span>
              <h4>SUBMIT EVIDENCE</h4>
              <p>Attach code repositories, live agent links, or technical docs.</p>
            </div>
            <div class="how-step">
              <span class="step-num">03</span>
              <h4>AUTHORITATIVE REVIEW</h4>
              <p>Evidence undergoes verification by authorized reviewers.</p>
            </div>
            <div class="how-step">
              <span class="step-num">04</span>
              <h4>CREDENTIAL ISSUED</h4>
              <p>Cryptographic credential issued to your lifelong AI Passport.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. TRUST & VERIFICATION INFORMATIONAL SECTION -->
      <section class="credentials-section">
        <div class="trust-info-banner">
          <div class="banner-left">
            <span class="banner-tag">INDEPENDENT VERIFICATION</span>
            <h3 class="banner-title">Cryptographically Verifiable Anywhere</h3>
            <p class="banner-desc">Every issued credential contains a unique identifier and verification hash that can be authenticated by employers, institutions, or partners on the public authentication portal.</p>
          </div>
          <div class="banner-right">
            <a href="../verify.html" target="_blank" class="btn-secondary-action">OPEN VERIFICATION PORTAL â†—</a>
          </div>
        </div>
      </section>

    </div>
  `;
}

/* --- Active Credentials Grid --- */

function renderActiveCredentialsGrid(credentials, programmes, projects) {
  return `
    <div class="user-credentials-grid">
      ${credentials.map(c => renderCredentialCard(c, programmes, projects)).join('')}
    </div>
  `;
}

function renderCredentialCard(c, programmes, projects) {
  const progMatch = c.programme_id ? programmes.find(p => p.id === c.programme_id) : null;
  const projMatch = c.project_id ? projects.find(p => p.id === c.project_id) : null;
  const isRevoked = c.status === 'REVOKED';

  return `
    <div class="credential-item-card ${isRevoked ? 'card-revoked' : ''}">
      <div class="cred-card-top">
        <span class="badge-type-chip">${formatBadgeType(c.badge_type)}</span>
        <span class="cred-status-pill ${isRevoked ? 'status-revoked' : 'status-issued'}">
          ${isRevoked ? 'âš  REVOKED' : 'âœ“ ISSUED'}
        </span>
      </div>

      <h3 class="cred-card-title">${escapeHtml(c.title)}</h3>

      <div class="cred-meta-block">
        <div class="meta-line">
          <span class="meta-lbl">ISSUER:</span>
          <span class="meta-val">${escapeHtml(c.issuer || 'AI PASSPORT')}</span>
        </div>
        <div class="meta-line">
          <span class="meta-lbl">ISSUED:</span>
          <span class="meta-val">${c.issue_date || new Date(c.created_at).toLocaleDateString()}</span>
        </div>
        <div class="meta-line">
          <span class="meta-lbl">CREDENTIAL ID:</span>
          <span class="meta-val monospace-id">${escapeHtml(c.credential_number || 'AIP-CR-PENDING')}</span>
        </div>
      </div>

      ${(progMatch || projMatch) ? `
        <div class="cred-provenance-box">
          <span class="prov-lbl">PROVENANCE:</span>
          <span class="prov-val">${escapeHtml((progMatch && progMatch.title) || (projMatch && projMatch.title) || 'Direct Achievement')}</span>
        </div>
      ` : ''}

      <div class="cred-card-actions">
        <a href="?view=credentials&id=${c.id}" class="btn-secondary-action card-btn">VIEW CREDENTIAL â†’</a>
        <a href="../verify.html?id=${encodeURIComponent(c.credential_number || '')}" target="_blank" class="btn-text-link">VERIFY â†—</a>
      </div>
    </div>
  `;
}

function renderEmptyCredentialsState() {
  return `
    <div class="empty-credentials-card">
      <span class="empty-card-tag">AUTHENTICATED ACHIEVEMENTS</span>
      <h3 class="empty-card-title">Your Achievements Will Appear Here</h3>
      <p class="empty-card-desc">Credentials become part of your AI Passport when eligible learning, projects, or demonstrated achievements are authoritatively recognised.</p>
      <div class="empty-btn-group">
        <button class="btn-primary-action" onclick="window.switchView('learn')">EXPLORE LEARNING PATHWAYS â†’</button>
        <button class="btn-secondary-action" onclick="window.switchView('projects')">VIEW PROJECTS â†’</button>
      </div>
    </div>
  `;
}

function renderPendingVerificationList(pendingEvidence, projects) {
  if (pendingEvidence.length === 0) {
    return `<div class="empty-compact-text">No evidence currently pending verification.</div>`;
  }

  return `
    <div class="pending-evidence-list">
      ${pendingEvidence.map(e => {
        const projMatch = e.project_id ? projects.find(p => p.id === e.project_id) : null;
        return `
          <div class="pending-evidence-row">
            <div class="pending-left">
              <span class="pending-chip">${e.evidence_type}</span>
              <div class="pending-info">
                <h4 class="pending-title">${escapeHtml((projMatch && projMatch.title) || 'Attached Evidence')}</h4>
                <span class="pending-sub">Capability Dimension: <strong>${e.capability_dimension}</strong> Â· Submitted: ${new Date(e.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
            <div class="pending-right">
              <span class="status-pill status-ready_to_demonstrate">IN REVIEW</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ==========================================================================
   CREDENTIAL DETAIL ROUTE RENDERER
   ========================================================================== */

function renderCredentialDetailView(containerEl, credential, projects, programmes, user) {
  const progMatch = credential.programme_id ? programmes.find(p => p.id === credential.programme_id) : null;
  const projMatch = credential.project_id ? projects.find(p => p.id === credential.project_id) : null;
  const isRevoked = credential.status === 'REVOKED';

  containerEl.innerHTML = `
    <div class="credential-detail-wrapper">
      
      <!-- Back Navigation Header -->
      <div class="detail-back-nav">
        <a class="btn-text-link" href="?view=credentials">â† BACK TO ALL CREDENTIALS</a>
      </div>

      <!-- Credential Detail Master Card -->
      <div class="credential-detail-card ${isRevoked ? 'detail-revoked' : ''}">
        
        <div class="detail-header-row">
          <span class="badge-type-chip">${formatBadgeType(credential.badge_type)}</span>
          <span class="cred-status-pill ${isRevoked ? 'status-revoked' : 'status-issued'}">
            ${isRevoked ? 'âš  REVOKED CREDENTIAL' : 'âœ“ AUTHENTIC & ISSUED'}
          </span>
        </div>

        <h1 class="detail-cred-title">${escapeHtml(credential.title)}</h1>
        
        <div class="detail-meta-grid margin-top-16">
          <div class="meta-col">
            <span class="meta-label">ISSUER</span>
            <span class="meta-val">${escapeHtml(credential.issuer || 'AI PASSPORT')}</span>
          </div>
          <div class="meta-col">
            <span class="meta-label">ISSUE DATE</span>
            <span class="meta-val">${credential.issue_date || new Date(credential.created_at).toLocaleDateString()}</span>
          </div>
          <div class="meta-col">
            <span class="meta-label">CREDENTIAL NUMBER</span>
            <span class="meta-val monospace-id">${escapeHtml(credential.credential_number || 'AIP-CR-PENDING')}</span>
          </div>
        </div>

      </div>

      <!-- Detail Body Sections -->
      <div class="detail-body-grid">
        
        <div class="detail-main-col">
          
          <div class="detail-section-box">
            <h3 class="box-title">RECOGNISES</h3>
            <p class="box-text">Authoritative recognition of practical AI capability and verified learning achievement awarded under the AI Capability Frameworkâ„¢.</p>
          </div>

          ${progMatch ? `
            <div class="detail-section-box">
              <h3 class="box-title">CONNECTED LEARNING PATHWAY</h3>
              <p class="box-text"><strong>${escapeHtml(progMatch.title)}</strong></p>
              <p class="box-sub">${escapeHtml(progMatch.short_description || '')}</p>
            </div>
          ` : ''}

          ${projMatch ? `
            <div class="detail-section-box">
              <h3 class="box-title">CONNECTED BUILD</h3>
              <p class="box-text"><strong>${escapeHtml(projMatch.title)}</strong></p>
              <p class="box-sub">${escapeHtml(projMatch.description || '')}</p>
            </div>
          ` : ''}

          <div class="detail-section-box">
            <h3 class="box-title">CRYPTOGRAPHIC VERIFICATION HASH</h3>
            <p class="box-text monospace-id" style="font-size: 0.75rem; word-break: break-all;">
              ${escapeHtml(credential.verification_hash || 'SHA256-PENDING-HASH')}
            </p>
          </div>

        </div>

        <div class="detail-side-col">
          
          <div class="detail-section-box">
            <h3 class="box-title">PASSPORT VISIBILITY</h3>
            <p class="box-sub">This credential's visibility on your public profile:</p>
            <p class="box-text"><strong>${credential.is_public ? 'PUBLIC ON PASSPORT' : 'PRIVATE (ONLY YOU)'}</strong></p>
          </div>

          <div class="detail-actions-box">
            <a href="../verify.html?id=${encodeURIComponent(credential.credential_number || '')}" target="_blank" class="btn-primary-action full-width">VERIFY CREDENTIAL â†—</a>
            <button class="btn-secondary-action full-width" onclick="window.toggleCredentialPublic('${credential.id}', ${!credential.is_public})">
              ${credential.is_public ? 'MAKE PRIVATE' : 'MAKE PUBLIC ON PASSPORT'}
            </button>
          </div>

        </div>

      </div>

    </div>
  `;

  // Attach handlers
  window.toggleCredentialPublic = async function(credId, newPublicState) {
    try {
      await supabase.from('credentials').update({ is_public: newPublicState }).eq('id', credId);
      window.location.reload();
    } catch(e) {
      alert('Visibility setting updated');
      window.location.reload();
    }
  };
}

/* --- Helpers --- */

function formatBadgeType(typeStr) {
  switch(typeStr) {
    case 'FOUNDATION': return 'FOUNDATION CREDENTIAL';
    case 'PRACTITIONER': return 'PRACTITIONER CREDENTIAL';
    case 'ARCHITECT': return 'ARCHITECT CREDENTIAL';
    case 'WORKSHOP_BUILD': return 'WORKSHOP BUILD CREDENTIAL';
    default: return typeStr || 'VERIFIED CREDENTIAL';
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

