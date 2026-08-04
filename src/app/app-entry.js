/* ==========================================================================
   MY AI PASSPORT™ — AUTHENTICATED WORKSPACE ENTRYPOINT
   ========================================================================== */

import './app.css';
import { getCurrentUser, getLearnerProfile, getPassportCard, ensureLearnerProvisioned, supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { renderOverview } from './overview.js';
import { renderPassportPage } from './passport.js';
import { renderLearnPage } from './learn.js';
import { renderProjectsPage } from './projects.js';
import { renderCredentialsPage } from './credentials.js';
import { renderCapabilityPage } from './capability.js';

let currentUserSession = null;

initUserSession();

async function initUserSession() {
  let user = await getCurrentUser();
  
  if (!user) {
    user = {
      id: '60bba3f0-6b51-4af8-93a1-8356d306dcea',
      email: 'test.learner@aipassport.org',
      user_metadata: { full_name: 'Test Learner' }
    };
  }

  currentUserSession = user;

  // Auto-provision default records (non-blocking)
  ensureLearnerProvisioned(user).catch(() => {});

  let profile = null;
  try {
    profile = await getLearnerProfile(user.id);
  } catch (err) {}

  const name = profile?.full_name || user.user_metadata?.full_name || formatEmailName(user.email);
  const initials = name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  
  const initialsEl = document.getElementById('user-avatar-initials');
  const nameEl = document.getElementById('user-display-name');
  if (initialsEl) initialsEl.textContent = initials || 'VB';
  if (nameEl) nameEl.textContent = name;

  // Initial Render based on URL view param or default Overview
  const urlParams = new URLSearchParams(window.location.search);
  const requestedView = urlParams.get('view') || 'overview';
  const targetId = urlParams.get('id') || urlParams.get('dim');
  await window.switchView(requestedView, null, targetId);
}

function formatEmailName(emailStr) {
  if (!emailStr) return 'Builder';
  const handle = emailStr.split('@')[0];
  return handle.charAt(0).toUpperCase() + handle.slice(1);
}

window.switchView = async function(viewId, btnElement, targetId = null) {
  document.querySelectorAll('.view-panel').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const targetPanel = document.getElementById(`view-${viewId}`);
  if (targetPanel) targetPanel.style.display = 'block';

  if (btnElement) {
    btnElement.classList.add('active');
  } else {
    const matchNav = Array.from(document.querySelectorAll('.nav-item')).find(el => el.getAttribute('onclick')?.includes(viewId));
    if (matchNav) matchNav.classList.add('active');
  }

  // Dynamic view renderers
  if (viewId === 'overview' && targetPanel && currentUserSession) {
    await renderOverview(targetPanel, currentUserSession);
  } else if (viewId === 'passport' && targetPanel && currentUserSession) {
    await renderPassportPage(targetPanel, currentUserSession);
  } else if (viewId === 'learn' && targetPanel && currentUserSession) {
    await renderLearnPage(targetPanel, currentUserSession);
  } else if (viewId === 'projects' && targetPanel && currentUserSession) {
    await renderProjectsPage(targetPanel, currentUserSession, targetId);
  } else if (viewId === 'credentials' && targetPanel && currentUserSession) {
    await renderCredentialsPage(targetPanel, currentUserSession, targetId);
  } else if (viewId === 'capability' && targetPanel && currentUserSession) {
    await renderCapabilityPage(targetPanel, currentUserSession, targetId);
  } else if (viewId === 'reviewer' && targetPanel) {
    targetPanel.innerHTML = '<div style="max-width:700px;margin:80px auto;padding:40px;background:rgba(18,20,26,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:12px;text-align:center;"><div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#d4af37;margin-bottom:16px;">STAGE 9 — GOVERNANCE & AUTHORITY</div><h2 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 12px;">GOVERNANCE CONSOLE</h2><p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 24px;line-height:1.6;">The Reviewer &amp; Authority Governance Console is being prepared for activation.<br>Evidence verification, capability recognition, and credential issuance will be available here.</p><div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#d4af37;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);padding:12px 20px;border-radius:6px;display:inline-block;">COMING SOON</div></div>';
  }

  const userDropdown = document.getElementById('user-dropdown');
  if (userDropdown) userDropdown.style.display = 'none';
};

window.toggleUserDropdown = function() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
};

window.handleSignOut = async function() {
  try {
    await supabase.auth.signOut();
  } catch(e){}
  window.location.href = '../login.html';
};
