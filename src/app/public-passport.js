/* ==========================================================================
   MY AI PASSPORT™ — STAGE 8 PUBLIC PASSPORT RENDERER
   ========================================================================== */

import { supabase } from '../lib/supabase.js';

export async function initPublicPassportView() {
  const urlParams = new URLSearchParams(window.location.search);
  const identifier = urlParams.get('id') || urlParams.get('user');

  // If no identifier parameter is present in URL, keep default marketing page
  if (!identifier) return;

  const mainContainer = document.querySelector('main') || document.body;
  
  // Render loading skeleton
  mainContainer.innerHTML = `
    <div style="max-width: 1000px; margin: 120px auto; padding: 0 24px; color: #fff; text-align: center;">
      <div style="font-family: 'Space Mono', monospace; font-size: 0.8rem; color: var(--color-gold); letter-spacing: 0.15em;">MY AI PASSPORT™</div>
      <h2 style="font-family: var(--font-serif); font-size: 1.8rem; margin: 12px 0;">Authenticating Public Passport...</h2>
    </div>
  `;

  try {
    // Single Scoped RPC Query
    const { data: res, error } = await supabase.rpc('get_public_passport', { p_identifier: identifier });

    if (error || !res || res.status !== 'PUBLIC') {
      renderPassportUnavailable(mainContainer);
      return;
    }

    renderPublicPassport(mainContainer, res);

  } catch (err) {
    console.error('Error fetching Public Passport:', err);
    renderPassportUnavailable(mainContainer);
  }
}

