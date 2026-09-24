import certDBData from '../scratch/certificateDB.js';

/* ==========================================================================
   AI PASSPORT™ — DEDICATED VERIFICATION PORTAL ENGINE (v3.0)
   Features: 0ms Multi-Field Search, Clean Initial State, LinkedIn Integration,
   Dual PNG/PDF Export, and Direct URL Parameter Loading.
   ========================================================================== */

function initVerificationPortal() {
  const form = document.getElementById('verify-form');
  const input = document.getElementById('verify-input');
  const sampleBtns = document.querySelectorAll('.sample-id-btn');
  const resultSection = document.getElementById('verify-result-section');
  
  const statusBanner = document.getElementById('verify-status-banner');
  const statusTitle = document.getElementById('status-title');
  const statusSubtext = document.getElementById('status-subtext');
  const statusIcon = document.getElementById('status-icon');
  const timestamp = document.getElementById('verification-timestamp');
  
  const certDisplay = document.getElementById('certificate-card-display');
  const nameEl = document.getElementById('cert-participant-name');
  const levelEl = document.getElementById('cert-level-badge');
  const eventTitleEl = document.getElementById('cert-event-title');
  const dateEl = document.getElementById('cert-issue-date');
  const certIdEl = document.getElementById('cert-id-display');
  const sigEl = document.getElementById('cert-signatory');
  const descEl = document.getElementById('cert-description');
  
  const imgContainer = document.getElementById('official-cert-image-container');
  const imgEl = document.getElementById('official-cert-image');
  const downloadBtn = document.getElementById('download-cert-btn');
  const linkedinBtn = document.getElementById('btn-add-linkedin');
  const copyBtn = document.getElementById('btn-copy-link');

  if (!form || !input) return;

  const certificateDB = {
    ...certDBData
  };

  // 0ms Multi-Field Lookup Engine
  function findCertificateRecord(query) {
    if (!query || !query.trim()) return null;
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    const upperQ = q.toUpperCase();

    // 1. Direct match by exact key, lower key, or numeric key
    if (certificateDB[upperQ]) {
      return { certId: upperQ, record: certificateDB[upperQ] };
    }
    if (certificateDB[q]) {
      return { certId: q, record: certificateDB[q] };
    }
    if (qDigits && certificateDB[qDigits]) {
      return { certId: qDigits, record: certificateDB[qDigits] };
    }

    // 2. Multi-field search (ID, Name, Email, Phone, Digits)
    const entries = Object.entries(certificateDB);
    for (const [key, record] of entries) {
      const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const qClean = q.replace(/[^a-z0-9]/g, '');

      // Key match normalized
      if (keyClean === qClean || (qClean.length >= 1 && keyClean.endsWith(qClean))) {
        return { certId: key, record };
      }

      // Name match
      if (record.name && record.name.toLowerCase().includes(q)) {
        return { certId: key, record };
      }

      // Email match
      if (record.email && record.email.toLowerCase().includes(q)) {
        return { certId: key, record };
      }

      // Phone match
      if (record.phone && qDigits && record.phone.includes(qDigits)) {
        return { certId: key, record };
      }

      // Numeric ID match (any length >= 1)
      if (qDigits && qDigits.length >= 1) {
        const keyDigits = key.replace(/\D/g, '');
        if (
          keyDigits.endsWith(qDigits) ||
          keyDigits.replace(/^2026/, '').endsWith(qDigits) ||
          keyDigits.replace(/^2026/, '').replace(/^0+/, '').endsWith(qDigits)
        ) {
          return { certId: key, record };
        }
      }
    }
    return null;
  }

  function performVerification(rawId) {
    if (!rawId || !rawId.trim()) return;
    const query = rawId.trim();

    const match = findCertificateRecord(query);

    // Un-hide results section on search
    if (resultSection) {
      resultSection.style.display = 'block';
    }

    // --- STATE 1: MATCH FOUND (VERIFIED & AUTHENTICATED) ---
    if (match) {
      const { certId, record } = match;
      input.value = certId;

      // Update Status Banner
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

      // Update Certificate Card Replica
      if (nameEl) nameEl.textContent = record.name;
      if (levelEl) levelEl.textContent = record.level;
      if (eventTitleEl) eventTitleEl.textContent = record.event;
      if (dateEl) dateEl.textContent = record.date;
      if (certIdEl) certIdEl.textContent = certId;
      if (sigEl) sigEl.textContent = record.signatory;
      if (descEl) descEl.innerHTML = record.description;

      if (certDisplay) certDisplay.style.display = "block";

      // Update Official Certificate Image
      const imgSrc = record.certImage ? record.certImage.replace(/^\//, '') : '';
      if (imgSrc && imgContainer && imgEl) {
        imgEl.src = imgSrc;
        if (downloadBtn) downloadBtn.href = imgSrc;
        imgContainer.style.display = 'block';
      } else if (imgContainer) {
        imgContainer.style.display = 'none';
      }

      // Update 1-Click LinkedIn Share Button
      if (linkedinBtn) {
        const certName = encodeURIComponent(`AI Passport™ ${record.level || 'Level 1 – AI Explorer'}`);
        const orgName = encodeURIComponent('Ekaakshar Education');
        const certUrl = encodeURIComponent(`https://aipassport.ekaakshareducation.com/verify.html?id=${certId}`);
        const issueYear = '2026';
        const issueMonth = '9'; // September

        const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${certUrl}&certId=${encodeURIComponent(certId)}`;
        linkedinBtn.setAttribute('href', linkedinUrl);
        linkedinBtn.setAttribute('target', '_blank');
      }

      // Smooth scroll down to results section
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // --- STATE 2: NOT FOUND (NOT AUTHENTICATED) ---
    if (statusBanner) {
      statusBanner.style.background = "rgba(255, 68, 68, 0.06)";
      statusBanner.style.borderColor = "rgba(255, 68, 68, 0.25)";
    }
    if (statusTitle) {
      statusTitle.textContent = "CREDENTIAL NOT FOUND";
      statusTitle.style.color = "#ff4444";
    }
    if (statusSubtext) {
      statusSubtext.textContent = `No active Ekaakshar certificate record matches '${query}'. Search by Passport ID (e.g. AIP-2026-0279), Full Name, or Email Address.`;
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
    if (imgContainer) imgContainer.style.display = 'none';

    if (resultSection) {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Bind Form Submit
  form.addEventListener('submit', (e) => {
    if (e) e.preventDefault();
    performVerification(input.value);
  });

  // Bind Sample Quick Buttons
  sampleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      const id = btn.getAttribute('data-id');
      if (id) {
        input.value = id;
        performVerification(id);
      }
    });
  });

  // Bind Copy Verification Link Button
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const certId = input.value || "AIP-2026-0279";
      const shareUrl = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(certId);
      navigator.clipboard.writeText(shareUrl).then(() => {
        const origText = copyBtn.textContent;
        copyBtn.textContent = "✓ Link Copied!";
        setTimeout(() => { copyBtn.textContent = origText; }, 2000);
      });
    });
  }

  // Global Scope Attachment
  window.performVerification = performVerification;

  // Direct URL Parameter Check e.g. verify.html?id=AIP-2026-0287
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id');
  if (paramId && paramId.trim()) {
    performVerification(paramId);
  } else {
    // CLEAN DEFAULT LOAD STATE: Hide results container initially
    if (resultSection) {
      resultSection.style.display = 'none';
    }
  }
}

// Initializer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVerificationPortal);
} else {
  initVerificationPortal();
}
