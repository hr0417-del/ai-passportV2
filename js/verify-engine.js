import certDBData from '../scratch/certificateDB.js';

/* ==========================================================================
   AI PASSPORT™ — DEDICATED VERIFICATION PORTAL ENGINE (v4.0)
   Features: 0ms Multi-Field Search, Dynamic Lazy DOM Lookup, Top-Level 
   Global Binding, LinkedIn Integration, Dual Export, URL Param Search.
   ========================================================================== */

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

// Perform Verification with Lazy DOM Selection
export function performVerification(rawId) {
  const input = document.getElementById('verify-input');
  const resultSection = document.getElementById('verify-result-section');
  const statusBanner = document.getElementById('verify-status-banner');
  const statusTitle = document.getElementById('status-title');
  const statusSubtext = document.getElementById('status-subtext');
  const statusIcon = document.getElementById('status-icon');
  const timestamp = document.getElementById('verification-timestamp');
  
  const imgContainer = document.getElementById('official-cert-image-container');
  const imgEl = document.getElementById('official-cert-image');
  const downloadBtn = document.getElementById('download-cert-btn');
  const linkedinBtn = document.getElementById('btn-add-linkedin');

  const query = (rawId || (input ? input.value : '')).trim();
  if (!query) return;

  const match = findCertificateRecord(query);

  // Show result section
  if (resultSection) {
    resultSection.style.display = 'block';
  }

  // --- STATE 1: MATCH FOUND (VERIFIED & AUTHENTICATED) ---
  if (match) {
    const { certId, record } = match;
    if (input) input.value = certId;

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

    // Update Official Certificate Image & Download Links
    const imgSrc = record.certImage ? record.certImage.replace(/^\//, '') : '';
    if (imgSrc && imgEl) {
      imgEl.src = imgSrc;
    }
    if (imgSrc && downloadBtn) {
      downloadBtn.href = imgSrc;
    }
    if (imgContainer) {
      imgContainer.style.display = 'block';
    }

    // Update LinkedIn Share URL
    if (linkedinBtn) {
      const shareCertUrl = window.location.origin + window.location.pathname + '?id=' + encodeURIComponent(certId);
      const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(record.event || 'AI Passport Live Credential')}&organizationName=${encodeURIComponent('Ekaakshar Education')}&issueYear=2026&issueMonth=09&certUrl=${encodeURIComponent(shareCertUrl)}&certId=${encodeURIComponent(certId)}`;
      linkedinBtn.href = linkedinUrl;
    }

    if (resultSection) {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  // --- STATE 2: NOT VERIFIED (NOT FOUND IN LEDGER) ---
  if (statusBanner) {
    statusBanner.style.background = "rgba(255, 68, 68, 0.06)";
    statusBanner.style.borderColor = "rgba(255, 68, 68, 0.25)";
  }
  if (statusTitle) {
    statusTitle.textContent = "CERTIFICATE NOT VERIFIED";
    statusTitle.style.color = "#ff4444";
  }
  if (statusSubtext) {
    statusSubtext.textContent = `No certificate record found in Google Drive repository for '${query}'.`;
  }
  if (statusIcon) {
    statusIcon.textContent = "✕";
    statusIcon.style.background = "#ff4444";
    statusIcon.style.color = "#fff";
  }
  if (timestamp) {
    timestamp.textContent = "Checked Just Now";
  }
  if (imgContainer) {
    imgContainer.style.display = 'none';
  }

  if (resultSection) {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// IMMEDIATE GLOBAL BINDING
window.performVerification = performVerification;
window.verifyCertificate = performVerification;

function initVerificationPortal() {
  const form = document.getElementById('verify-form');
  const input = document.getElementById('verify-input');
  const sampleBtns = document.querySelectorAll('.sample-id-btn');
  const resultSection = document.getElementById('verify-result-section');
  const copyBtn = document.getElementById('btn-copy-link');

  if (form) {
    form.addEventListener('submit', (e) => {
      if (e) e.preventDefault();
      performVerification(input ? input.value : '');
    });
  }

  sampleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      const id = btn.getAttribute('data-id');
      if (id) {
        if (input) input.value = id;
        performVerification(id);
      }
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const certId = input ? input.value : "AIP-2026-0279";
      const shareUrl = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(certId);
      navigator.clipboard.writeText(shareUrl).then(() => {
        const origText = copyBtn.textContent;
        copyBtn.textContent = "✓ Link Copied!";
        setTimeout(() => { copyBtn.textContent = origText; }, 2000);
      });
    });
  }

  // Parse URL parameter e.g. verify.html?id=AIP-2026-0287
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id');
  if (paramId && paramId.trim()) {
    performVerification(paramId);
  } else {
    // Clean initial load state
    if (resultSection) {
      resultSection.style.display = 'none';
    }
  }
}

// Initializer with Multi-Phase DOM Ready Triggers
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initVerificationPortal, 0);
} else {
  document.addEventListener('DOMContentLoaded', initVerificationPortal);
  window.addEventListener('load', initVerificationPortal);
}
