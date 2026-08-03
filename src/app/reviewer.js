import { supabase } from '../lib/supabase.js';

export async function initReviewerConsole(container) {
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
      <div style="color: rgba(255,255,255,0.6); font-size: 14px; letter-spacing: 1px;">LOADING GOVERNANCE WORKSPACE...</div>
    </div>
  `;

  // 1. Verify User Session & Role
  const { data: { session } } = await supabase.auth.getSession();
  let userRole = 'LEARNER';
  let userId = null;

  if (session?.user) {
    userId = session.user.id;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', userId)
      .single();
    
    if (profile?.role) {
      userRole = profile.role;
    }
  } else {
    // Check preview mode fallback for local demonstration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('preview') === 'true' || urlParams.get('role') === 'admin') {
      userRole = 'ADMIN';
    } else if (urlParams.get('role') === 'reviewer') {
      userRole = 'REVIEWER';
    }
  }

  // Learner Access Restriction
  if (userRole === 'LEARNER') {
    container.innerHTML = `
      <div style="max-width: 800px; margin: 60px auto; padding: 40px; background: rgba(255, 68, 68, 0.05); border: 1px solid rgba(255, 68, 68, 0.2); border-radius: 12px; text-align: center;">
        <div style="font-size: 24px; font-weight: 700; color: #ff4444; letter-spacing: 1px; margin-bottom: 12px;">ACCESS DENIED</div>
        <div style="color: rgba(255,255,255,0.7); font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
          You do not have reviewer or administrative authority on MY AI PASSPORT™. Privileged governance features require an assigned REVIEWER or ADMIN role.
        </div>
        <a href="/app/index.html?view=overview" style="display: inline-block; padding: 12px 28px; background: #ffffff; color: #000000; font-weight: 600; text-decoration: none; border-radius: 6px; font-size: 13px; letter-spacing: 1px;">RETURN TO MY PASSPORT</a>
      </div>
    `;
    return;
  }

  // Render Governance Console Shell
  renderConsoleShell(container, userRole);
}

function renderConsoleShell(container, role) {
  const isAdmin = role === 'ADMIN';

  container.innerHTML = `
    <div class="reviewer-console" style="max-width: 1280px; margin: 0 auto; padding: 32px 24px;">
      
      <!-- Console Header -->
      <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; background: rgba(212, 175, 55, 0.1); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(212, 175, 55, 0.25);">
              GOVERNANCE WORKSPACE
            </span>
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: ${isAdmin ? '#e5c158' : '#64b5f6'}; text-transform: uppercase; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
              AUTHORITY: ${role}
            </span>
          </div>
          <h1 style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 0 0 6px 0;">REVIEW & RECOGNITION</h1>
          <div style="color: rgba(255,255,255,0.6); font-size: 13px; font-family: monospace; letter-spacing: 0.5px;">
            VERIFY EVIDENCE. RECOGNISE CAPABILITY. PROTECT THE INTEGRITY OF THE AI PASSPORT.
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <a href="/app/index.html?view=overview" style="padding: 10px 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; transition: all 0.2s;">
            MY PASSPORT ↗
          </a>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 8px; margin-bottom: 28px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); overflow-x: auto; padding-bottom: 2px;">
        <button class="gov-tab-btn active" data-tab="queue" style="padding: 10px 20px; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.3); color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1px; border-radius: 6px 6px 0 0; cursor: pointer; white-space: nowrap;">
          📋 REVIEW QUEUE
        </button>
        <button class="gov-tab-btn" data-tab="recommend" style="padding: 10px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 700; letter-spacing: 1px; border-radius: 6px 6px 0 0; cursor: pointer; white-space: nowrap;">
          💡 RECOMMEND CAPABILITY
        </button>
        <button class="gov-tab-btn" data-tab="history" style="padding: 10px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 700; letter-spacing: 1px; border-radius: 6px 6px 0 0; cursor: pointer; white-space: nowrap;">
          📜 AUDIT LEDGER
        </button>
        ${isAdmin ? `
          <button class="gov-tab-btn" data-tab="admin" style="padding: 10px 20px; background: rgba(229, 193, 88, 0.1); border: 1px solid rgba(229, 193, 88, 0.25); color: #e5c158; font-size: 12px; font-weight: 700; letter-spacing: 1px; border-radius: 6px 6px 0 0; cursor: pointer; white-space: nowrap;">
            ⚙️ ADMIN GOVERNANCE
          </button>
        ` : ''}
      </div>

      <!-- Tab Content Area -->
      <div id="gov-tab-content">
        <!-- Rendered dynamically -->
      </div>

    </div>
  `;

  // Bind Tab Switching
  const tabBtns = container.querySelectorAll('.gov-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'rgba(255,255,255,0.03)';
        b.style.borderColor = 'rgba(255,255,255,0.08)';
        b.style.color = 'rgba(255,255,255,0.7)';
      });
      btn.classList.add('active');
      btn.style.background = 'rgba(212, 175, 55, 0.15)';
      btn.style.borderColor = 'rgba(212, 175, 55, 0.3)';
      btn.style.color = '#ffffff';

      const tab = btn.getAttribute('data-tab');
      loadTabContent(tab, role);
    });
  });

  // Default load Queue tab
  loadTabContent('queue', role);
}

async function loadTabContent(tab, role) {
  const contentDiv = document.getElementById('gov-tab-content');
  if (!contentDiv) return;

  if (tab === 'queue') {
    await renderReviewQueueTab(contentDiv, role);
  } else if (tab === 'recommend') {
    renderRecommendationTab(contentDiv);
  } else if (tab === 'history') {
    await renderAuditLedgerTab(contentDiv);
  } else if (tab === 'admin') {
    renderAdminGovernanceTab(contentDiv);
  }
}

async function renderReviewQueueTab(container, role) {
  container.innerHTML = `
    <div style="padding: 24px; background: rgba(18, 20, 26, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px;">
      <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 6px; letter-spacing: 0.5px;">PENDING SUBMISSIONS QUEUE</div>
      <div style="font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 24px;">Submissions requiring reviewer verification and capability alignment.</div>
      <div id="queue-list-container">
        <div style="color: rgba(255,255,255,0.4); font-size: 13px;">Loading review queue via RPC...</div>
      </div>
    </div>
  `;

  const queueListContainer = document.getElementById('queue-list-container');

  try {
    const { data: queue, error } = await supabase.rpc('get_review_queue');
    
    // Sample Demonstration Submissions if queue is empty
    const displayQueue = (queue && queue.length > 0) ? queue : [
      {
        evidence_id: 'sample-ev-1',
        submitted_at: new Date().toISOString(),
        learner_name: 'Test Builder A',
        learner_username: 'testbuilder_a',
        evidence_type: 'GITHUB_REPO',
        capability_dimension: 'CREATE',
        url: 'https://github.com/aipassport/demo-project',
        project_title: 'AI Multi-Agent Workflow Engine',
        current_capability_state: 'DEVELOP'
      }
    ];

    if (!displayQueue || displayQueue.length === 0) {
      queueListContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; color: rgba(255,255,255,0.5); background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px dashed rgba(255,255,255,0.1);">
          <div style="font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">REVIEW QUEUE IS CLEAR</div>
          <div>No pending evidence submissions require review at this time.</div>
        </div>
      `;
      return;
    }

    queueListContainer.innerHTML = displayQueue.map(item => `
      <div style="padding: 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #d4af37; background: rgba(212,175,55,0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(212,175,55,0.2);">
              ${item.capability_dimension}
            </span>
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #64b5f6; background: rgba(100,181,246,0.1); padding: 3px 8px; border-radius: 4px;">
              ${item.evidence_type}
            </span>
            <span style="font-size: 11px; color: rgba(255,255,255,0.5); font-family: monospace;">
              STATE: ${item.current_capability_state}
            </span>
          </div>
          <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
            ${item.project_title || 'Untitled Evidence Submission'}
          </div>
          <div style="font-size: 13px; color: rgba(255,255,255,0.7);">
            Learner: <strong style="color: #ffffff;">${item.learner_name}</strong> (@${item.learner_username})
          </div>
          <div style="font-size: 12px; color: #81c784; margin-top: 6px; font-family: monospace;">
            Link: <a href="${item.url}" target="_blank" style="color: #81c784; text-decoration: underline;">${item.url} ↗</a>
          </div>
        </div>

        <div>
          <button class="review-action-btn" data-evid="${item.evidence_id}" data-learner="${item.learner_name}" data-title="${item.project_title}" style="padding: 10px 20px; background: #ffffff; color: #000000; border: none; font-size: 12px; font-weight: 700; letter-spacing: 1px; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
            OPEN REVIEW →
          </button>
        </div>
      </div>
    `).join('');

    // Bind Review Modal Action
    queueListContainer.querySelectorAll('.review-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const evId = btn.getAttribute('data-evid');
        const learner = btn.getAttribute('data-learner');
        const title = btn.getAttribute('data-title');
        openReviewModal(evId, learner, title);
      });
    });

  } catch(e) {
    queueListContainer.innerHTML = `<div style="color: #ff4444; font-size: 13px;">Error loading review queue: ${e.message}</div>`;
  }
}