function renderPublicPassport(containerEl, data) {
  const { identity, record, capabilities, projects, evidence, credentials } = data;

  const memberSinceYear = identity.member_since ? new Date(identity.member_since).getFullYear() : '2026';

  containerEl.innerHTML = `
    <div class="public-passport-wrapper" style="max-width: 1040px; margin: 100px auto 60px auto; padding: 0 24px; color: #ffffff;">
      
      <!-- 1. HERO SECTION -->
      <section class="public-hero-card" style="background: rgba(12, 12, 12, 0.96); border: 1px solid rgba(223, 207, 173, 0.3); border-radius: 16px; padding: 36px 32px; display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--color-gold); letter-spacing: 0.2em; margin-bottom: 6px;">MY AI PASSPORT™ · DIGITAL IDENTITY</div>
            <h1 style="font-family: var(--font-serif); font-size: 2.3rem; font-weight: 700; color: #ffffff; margin: 0 0 6px 0; line-height: 1.2;">${escapeHtml(identity.full_name)}</h1>
            <p style="font-size: 0.92rem; color: var(--color-text-secondary); margin: 0; max-width: 600px;">${escapeHtml(identity.bio || 'A living record of AI capability, real-world builds, evidence, and recognised achievement.')}</p>
          </div>

          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <span style="font-family: 'Space Mono', monospace; font-size: 0.72rem; color: var(--color-gold); background: rgba(223, 207, 173, 0.1); border: 1px solid rgba(223, 207, 173, 0.3); padding: 4px 12px; border-radius: 6px;">ACTIVE AI PASSPORT</span>
            <span style="font-family: 'Space Mono', monospace; font-size: 0.75rem; color: #ffffff; font-weight: 700;">ID: ${escapeHtml(identity.passport_number)}</span>
          </div>
        </div>

        <!-- Share Actions -->
        <div style="display: flex; gap: 12px; margin-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px;">
          <button class="btn-passport-cta" onclick="window.handleSharePassport('${escapeHtml(identity.passport_number)}')">SHARE PASSPORT ↗</button>
          <button class="btn-passport-secondary" onclick="window.toggleQrModal()">SHOW QR 📱</button>
        </div>
      </section>

      <!-- 2. PASSPORT RECORD SUMMARY STRIP -->
      <section style="margin-top: 24px; background: rgba(10, 10, 10, 0.95); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px 24px; display: flex; justify-content: space-around; align-items: center; text-align: center;">
        <div>
          <span style="font-family: 'Space Mono', monospace; font-size: 0.6rem; color: var(--color-gold); display: block;">PASSPORT ID</span>
          <span style="font-size: 0.9rem; font-weight: 700; color: #fff;">${escapeHtml(identity.passport_number)}</span>
        </div>
        <span style="color: rgba(255,255,255,0.15);">•</span>
        <div>
          <span style="font-family: 'Space Mono', monospace; font-size: 0.6rem; color: var(--color-gold); display: block;">MEMBER SINCE</span>
          <span style="font-size: 0.9rem; font-weight: 700; color: #fff;">${memberSinceYear}</span>
        </div>
        <span style="color: rgba(255,255,255,0.15);">•</span>
        <div>
          <span style="font-family: 'Space Mono', monospace; font-size: 0.6rem; color: var(--color-gold); display: block;">PUBLIC BUILDS</span>
          <span style="font-size: 0.9rem; font-weight: 700; color: #fff;">${record.projects_count}</span>
        </div>
        <span style="color: rgba(255,255,255,0.15);">•</span>
        <div>
          <span style="font-family: 'Space Mono', monospace; font-size: 0.6rem; color: var(--color-gold); display: block;">VERIFIED EVIDENCE</span>
          <span style="font-size: 0.9rem; font-weight: 700; color: #fff;">${record.verified_evidence_count}</span>
        </div>
        <span style="color: rgba(255,255,255,0.15);">•</span>
        <div>
          <span style="font-family: 'Space Mono', monospace; font-size: 0.6rem; color: var(--color-gold); display: block;">CREDENTIALS</span>
          <span style="font-size: 0.9rem; font-weight: 700; color: #fff;">${record.credentials_count}</span>
        </div>
      </section>

      <!-- 3. AI CAPABILITY MATRIX -->
      <section style="margin-top: 32px;">
        <div style="margin-bottom: 16px;">
          <span style="font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--color-gold); letter-spacing: 0.15em;">AUTHORITATIVE STATE</span>
          <h2 style="font-family: var(--font-serif); font-size: 1.5rem; color: #fff; margin: 2px 0;">AI Capability Profile</h2>
        </div>

        <div style="background: rgba(12, 12, 12, 0.95); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
          ${(capabilities || []).map(cap => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 14px 18px; border-radius: 10px;">
              <span style="font-family: var(--font-serif); font-size: 1.1rem; font-weight: 700; color: #fff;">${cap.dimension}</span>
              <span class="state-pill state-${cap.state.toLowerCase()}">${cap.state}</span>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 4. SELECTED PUBLIC BUILDS & PROJECTS -->
      ${projects && projects.length > 0 ? `
        <section style="margin-top: 40px;">
          <div style="margin-bottom: 16px;">
            <span style="font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--color-gold); letter-spacing: 0.15em;">FEATURED BUILDS</span>
            <h2 style="font-family: var(--font-serif); font-size: 1.5rem; color: #fff; margin: 2px 0;">Projects & Artifacts</h2>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${projects.map(p => `
              <div style="background: rgba(12, 12, 12, 0.95); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h3 style="font-family: var(--font-serif); font-size: 1.15rem; color: #fff; margin: 0;">${escapeHtml(p.title)}</h3>
                  ${p.has_verified_evidence ? `<span style="font-family: 'Space Mono', monospace; font-size: 0.58rem; color: #00ff88; background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); padding: 2px 6px; border-radius: 4px;">BUILD WITH VERIFIED EVIDENCE</span>` : ''}
                </div>
                <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin: 0; line-height: 1.4;">${escapeHtml(p.description || p.problem_statement || '')}</p>

                ${p.project_url ? `
                  <a href="${p.project_url}" target="_blank" class="btn-text-link" style="margin-top: 8px;">VIEW DEPLOYED BUILD ↗</a>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 5. VERIFIED EVIDENCE -->
      ${evidence && evidence.length > 0 ? `
        <section style="margin-top: 40px;">
          <div style="margin-bottom: 16px;">
            <span style="font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--color-gold); letter-spacing: 0.15em;">AUTHORITATIVE PROOF</span>
            <h2 style="font-family: var(--font-serif); font-size: 1.5rem; color: #fff; margin: 2px 0;">Verified Evidence</h2>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${evidence.map(ev => `
              <div style="background: rgba(12, 12, 12, 0.95); border: 1px solid rgba(223, 207, 173, 0.2); border-radius: 10px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="font-family: 'Space Mono', monospace; font-size: 0.6rem; color: var(--color-gold); display: block;">${ev.evidence_type} · ${ev.capability_dimension}</span>
                  <a href="${ev.url || '#'}" target="_blank" style="font-size: 0.88rem; color: #ffffff; font-weight: 600; text-decoration: none;">${escapeHtml(ev.url || 'Verified Evidence Link')} ↗</a>
                </div>
                <span style="font-family: 'Space Mono', monospace; font-size: 0.65rem; color: #00ff88; background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); padding: 3px 8px; border-radius: 4px;">✓ VERIFIED EVIDENCE</span>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 6. ISSUED CREDENTIALS -->
      ${credentials && credentials.length > 0 ? `
        <section style="margin-top: 40px;">
          <div style="margin-bottom: 16px;">
            <span style="font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--color-gold); letter-spacing: 0.15em;">AUTHORITATIVE ACHIEVEMENTS</span>
            <h2 style="font-family: var(--font-serif); font-size: 1.5rem; color: #fff; margin: 2px 0;">Issued Credentials</h2>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${credentials.map(c => `
              <div style="background: rgba(12, 12, 12, 0.95); border: 1px solid rgba(223, 207, 173, 0.3); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 10px;">
                <span style="font-family: 'Space Mono', monospace; font-size: 0.6rem; color: var(--color-gold);">${c.credential_number}</span>
                <h3 style="font-family: var(--font-serif); font-size: 1.2rem; color: #fff; margin: 0;">${escapeHtml(c.title)}</h3>
                <span style="font-size: 0.78rem; color: var(--color-text-secondary);">Issued by ${escapeHtml(c.issuer)}</span>

                <a href="verify.html?id=${c.credential_number}" target="_blank" class="btn-text-link" style="margin-top: 8px;">VERIFY CREDENTIAL ↗</a>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 7. TRUST & FRAMEWORK INTEGRITY FOOTER -->
      <footer style="margin-top: 60px; background: rgba(10, 10, 10, 0.95); border-top: 1px solid rgba(255, 255, 255, 0.08); padding: 28px 24px; border-radius: 12px; font-size: 0.8rem; color: var(--color-text-secondary); line-height: 1.5;">
        <h4 style="font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--color-gold); letter-spacing: 0.15em; margin: 0 0 6px 0;">ABOUT THIS AI PASSPORT</h4>
        <p style="margin: 0;">This Public AI Passport presents selected capability, project, evidence, and credential records shared by the holder. Verification labels apply only to records that have received authoritative validation. Credentials can be independently validated through the <a href="verify.html" style="color: var(--color-gold);">AI Passport Verification Portal</a>.</p>
      </footer>

    </div>

    <!-- QR CODE MODAL -->
    <div id="qr-modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 1000; align-items: center; justify-content: center;">
      <div style="background: #0d0d0d; border: 1px solid rgba(223,207,173,0.4); border-radius: 16px; padding: 32px; width: 340px; text-align: center; color: #fff; display: flex; flex-direction: column; gap: 16px; align-items: center;">
        <span style="font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--color-gold); letter-spacing: 0.15em;">CANONICAL PASSPORT QR</span>
        <h3 style="font-family: var(--font-serif); font-size: 1.2rem; margin: 0;">${escapeHtml(identity.full_name)}</h3>

        <!-- Rendered QR Container -->
        <div style="background: #ffffff; padding: 16px; border-radius: 12px; width: 180px; height: 180px; display: flex; align-items: center; justify-content: center;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://aipassport.org/passport.html?id=' + identity.passport_number)}" alt="Passport QR" style="width: 100%; height: 100%;">
        </div>

        <span style="font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--color-text-secondary);">${escapeHtml(identity.passport_number)}</span>

        <button class="btn-primary-action full-width" onclick="window.toggleQrModal()">CLOSE</button>
      </div>
    </div>
  `;

  // Attach global window handlers
  window.handleSharePassport = function(num) {
    const canonicalUrl = `${window.location.origin}/passport.html?id=${num}`;
    if (navigator.share) {
      navigator.share({ title: `${identity.full_name} — AI Passport`, url: canonicalUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(canonicalUrl);
      alert('Passport URL copied to clipboard!');
    }
  };

  window.toggleQrModal = function() {
    const modal = document.getElementById('qr-modal-backdrop');
    if (modal) modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
  };
}

function renderPassportUnavailable(containerEl) {
  containerEl.innerHTML = `
    <div style="max-width: 600px; margin: 140px auto; padding: 40px 24px; background: rgba(12, 12, 12, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; text-align: center; color: #ffffff;">
      <div style="font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--color-gold); letter-spacing: 0.15em; margin-bottom: 8px;">MY AI PASSPORT™</div>
      <h2 style="font-family: var(--font-serif); font-size: 1.8rem; margin: 0 0 12px 0;">PASSPORT NOT AVAILABLE</h2>
      <p style="font-size: 0.88rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 24px;">This AI Passport is private or does not exist.</p>
      <a href="index.html" class="btn-primary-action">RETURN TO HOME</a>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
