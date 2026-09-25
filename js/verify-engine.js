import certDBData from '../scratch/certificateDB.js';

/* ==========================================================================
   AI PASSPORT™ — OFFICIAL VERIFICATION PORTAL ENGINE
   Strict Source of Truth: (Bulk 1) AI PASSPORT LIVE CERTIFICATE 20 SEPT 2026
   ========================================================================== */

const certificateDB = {
  ...certDBData
};

function findCertificateRecord(query) {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, '');
  const upperQ = q.toUpperCase();

  // 1. Exact key match
  if (certificateDB[upperQ]) return { certId: upperQ, record: certificateDB[upperQ] };
  if (certificateDB[q]) return { certId: q, record: certificateDB[q] };
  if (qDigits && certificateDB[qDigits]) return { certId: qDigits, record: certificateDB[qDigits] };

  // 2. Flexible search (ID, Name, Digits)
  const entries = Object.entries(certificateDB);
  for (const [key, record] of entries) {
    const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const qClean = q.replace(/[^a-z0-9]/g, '');

    if (keyClean === qClean || (qClean.length >= 1 && keyClean.endsWith(qClean))) {
      return { certId: record.certId || key, record };
    }

    if (record.name && record.name.toLowerCase().includes(q)) {
      return { certId: record.certId || key, record };
    }

    if (qDigits && qDigits.length >= 1) {
      const keyDigits = key.replace(/\D/g, '');
      if (keyDigits.endsWith(qDigits) || keyDigits.replace(/^2026/, '').endsWith(qDigits)) {
        return { certId: record.certId || key, record };
      }
    }
  }
  return null;
}

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

  let rawQuery = (rawId || (input ? input.value : '')).trim();
  if (!rawQuery) return;

  let query = rawQuery;
  if (/^\d{1,4}$/.test(rawQuery)) {
    query = `AIP-2026-${("0000" + rawQuery).slice(-4)}`;
  } else if (/^aip-2026-\d{1,4}$/i.test(rawQuery)) {
    query = rawQuery.toUpperCase();
  }

  const match = findCertificateRecord(query) || findCertificateRecord(rawQuery);

  if (resultSection) {
    resultSection.style.display = 'block';
  }

  // --- MATCH FOUND (VERIFIED & AUTHENTICATED) ---
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
      statusSubtext.textContent = `Official Ekaakshar AI Passport™ Certificate Record Found for ${record.name}`;
    }
    if (statusIcon) {
      statusIcon.textContent = "✓";
      statusIcon.style.background = "#00e676";
      statusIcon.style.color = "#000";
    }
    if (timestamp) {
      timestamp.textContent = "Verified " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

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

    if (linkedinBtn) {
      const shareCertUrl = window.location.origin + window.location.pathname + '?id=' + encodeURIComponent(certId);
      const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent('AI Passport Live Credential')}&organizationName=${encodeURIComponent('Ekaakshar Education')}&issueYear=2026&issueMonth=09&certUrl=${encodeURIComponent(shareCertUrl)}&certId=${encodeURIComponent(certId)}`;
      linkedinBtn.href = linkedinUrl;
    }

    if (resultSection) {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  // --- NOT MATCHED (CERTIFICATE NOT VERIFIED) ---
  if (statusBanner) {
    statusBanner.style.background = "rgba(255, 68, 68, 0.06)";
    statusBanner.style.borderColor = "rgba(255, 68, 68, 0.25)";
  }
  if (statusTitle) {
    statusTitle.textContent = "CERTIFICATE NOT VERIFIED";
    statusTitle.style.color = "#ff4444";
  }
  if (statusSubtext) {
    statusSubtext.textContent = `No matching certificate record found in official repository for '${query}'. Certificate is unverified.`;
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

// Global scope binding
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

  if (input) {
    if (!input.value || !input.value.startsWith('AIP-2026-')) {
      input.value = 'AIP-2026-';
    }
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (!val.toUpperCase().startsWith('AIP-2026-')) {
        const clean = val.replace(/AIP-2026-/gi, '').replace(/^AIP-/gi, '');
        e.target.value = 'AIP-2026-' + clean;
      }
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

  // Check URL parameter e.g. verify.html?id=AIP-2026-0279
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id');
  if (paramId && paramId.trim()) {
    performVerification(paramId);
  } else if (resultSection) {
    resultSection.style.display = 'none';
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initVerificationPortal, 0);
} else {
  document.addEventListener('DOMContentLoaded', initVerificationPortal);
  window.addEventListener('load', initVerificationPortal);
}