function openReviewModal(evidenceId, learnerName, projectTitle) {
  const modalOverlay = document.createElement('div');
  modalOverlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
    display: flex; justify-content: center; align-items: center; z-index: 10000; padding: 20px;
  `;

  modalOverlay.innerHTML = `
    <div style="max-width: 600px; width: 100%; background: #12141a; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #d4af37; margin-bottom: 8px;">AUTHORITATIVE EVIDENCE DECISION</div>
      <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0;">${projectTitle || 'Evidence Review'}</h2>
      <div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 24px;">Submitted by ${learnerName}</div>

      <!-- Decision Form -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: rgba(255,255,255,0.8); margin-bottom: 8px;">1. REVIEW DECISION</label>
        <select id="review-decision-select" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #ffffff; border-radius: 6px; font-size: 13px;">
          <option value="VERIFY">VERIFY (Accept Evidence & Mark Verified)</option>
          <option value="REQUEST_CHANGES">REQUEST CHANGES (Return to Learner for Modifications)</option>
          <option value="REJECT">REJECT (Decline Evidence Submission)</option>
        </select>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: rgba(255,255,255,0.8); margin-bottom: 8px;">2. LEARNER-FACING FEEDBACK (REQUIRED)</label>
        <textarea id="review-learner-feedback" rows="3" placeholder="Actionable feedback visible to the learner..." style="width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #ffffff; border-radius: 6px; font-size: 13px; box-sizing: border-box;"></textarea>
      </div>

      <div style="margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label style="font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #e5c158;">3. INTERNAL REVIEWER NOTES</label>
          <span style="font-size: 10px; color: rgba(255,255,255,0.4); font-family: monospace;">VISIBLE ONLY TO REVIEWERS & ADMINS</span>
        </div>
        <textarea id="review-internal-notes" rows="2" placeholder="Internal governance notes stored in audit log..." style="width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(229,193,88,0.25); color: #ffffff; border-radius: 6px; font-size: 13px; box-sizing: border-box;"></textarea>
      </div>

      <div id="review-modal-msg" style="margin-bottom: 16px; font-size: 13px; font-family: monospace;"></div>

      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button id="close-modal-btn" style="padding: 10px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">CANCEL</button>
        <button id="submit-review-btn" style="padding: 10px 24px; background: #d4af37; border: none; color: #000000; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 1px; cursor: pointer;">SUBMIT DECISION</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  modalOverlay.querySelector('#close-modal-btn').addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });

  modalOverlay.querySelector('#submit-review-btn').addEventListener('click', async () => {
    const decision = modalOverlay.querySelector('#review-decision-select').value;
    const feedback = modalOverlay.querySelector('#review-learner-feedback').value;
    const internalNotes = modalOverlay.querySelector('#review-internal-notes').value;
    const msgDiv = modalOverlay.querySelector('#review-modal-msg');

    if (!feedback || feedback.trim() === '') {
      msgDiv.style.color = '#ff4444';
      msgDiv.textContent = 'Learner-facing feedback is required.';
      return;
    }

    msgDiv.style.color = '#d4af37';
    msgDiv.textContent = 'Submitting decision via SECURITY DEFINER RPC...';

    try {
      const { data, error } = await supabase.rpc('review_evidence', {
        p_evidence_id: evidenceId,
        p_decision: decision,
        p_feedback: feedback,
        p_internal_notes: internalNotes
      });

      if (error) throw error;

      msgDiv.style.color = '#81c784';
      msgDiv.textContent = `Decision submitted successfully! Status: ${data?.new_status || decision}`;
      setTimeout(() => {
        document.body.removeChild(modalOverlay);
        loadTabContent('queue', 'REVIEWER');
      }, 1200);

    } catch (err) {
      msgDiv.style.color = '#ff4444';
      msgDiv.textContent = `RPC Error: ${err.message}`;
    }
  });
}

