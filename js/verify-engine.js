import certDBData, { masterCertList } from '../scratch/certificateDB.js';

/* ==========================================================================
   AI PASSPORT™ — OFFICIAL VERIFICATION PORTAL ENGINE
   Strict Source of Truth: Physical Certificate PNG Files & OCR Verification
   Total Verified Certificates: 126 (52 Sept 2026 + 74 Oct 2026)
   ========================================================================== */

const certificateDB = {
  ...certDBData
};

const allRecords = Array.isArray(masterCertList) ? masterCertList : [];

function findCertificateRecord(query) {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();
  const upperQ = q.toUpperCase();

  // 1. Check Passport ID (e.g. "AIP-2026-0533", "0533", "533")
  const numMatch = q.match(/(?:aip-)?(?:2026-)?(\d{1,4})$/i);
  if (numMatch) {
    const padded = ("0000" + numMatch[1]).slice(-4);
    const targetId = `AIP-2026-${padded}`;
    const idMatches = allRecords.filter(r => r.certId === targetId);
    if (idMatches.length > 0) {
      // If multiple records share this ID (e.g. across cohorts), pick the one matching name if provided, else latest
      const nameMatch = idMatches.find(r => r.name.toLowerCase().includes(q));
      const chosen = nameMatch || idMatches[idMatches.length - 1];
      return { certId: chosen.certId, record: chosen };
    }
  }

  // 2. Direct exact candidate name or email match
  const exactMatch = allRecords.find(r => 
    r.name.toLowerCase() === q || 
    (r.email && r.email.toLowerCase() === q)
  );
  if (exactMatch) {
    return { certId: exactMatch.certId, record: exactMatch };
  }

  // 3. Partial candidate name match
  const partialMatch = allRecords.find(r => r.name.toLowerCase().includes(q));
  if (partialMatch) {
    return { certId: partialMatch.certId, record: partialMatch };
  }

  // 4. Fallback dictionary lookup
  const direct = certificateDB[upperQ] || certificateDB[q];
  if (direct) {
    const rec = Array.isArray(direct) ? direct[direct.length - 1] : direct;
    return { certId: rec.certId || upperQ, record: rec };
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

    const rawImgPath = record.certImage || '';
    const cleanFilename = rawImgPath
      .replace(/^\/public\/certificates\//, '')
      .replace(/^public\/certificates\//, '')
      .replace(/^\/certificates\//, '')
      .replace(/^certificates\//, '')
      .replace(/^\//, '');
    
    if (cleanFilename) {
      const pagePath = window.location.pathname;
      const baseDir = pagePath.substring(0, pagePath.lastIndexOf('/') + 1);
      
      const possibleSrcs = [
        `public/certificates/${cleanFilename}`,
        `./public/certificates/${cleanFilename}`,
        `${baseDir}public/certificates/${cleanFilename}`,
        `/public/certificates/${cleanFilename}`,
        `certificates/${cleanFilename}`,
        `./certificates/${cleanFilename}`,
        `${baseDir}certificates/${cleanFilename}`,
        `/certificates/${cleanFilename}`
      ];

      const downloadFilename = `${(record.name || 'AI_Passport').trim().replace(/[^a-zA-Z0-9_-]+/g, '_')}_Certificate.png`;

      if (imgEl) {
        let srcIdx = 0;
        imgEl.src = possibleSrcs[0];
        imgEl.onerror = () => {
          srcIdx++;
          if (srcIdx < possibleSrcs.length) {
            imgEl.src = possibleSrcs[srcIdx];
          }
        };
      }

      if (downloadBtn) {
        downloadBtn.href = possibleSrcs[0];
        downloadBtn.setAttribute('download', downloadFilename);
        downloadBtn.setAttribute('target', '_self');
        downloadBtn.onclick = null;

        let fetchIdx = 0;
        const tryFetchBlob = () => {
          if (fetchIdx >= possibleSrcs.length) return;
          const targetUrl = possibleSrcs[fetchIdx];
          fetch(targetUrl)
            .then(res => {
              if (!res.ok) throw new Error('Fetch failed');
              return res.blob();
            })
            .then(blob => {
              const blobUrl = URL.createObjectURL(blob);
              downloadBtn.href = blobUrl;
              downloadBtn.setAttribute('download', downloadFilename);
            })
            .catch(() => {
              fetchIdx++;
              tryFetchBlob();
            });
        };
        tryFetchBlob();

        downloadBtn.onclick = (e) => {
          if (downloadBtn.href && downloadBtn.href.startsWith('blob:')) {
            return;
          }
          if (e) e.preventDefault();
          const activeSrc = (imgEl && imgEl.src) ? imgEl.src : possibleSrcs[0];
          const a = document.createElement('a');
          a.href = activeSrc;
          a.download = downloadFilename;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
      }
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