function renderRecommendationTab(container) {
  container.innerHTML = `
    <div style="padding: 24px; background: rgba(18, 20, 26, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; max-width: 700px;">
      <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 6px; letter-spacing: 0.5px;">RECOMMEND CAPABILITY RECOGNITION</div>
      <div style="font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 24px;">Produce a capability advancement recommendation for Admin approval. Sequential progression only.</div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 6px;">Target Learner Profile UUID</label>
        <input id="rec-user-id" type="text" placeholder="e.g. 913a05f6-56df-4b0f-b789-f0ee9b929611" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; border-radius: 6px; font-size: 13px; box-sizing: border-box;" />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div>
          <label style="display: block; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 6px;">Capability Dimension</label>
          <select id="rec-dimension" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; border-radius: 6px; font-size: 13px;">
            <option value="UNDERSTAND">UNDERSTAND</option>
            <option value="APPLY">APPLY</option>
            <option value="CREATE">CREATE</option>
            <option value="EVALUATE">EVALUATE</option>
            <option value="RESPONSIBLE">RESPONSIBLE</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 6px;">Recommended Target State</label>
          <select id="rec-state" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; border-radius: 6px; font-size: 13px;">
            <option value="DEVELOP">DEVELOP</option>
            <option value="DEMONSTRATE">DEMONSTRATE</option>
            <option value="ADVANCE">ADVANCE</option>
          </select>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 6px;">Recommendation Reason & Evidence Basis</label>
        <textarea id="rec-reason" rows="3" placeholder="Explain supporting verified evidence and practical demonstration..." style="width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; border-radius: 6px; font-size: 13px; box-sizing: border-box;"></textarea>
      </div>

      <div id="rec-msg" style="margin-bottom: 16px; font-size: 13px; font-family: monospace;"></div>

      <button id="submit-recommend-btn" style="padding: 12px 28px; background: #d4af37; color: #000000; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 1px; cursor: pointer;">
        SUBMIT RECOMMENDATION
      </button>
    </div>
  `;

  container.querySelector('#submit-recommend-btn').addEventListener('click', async () => {
    const userId = container.querySelector('#rec-user-id').value;
    const dimension = container.querySelector('#rec-dimension').value;
    const state = container.querySelector('#rec-state').value;
    const reason = container.querySelector('#rec-reason').value;
    const msgDiv = container.querySelector('#rec-msg');

    if (!userId || !reason) {
      msgDiv.style.color = '#ff4444';
      msgDiv.textContent = 'Please provide target user UUID and recommendation reason.';
      return;
    }

    try {
      const { data, error } = await supabase.rpc('recommend_capability_recognition', {
        p_target_user_id: userId,
        p_dimension: dimension,
        p_recommended_state: state,
        p_reason: reason
      });

      if (error) throw error;

      msgDiv.style.color = '#81c784';
      msgDiv.textContent = 'Capability recommendation logged in authority events ledger.';
    } catch(err) {
      msgDiv.style.color = '#ff4444';
      msgDiv.textContent = `RPC Error: ${err.message}`;
    }
  });
}

async function renderAuditLedgerTab(container) {
  container.innerHTML = `
    <div style="padding: 24px; background: rgba(18, 20, 26, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px;">
      <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 6px; letter-spacing: 0.5px;">IMMUTABLE AUTHORITY AUDIT LEDGER</div>
      <div style="font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 24px;">Append-only record of all reviewer and administrative decisions.</div>
      <div id="audit-ledger-container">
        <div style="color: rgba(255,255,255,0.4); font-size: 13px;">Fetching authority events via RLS...</div>
      </div>
    </div>
  `;

  const ledgerContainer = document.getElementById('audit-ledger-container');

  try {
    const { data: events, error } = await supabase
      .from('authority_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!events || events.length === 0) {
      ledgerContainer.innerHTML = `
        <div style="padding: 30px; text-align: center; color: rgba(255,255,255,0.5); background: rgba(0,0,0,0.2); border-radius: 8px;">
          No authority events recorded yet.
        </div>
      `;
      return;
    }

    ledgerContainer.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); font-family: monospace;">
              <th style="padding: 10px;">TIMESTAMP</th>
              <th style="padding: 10px;">ACTION</th>
              <th style="padding: 10px;">ENTITY</th>
              <th style="padding: 10px;">ACTOR</th>
              <th style="padding: 10px;">SUBJECT</th>
              <th style="padding: 10px;">TRANSITION</th>
              <th style="padding: 10px;">REASON / NOTES</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(ev => `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff;">
                <td style="padding: 10px; font-family: monospace; color: rgba(255,255,255,0.5);">${new Date(ev.created_at).toLocaleString()}</td>
                <td style="padding: 10px; font-weight: 700; color: #d4af37;">${ev.action}</td>
                <td style="padding: 10px; color: rgba(255,255,255,0.8);">${ev.entity_type}</td>
                <td style="padding: 10px; font-family: monospace; color: rgba(255,255,255,0.6);">${ev.actor_user_id.substring(0,8)}...</td>
                <td style="padding: 10px; font-family: monospace; color: rgba(255,255,255,0.6);">${ev.subject_user_id ? ev.subject_user_id.substring(0,8) + '...' : '-'}</td>
                <td style="padding: 10px; font-family: monospace; color: #81c784;">${ev.previous_state || '-'} ➔ ${ev.new_state || '-'}</td>
                <td style="padding: 10px; color: rgba(255,255,255,0.8);">${ev.reason || ev.metadata?.internal_notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

  } catch(e) {
    ledgerContainer.innerHTML = `<div style="color: #ff4444; font-size: 13px;">Audit ledger access restricted or error: ${e.message}</div>`;
  }
}

function renderAdminGovernanceTab(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
      
      <!-- 1. Capability Recognition -->
      <div style="padding: 24px; background: rgba(18, 20, 26, 0.6); border: 1px solid rgba(229, 193, 88, 0.25); border-radius: 12px;">
        <div style="font-size: 14px; font-weight: 700; color: #e5c158; margin-bottom: 6px; letter-spacing: 0.5px;">1. AUTHORITATIVE CAPABILITY RECOGNITION</div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 16px;">Advance learner capability state (Sequential transition strictly enforced).</div>
        
        <input id="admin-cap-user" type="text" placeholder="Learner Profile UUID" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 4px; margin-bottom: 10px; font-size: 12px; box-sizing: border-box;" />
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <select id="admin-cap-dim" style="padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 4px; font-size: 12px;">
            <option value="UNDERSTAND">UNDERSTAND</option>
            <option value="APPLY">APPLY</option>
            <option value="CREATE">CREATE</option>
            <option value="EVALUATE">EVALUATE</option>
            <option value="RESPONSIBLE">RESPONSIBLE</option>
          </select>
          <select id="admin-cap-state" style="padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 4px; font-size: 12px;">
            <option value="DEVELOP">DEVELOP</option>
            <option value="DEMONSTRATE">DEMONSTRATE</option>
            <option value="ADVANCE">ADVANCE</option>
          </select>
        </div>

        <textarea id="admin-cap-reason" rows="2" placeholder="Mandatory recognition reason..." style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 4px; margin-bottom: 12px; font-size: 12px; box-sizing: border-box;"></textarea>

        <div id="admin-cap-msg" style="font-size: 11px; font-family: monospace; margin-bottom: 8px;"></div>
        <button id="admin-cap-btn" style="width: 100%; padding: 10px; background: #e5c158; color: #000; border: none; font-weight: 700; font-size: 11px; letter-spacing: 1px; border-radius: 4px; cursor: pointer;">RECOGNISE CAPABILITY</button>
      </div>

      <!-- 2. Credential Issuance -->
      <div style="padding: 24px; background: rgba(18, 20, 26, 0.6); border: 1px solid rgba(229, 193, 88, 0.25); border-radius: 12px;">
        <div style="font-size: 14px; font-weight: 700; color: #e5c158; margin-bottom: 6px; letter-spacing: 0.5px;">2. ISSUE CREDENTIAL</div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 16px;">Generate non-colliding credential record with opaque token.</div>

        <input id="admin-cred-user" type="text" placeholder="Learner Profile UUID" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 4px; margin-bottom: 10px; font-size: 12px; box-sizing: border-box;" />
        <input id="admin-cred-title" type="text" placeholder="Credential Title (e.g. AI Systems Builder)" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 4px; margin-bottom: 10px; font-size: 12px; box-sizing: border-box;" />
        
        <select id="admin-cred-basis" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 4px; margin-bottom: 10px; font-size: 12px;">
          <option value="CAPABILITY_RECOGNITION">CAPABILITY RECOGNITION</option>
          <option value="PROJECT_RECOGNITION">PROJECT RECOGNITION</option>
          <option value="PROGRAMME_COMPLETION">PROGRAMME COMPLETION</option>
          <option value="MANUAL_RECOGNITION">MANUAL RECOGNITION</option>
        </select>

        <textarea id="admin-cred-reason" rows="2" placeholder="Human-readable issuance explanation..." style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 4px; margin-bottom: 12px; font-size: 12px; box-sizing: border-box;"></textarea>

        <div id="admin-cred-msg" style="font-size: 11px; font-family: monospace; margin-bottom: 8px;"></div>
        <button id="admin-cred-btn" style="width: 100%; padding: 10px; background: #e5c158; color: #000; border: none; font-weight: 700; font-size: 11px; letter-spacing: 1px; border-radius: 4px; cursor: pointer;">ISSUE CREDENTIAL</button>
      </div>

      <!-- 3. Reviewer Management & Revocation -->
      <div style="padding: 24px; background: rgba(18, 20, 26, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px;">
        <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 6px; letter-spacing: 0.5px;">3. REVIEWER APPOINTMENT & DEMOTION</div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 16px;">Appoint or remove reviewer authority.</div>

        <input id="admin-rev-user" type="text" placeholder="Target User Profile UUID" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 4px; margin-bottom: 12px; font-size: 12px; box-sizing: border-box;" />

        <div id="admin-rev-msg" style="font-size: 11px; font-family: monospace; margin-bottom: 12px;"></div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button id="admin-appoint-btn" style="padding: 10px; background: #81c784; color: #000; border: none; font-weight: 700; font-size: 11px; border-radius: 4px; cursor: pointer;">APPOINT REVIEWER</button>
          <button id="admin-remove-btn" style="padding: 10px; background: #e57373; color: #000; border: none; font-weight: 700; font-size: 11px; border-radius: 4px; cursor: pointer;">REMOVE REVIEWER</button>
        </div>
      </div>

    </div>
  `;

  // Bind Admin Action 1: Capability Recognition
  container.querySelector('#admin-cap-btn').addEventListener('click', async () => {
    const user = container.querySelector('#admin-cap-user').value;
    const dim = container.querySelector('#admin-cap-dim').value;
    const state = container.querySelector('#admin-cap-state').value;
    const reason = container.querySelector('#admin-cap-reason').value;
    const msg = container.querySelector('#admin-cap-msg');

    try {
      const { data, error } = await supabase.rpc('recognize_capability', {
        p_target_user_id: user, p_dimension: dim, p_new_state: state, p_reason: reason
      });
      if (error) throw error;
      msg.style.color = '#81c784';
      msg.textContent = 'Capability recognized & logged successfully!';
    } catch(e) {
      msg.style.color = '#ff4444';
      msg.textContent = `RPC Error: ${e.message}`;
    }
  });

  // Bind Admin Action 2: Issue Credential
  container.querySelector('#admin-cred-btn').addEventListener('click', async () => {
    const user = container.querySelector('#admin-cred-user').value;
    const title = container.querySelector('#admin-cred-title').value;
    const basis = container.querySelector('#admin-cred-basis').value;
    const reason = container.querySelector('#admin-cred-reason').value;
    const msg = container.querySelector('#admin-cred-msg');

    try {
      const { data, error } = await supabase.rpc('issue_credential', {
        p_target_user_id: user, p_title: title, p_issuer: 'AI Passport Academy™', p_issuance_basis: basis, p_reason: reason
      });
      if (error) throw error;
      msg.style.color = '#81c784';
      msg.textContent = `Credential Issued! Number: ${data?.credential_number}`;
    } catch(e) {
      msg.style.color = '#ff4444';
      msg.textContent = `RPC Error: ${e.message}`;
    }
  });

  // Bind Admin Action 3: Reviewer Appoint / Remove
  container.querySelector('#admin-appoint-btn').addEventListener('click', async () => {
    const user = container.querySelector('#admin-rev-user').value;
    const msg = container.querySelector('#admin-rev-msg');
    try {
      const { data, error } = await supabase.rpc('appoint_reviewer', { p_target_user_id: user });
      if (error) throw error;
      msg.style.color = '#81c784';
      msg.textContent = 'User appointed as REVIEWER!';
    } catch(e) {
      msg.style.color = '#ff4444';
      msg.textContent = `RPC Error: ${e.message}`;
    }
  });

  container.querySelector('#admin-remove-btn').addEventListener('click', async () => {
    const user = container.querySelector('#admin-rev-user').value;
    const msg = container.querySelector('#admin-rev-msg');
    try {
      const { data, error } = await supabase.rpc('remove_reviewer', { p_target_user_id: user });
      if (error) throw error;
      msg.style.color = '#81c784';
      msg.textContent = 'Reviewer role removed!';
    } catch(e) {
      msg.style.color = '#ff4444';
      msg.textContent = `RPC Error: ${e.message}`;
    }
  });
}
