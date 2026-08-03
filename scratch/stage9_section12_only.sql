-- 12. STAGE 9 — REVIEWER, VERIFICATION & CREDENTIAL ISSUANCE AUTHORITY MIGRATION
-- ============================================================================

-- 1. EXTEND EVIDENCE TABLE FOR LEARNER FEEDBACK & WITHDRAWN STATUS
ALTER TABLE public.evidence
    ADD COLUMN IF NOT EXISTS feedback_for_learner TEXT;

-- Update evidence verification_status constraint
ALTER TABLE public.evidence
    DROP CONSTRAINT IF EXISTS evidence_verification_status_check;

ALTER TABLE public.evidence
    ADD CONSTRAINT evidence_verification_status_check
    CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'WITHDRAWN'));


-- 2. CREATE AUDIT LEDGERS & HISTORY TABLES
CREATE TABLE IF NOT EXISTS public.authority_events (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    actor_user_id UUID NOT NULL REFERENCES public.profiles(id),
    subject_user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    previous_state TEXT,
    new_state TEXT,
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.capability_history (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dimension public.capability_dimension NOT NULL,
    previous_state public.progression_state NOT NULL,
    new_state public.progression_state NOT NULL,
    actor_user_id UUID NOT NULL REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Governance & Audit Performance
CREATE INDEX IF NOT EXISTS idx_authority_events_actor ON public.authority_events(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_authority_events_subject ON public.authority_events(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_authority_events_action ON public.authority_events(action);
CREATE INDEX IF NOT EXISTS idx_capability_history_user ON public.capability_history(user_id);

-- Enable RLS
ALTER TABLE public.authority_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_history ENABLE ROW LEVEL SECURITY;

-- 3. AUDIT IMMUTABILITY TRIGGERS & POLICIES
REVOKE INSERT, UPDATE, DELETE ON public.authority_events FROM PUBLIC, authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.capability_history FROM PUBLIC, authenticated, anon;

DROP POLICY IF EXISTS "Reviewers and Admins can view authority events" ON public.authority_events;
CREATE POLICY "Reviewers and Admins can view authority events"
ON public.authority_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('REVIEWER', 'ADMIN')));

DROP POLICY IF EXISTS "Users can view own capability history" ON public.capability_history;
CREATE POLICY "Users can view own capability history"
ON public.capability_history FOR SELECT TO authenticated
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('REVIEWER', 'ADMIN')));

CREATE OR REPLACE FUNCTION public.protect_authority_events_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Authority audit events are immutable and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_protect_authority_events_immutability') THEN
        CREATE TRIGGER trg_protect_authority_events_immutability
        BEFORE UPDATE OR DELETE ON public.authority_events
        FOR EACH ROW EXECUTE FUNCTION public.protect_authority_events_immutability();
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.protect_capability_history_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Capability history records are immutable and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, pg_temp;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_protect_capability_history_immutability') THEN
        CREATE TRIGGER trg_protect_capability_history_immutability
        BEFORE UPDATE OR DELETE ON public.capability_history
        FOR EACH ROW EXECUTE FUNCTION public.protect_capability_history_immutability();
    END IF;
END $$;


-- 4. HARDENED CONSOLIDATED STAGE 6/9 EVIDENCE IMMUTABILITY TRIGGER
CREATE OR REPLACE FUNCTION public.protect_evidence_authority_and_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
    -- Prevent learners from deleting VERIFIED or WITHDRAWN evidence
    IF TG_OP = 'DELETE' AND OLD.verification_status IN ('VERIFIED', 'WITHDRAWN') THEN
        IF (current_setting('role', true) <> 'service_role') THEN
            RAISE EXCEPTION 'Verified or withdrawn evidence records are immutable and cannot be deleted.';
        END IF;
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Prevent learners from altering content/metadata of VERIFIED evidence
        IF OLD.verification_status = 'VERIFIED' THEN
            IF (current_setting('role', true) <> 'service_role') THEN
                IF (NEW.url IS DISTINCT FROM OLD.url OR
                    NEW.attachment_url IS DISTINCT FROM OLD.attachment_url OR
                    NEW.capability_dimension IS DISTINCT FROM OLD.capability_dimension OR
                    NEW.evidence_type IS DISTINCT FROM OLD.evidence_type OR
                    NEW.source_type IS DISTINCT FROM OLD.source_type OR
                    NEW.related_id IS DISTINCT FROM OLD.related_id OR
                    NEW.project_id IS DISTINCT FROM OLD.project_id OR
                    NEW.user_id IS DISTINCT FROM OLD.user_id OR
                    NEW.metadata IS DISTINCT FROM OLD.metadata OR
                    NEW.verification_status IS DISTINCT FROM OLD.verification_status) THEN
                    RAISE EXCEPTION 'Verified evidence content is immutable and cannot be modified.';
                END IF;
            END IF;
        END IF;

        -- Prevent learners from self-assigning VERIFIED status directly
        IF NEW.verification_status = 'VERIFIED' AND OLD.verification_status IS DISTINCT FROM 'VERIFIED' THEN
            IF (current_setting('role', true) <> 'service_role') THEN
                RAISE EXCEPTION 'Authoritative verification status can only be granted by an authorized reviewer via governance RPC.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


-- 5. COMPLETE 10-RPC PRIVILEGED GOVERNANCE CONTRACT

-- RPC 1: Learner Submits Evidence for Review
CREATE OR REPLACE FUNCTION public.submit_evidence_for_review(p_evidence_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_ev RECORD;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

    SELECT * INTO v_ev FROM public.evidence WHERE id = p_evidence_id AND user_id = auth.uid() FOR UPDATE;
    IF v_ev.id IS NULL THEN RAISE EXCEPTION 'Evidence record not found or ownership mismatch.'; END IF;

    IF v_ev.verification_status = 'WITHDRAWN' THEN
        RAISE EXCEPTION 'Withdrawn evidence cannot be resubmitted. Create a new evidence record.';
    END IF;

    IF v_ev.verification_status NOT IN ('UNVERIFIED', 'REJECTED') THEN
        RAISE EXCEPTION 'Only UNVERIFIED or REJECTED evidence can be submitted for review.';
    END IF;

    UPDATE public.evidence SET verification_status = 'PENDING' WHERE id = p_evidence_id;

    INSERT INTO public.authority_events(actor_user_id, subject_user_id, action, entity_type, entity_id, previous_state, new_state)
    VALUES (auth.uid(), auth.uid(), 'EVIDENCE_SUBMITTED', 'EVIDENCE', p_evidence_id, v_ev.verification_status, 'PENDING');

    RETURN jsonb_build_object('status', 'SUCCESS', 'message', 'Evidence submitted for review.');
END;
$$;

-- RPC 2: Reviewer Decision (VERIFY, REJECT, REQUEST_CHANGES)
CREATE OR REPLACE FUNCTION public.review_evidence(
    p_evidence_id UUID,
    p_decision TEXT,
    p_feedback TEXT,
    p_internal_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_ev RECORD;
    v_new_status TEXT;
    v_action TEXT;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role NOT IN ('REVIEWER', 'ADMIN') THEN RAISE EXCEPTION 'Access denied. Reviewer role required.'; END IF;

    SELECT * INTO v_ev FROM public.evidence WHERE id = p_evidence_id FOR UPDATE;
    IF v_ev.id IS NULL THEN RAISE EXCEPTION 'Evidence record not found.'; END IF;

    IF v_ev.user_id = auth.uid() THEN
        RAISE EXCEPTION 'Self-review is strictly prohibited. Reviewers cannot verify their own evidence.';
    END IF;

    IF v_ev.verification_status != 'PENDING' THEN
        RAISE EXCEPTION 'Only evidence in PENDING status can be reviewed.';
    END IF;

    IF p_decision = 'VERIFY' THEN
        v_new_status := 'VERIFIED';
        v_action := 'EVIDENCE_VERIFIED';
    ELSIF p_decision = 'REJECT' THEN
        v_new_status := 'REJECTED';
        v_action := 'EVIDENCE_REJECTED';
    ELSIF p_decision = 'REQUEST_CHANGES' THEN
        v_new_status := 'REJECTED';
        v_action := 'EVIDENCE_CHANGES_REQUESTED';
    ELSE
        RAISE EXCEPTION 'Invalid decision. Allowed: VERIFY, REJECT, REQUEST_CHANGES.';
    END IF;

    -- Store ONLY learner-facing feedback on evidence table
    UPDATE public.evidence
    SET verification_status = v_new_status,
        feedback_for_learner = p_feedback
    WHERE id = p_evidence_id;

    -- Store internal reviewer notes EXCLUSIVELY inside restricted authority_events metadata
    INSERT INTO public.authority_events(actor_user_id, subject_user_id, action, entity_type, entity_id, previous_state, new_state, reason, metadata)
    VALUES (
        auth.uid(), 
        v_ev.user_id, 
        v_action, 
        'EVIDENCE', 
        p_evidence_id, 
        'PENDING', 
        v_new_status, 
        p_feedback, 
        CASE WHEN p_internal_notes IS NOT NULL AND TRIM(p_internal_notes) <> '' THEN jsonb_build_object('internal_notes', p_internal_notes) ELSE '{}'::jsonb END
    );

    RETURN jsonb_build_object('status', 'SUCCESS', 'new_status', v_new_status);
END;
$$;

-- RPC 3: Reviewer Recommends Capability Recognition
CREATE OR REPLACE FUNCTION public.recommend_capability_recognition(
    p_target_user_id UUID,
    p_dimension public.capability_dimension,
    p_recommended_state public.progression_state,
    p_reason TEXT,
    p_evidence_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_curr_state public.progression_state;
    v_is_valid BOOLEAN := FALSE;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role NOT IN ('REVIEWER', 'ADMIN') THEN RAISE EXCEPTION 'Access denied. Reviewer role required.'; END IF;

    IF p_target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Self-recommendation is prohibited.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target_user_id) THEN
        RAISE EXCEPTION 'Target user profile does not exist.';
    END IF;

    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
        RAISE EXCEPTION 'A non-empty recommendation reason is required.';
    END IF;

    SELECT state INTO v_curr_state FROM public.capability_states WHERE user_id = p_target_user_id AND dimension = p_dimension;
    IF v_curr_state IS NULL THEN v_curr_state := 'EXPLORE'; END IF;

    IF (v_curr_state = 'EXPLORE' AND p_recommended_state = 'DEVELOP') OR
       (v_curr_state = 'DEVELOP' AND p_recommended_state = 'DEMONSTRATE') OR
       (v_curr_state = 'DEMONSTRATE' AND p_recommended_state = 'ADVANCE') THEN
        v_is_valid := TRUE;
    END IF;

    IF NOT v_is_valid THEN
        RAISE EXCEPTION 'Recommendation must follow sequential progression from % to %.', v_curr_state, p_recommended_state;
    END IF;

    INSERT INTO public.authority_events(actor_user_id, subject_user_id, action, entity_type, entity_id, previous_state, new_state, reason, metadata)
    VALUES (
        auth.uid(), 
        p_target_user_id, 
        'CAPABILITY_RECOMMENDED', 
        'CAPABILITY', 
        p_evidence_id, 
        v_curr_state::TEXT, 
        p_recommended_state::TEXT, 
        p_reason, 
        jsonb_build_object('dimension', p_dimension, 'evidence_id', p_evidence_id)
    );

    RETURN jsonb_build_object('status', 'SUCCESS', 'message', 'Capability recommendation logged.');
END;
$$;

-- RPC 4: Admin Authoritative Capability Recognition (Atomic & Sequential Enforced)
CREATE OR REPLACE FUNCTION public.recognize_capability(
    p_target_user_id UUID,
    p_dimension public.capability_dimension,
    p_new_state public.progression_state,
    p_reason TEXT,
    p_evidence_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_curr_state public.progression_state;
    v_is_valid BOOLEAN := FALSE;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role != 'ADMIN' THEN RAISE EXCEPTION 'Access denied. Admin role required for capability recognition.'; END IF;

    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
        RAISE EXCEPTION 'A valid recognition reason must be provided.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target_user_id) THEN
        RAISE EXCEPTION 'Target user profile does not exist.';
    END IF;

    -- Lock row for update
    SELECT state INTO v_curr_state FROM public.capability_states WHERE user_id = p_target_user_id AND dimension = p_dimension FOR UPDATE;
    
    -- If row missing, insert baseline EXPLORE securely and lock
    IF v_curr_state IS NULL THEN
        INSERT INTO public.capability_states(user_id, dimension, state, updated_at)
        VALUES (p_target_user_id, p_dimension, 'EXPLORE', NOW())
        ON CONFLICT (user_id, dimension) DO NOTHING;

        SELECT state INTO v_curr_state FROM public.capability_states WHERE user_id = p_target_user_id AND dimension = p_dimension FOR UPDATE;
        IF v_curr_state IS NULL THEN v_curr_state := 'EXPLORE'; END IF;
    END IF;

    -- Strict Sequential Transition Check
    IF (v_curr_state = 'EXPLORE' AND p_new_state = 'DEVELOP') OR
       (v_curr_state = 'DEVELOP' AND p_new_state = 'DEMONSTRATE') OR
       (v_curr_state = 'DEMONSTRATE' AND p_new_state = 'ADVANCE') THEN
        v_is_valid := TRUE;
    END IF;

    IF NOT v_is_valid THEN
        RAISE EXCEPTION 'Invalid capability transition from % to %. Sequential progression (EXPLORE->DEVELOP->DEMONSTRATE->ADVANCE) is enforced.', v_curr_state, p_new_state;
    END IF;

    -- Atomic Update
    UPDATE public.capability_states
    SET state = p_new_state, updated_at = NOW()
    WHERE user_id = p_target_user_id AND dimension = p_dimension;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to update capability state row.';
    END IF;

    -- Append History & Audit Ledgers ONLY AFTER successful row update
    INSERT INTO public.capability_history(user_id, dimension, previous_state, new_state, actor_user_id, reason)
    VALUES (p_target_user_id, p_dimension, v_curr_state, p_new_state, auth.uid(), p_reason);

    INSERT INTO public.authority_events(actor_user_id, subject_user_id, action, entity_type, entity_id, previous_state, new_state, reason, metadata)
    VALUES (
        auth.uid(), 
        p_target_user_id, 
        'CAPABILITY_RECOGNIZED', 
        'CAPABILITY', 
        p_evidence_id, 
        v_curr_state::TEXT, 
        p_new_state::TEXT, 
        p_reason, 
        jsonb_build_object('dimension', p_dimension, 'evidence_id', p_evidence_id)
    );

    RETURN jsonb_build_object('status', 'SUCCESS', 'new_state', p_new_state);
END;
$$;

-- RPC 5: Admin Issue Credential
CREATE OR REPLACE FUNCTION public.issue_credential(
    p_target_user_id UUID,
    p_title TEXT,
    p_issuer TEXT,
    p_issuance_basis TEXT,
    p_reason TEXT,
    p_programme_id UUID DEFAULT NULL,
    p_project_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_cred_num TEXT;
    v_token TEXT;
    v_cred_id UUID;
    v_attempts INT := 0;
    v_exists BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role != 'ADMIN' THEN RAISE EXCEPTION 'Access denied. Admin role required for credential issuance.'; END IF;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target_user_id) THEN
        RAISE EXCEPTION 'Target user profile does not exist.';
    END IF;

    IF p_issuance_basis NOT IN ('PROGRAMME_COMPLETION', 'PROJECT_RECOGNITION', 'CAPABILITY_RECOGNITION', 'MANUAL_RECOGNITION') THEN
        RAISE EXCEPTION 'Invalid issuance basis. Allowed: PROGRAMME_COMPLETION, PROJECT_RECOGNITION, CAPABILITY_RECOGNITION, MANUAL_RECOGNITION.';
    END IF;

    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
        RAISE EXCEPTION 'A non-empty human-readable issuance reason is required.';
    END IF;

    IF p_issuance_basis = 'PROJECT_RECOGNITION' THEN
        IF p_project_id IS NULL THEN RAISE EXCEPTION 'Project ID is required for PROJECT_RECOGNITION basis.'; END IF;
        SELECT EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id AND user_id = p_target_user_id) INTO v_exists;
        IF NOT v_exists THEN RAISE EXCEPTION 'Target project does not exist or does not belong to specified learner.'; END IF;
    END IF;

    IF p_issuance_basis = 'PROGRAMME_COMPLETION' THEN
        IF p_programme_id IS NULL THEN RAISE EXCEPTION 'Programme ID is required for PROGRAMME_COMPLETION basis.'; END IF;
        SELECT EXISTS (SELECT 1 FROM public.programmes WHERE id = p_programme_id) INTO v_exists;
        IF NOT v_exists THEN RAISE EXCEPTION 'Target programme does not exist.'; END IF;
    END IF;

    -- Collision-Safe Credential Number Loop
    LOOP
        v_cred_num := 'AIP-CR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 899999 + 100000)::TEXT, 6, '0');
        BEGIN
            INSERT INTO public.credentials(user_id, credential_number, title, issuer, issue_date, verification_hash, programme_id, project_id, status, is_public)
            VALUES (p_target_user_id, v_cred_num, p_title, p_issuer, CURRENT_DATE, ENCODE(extensions.gen_random_bytes(16), 'hex'), p_programme_id, p_project_id, 'ISSUED', FALSE)
            RETURNING id INTO v_cred_id;
            
            EXIT; -- Insert succeeded
        EXCEPTION WHEN unique_violation THEN
            v_attempts := v_attempts + 1;
            IF v_attempts > 50 THEN RAISE EXCEPTION 'Failed to generate unique credential number after 50 attempts.'; END IF;
        END;
    END LOOP;

    INSERT INTO public.authority_events(actor_user_id, subject_user_id, action, entity_type, entity_id, new_state, reason, metadata)
    VALUES (
        auth.uid(), 
        p_target_user_id, 
        'CREDENTIAL_ISSUED', 
        'CREDENTIAL', 
        v_cred_id, 
        'ISSUED', 
        p_reason, 
        jsonb_build_object('credential_number', v_cred_num, 'issuance_basis', p_issuance_basis, 'programme_id', p_programme_id, 'project_id', p_project_id)
    );

    RETURN jsonb_build_object('status', 'SUCCESS', 'credential_number', v_cred_num);
END;
$$;

-- RPC 6: Admin Revoke Credential
CREATE OR REPLACE FUNCTION public.revoke_credential(p_credential_id UUID, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_cred RECORD;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role != 'ADMIN' THEN RAISE EXCEPTION 'Access denied. Admin role required for credential revocation.'; END IF;

    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN RAISE EXCEPTION 'A valid revocation reason must be provided.'; END IF;

    SELECT * INTO v_cred FROM public.credentials WHERE id = p_credential_id FOR UPDATE;
    IF v_cred.id IS NULL THEN RAISE EXCEPTION 'Credential record not found.'; END IF;

    IF v_cred.status != 'ISSUED' THEN
        RAISE EXCEPTION 'Only ISSUED credentials can be revoked. Current status is %.', v_cred.status;
    END IF;

    UPDATE public.credentials SET status = 'REVOKED', revoked_at = NOW(), revocation_reason = p_reason WHERE id = p_credential_id;

    INSERT INTO public.authority_events(actor_user_id, subject_user_id, action, entity_type, entity_id, previous_state, new_state, reason)
    VALUES (auth.uid(), v_cred.user_id, 'CREDENTIAL_REVOKED', 'CREDENTIAL', p_credential_id, 'ISSUED', 'REVOKED', p_reason);

    RETURN jsonb_build_object('status', 'SUCCESS');
END;
$$;

-- RPC 7: Admin Withdraw Evidence Verification
CREATE OR REPLACE FUNCTION public.withdraw_evidence_verification(p_evidence_id UUID, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_ev RECORD;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role != 'ADMIN' THEN RAISE EXCEPTION 'Access denied. Admin role required for evidence withdrawal.'; END IF;

    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN RAISE EXCEPTION 'A valid withdrawal reason must be provided.'; END IF;

    SELECT * INTO v_ev FROM public.evidence WHERE id = p_evidence_id FOR UPDATE;
    IF v_ev.id IS NULL THEN RAISE EXCEPTION 'Evidence record not found.'; END IF;

    IF v_ev.verification_status != 'VERIFIED' THEN RAISE EXCEPTION 'Only VERIFIED evidence can be withdrawn.'; END IF;

    UPDATE public.evidence SET verification_status = 'WITHDRAWN' WHERE id = p_evidence_id;

    INSERT INTO public.authority_events(actor_user_id, subject_user_id, action, entity_type, entity_id, previous_state, new_state, reason)
    VALUES (auth.uid(), v_ev.user_id, 'EVIDENCE_WITHDRAWN', 'EVIDENCE', p_evidence_id, 'VERIFIED', 'WITHDRAWN', p_reason);

    RETURN jsonb_build_object('status', 'SUCCESS');
END;
$$;

-- RPC 8: Admin Appoint Reviewer
CREATE OR REPLACE FUNCTION public.appoint_reviewer(p_target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_target_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role != 'ADMIN' THEN RAISE EXCEPTION 'Access denied. Admin role required.'; END IF;

    SELECT role INTO v_target_role FROM public.profiles WHERE id = p_target_user_id FOR UPDATE;
    IF v_target_role IS NULL THEN RAISE EXCEPTION 'Target user profile does not exist.'; END IF;
    IF v_target_role = 'ADMIN' THEN RAISE EXCEPTION 'Cannot demote or modify ADMIN via appoint_reviewer.'; END IF;
    IF v_target_role = 'REVIEWER' THEN RAISE EXCEPTION 'Target user is already a REVIEWER.'; END IF;

    UPDATE public.profiles SET role = 'REVIEWER' WHERE id = p_target_user_id;

    INSERT INTO public.authority_events(actor_user_id, subject_user_id, action, entity_type, previous_state, new_state, reason)
    VALUES (auth.uid(), p_target_user_id, 'REVIEWER_APPOINTED', 'PROFILE', v_target_role, 'REVIEWER', 'Appointed by Admin');

    RETURN jsonb_build_object('status', 'SUCCESS');
END;
$$;

-- RPC 9: Admin Remove Reviewer
CREATE OR REPLACE FUNCTION public.remove_reviewer(p_target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_target_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role != 'ADMIN' THEN RAISE EXCEPTION 'Access denied. Admin role required.'; END IF;

    SELECT role INTO v_target_role FROM public.profiles WHERE id = p_target_user_id FOR UPDATE;
    IF v_target_role IS NULL THEN RAISE EXCEPTION 'Target user profile does not exist.'; END IF;
    IF v_target_role != 'REVIEWER' THEN RAISE EXCEPTION 'Only users with REVIEWER role can be demoted to LEARNER.'; END IF;

    UPDATE public.profiles SET role = 'LEARNER' WHERE id = p_target_user_id;

    INSERT INTO public.authority_events(actor_user_id, subject_user_id, action, entity_type, previous_state, new_state, reason)
    VALUES (auth.uid(), p_target_user_id, 'REVIEWER_REMOVED', 'PROFILE', 'REVIEWER', 'LEARNER', 'Demoted to Learner by Admin');

    RETURN jsonb_build_object('status', 'SUCCESS');
END;
$$;

-- RPC 10: Get Review Queue (Excludes Reviewer's Own Submissions)
CREATE OR REPLACE FUNCTION public.get_review_queue()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_queue JSONB;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role NOT IN ('REVIEWER', 'ADMIN') THEN RAISE EXCEPTION 'Access denied. Reviewer role required.'; END IF;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'evidence_id', e.id,
        'submitted_at', e.created_at,
        'learner_name', p.full_name,
        'learner_username', p.username,
        'evidence_type', e.evidence_type,
        'capability_dimension', e.capability_dimension,
        'url', e.url,
        'project_title', pr.title,
        'current_capability_state', COALESCE(cs.state, 'EXPLORE'::public.progression_state)
    )), '[]'::jsonb) INTO v_queue
    FROM public.evidence e
    JOIN public.profiles p ON p.id = e.user_id
    LEFT JOIN public.projects pr ON pr.id = e.project_id
    LEFT JOIN public.capability_states cs ON cs.user_id = e.user_id AND cs.dimension = e.capability_dimension
    WHERE e.verification_status = 'PENDING'
      AND e.user_id <> auth.uid(); -- Exclude reviewer's own evidence

    RETURN v_queue;
END;
$$;

-- EXECUTION GRANTS
REVOKE ALL ON FUNCTION public.submit_evidence_for_review(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.review_evidence(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recommend_capability_recognition(UUID, public.capability_dimension, public.progression_state, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recognize_capability(UUID, public.capability_dimension, public.progression_state, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.issue_credential(UUID, TEXT, TEXT, TEXT, TEXT, UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_credential(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.withdraw_evidence_verification(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.appoint_reviewer(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.remove_reviewer(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_review_queue() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_evidence_for_review(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_evidence(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recommend_capability_recognition(UUID, public.capability_dimension, public.progression_state, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recognize_capability(UUID, public.capability_dimension, public.progression_state, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_credential(UUID, TEXT, TEXT, TEXT, TEXT, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_credential(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.withdraw_evidence_verification(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.appoint_reviewer(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_reviewer(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_review_queue() TO authenticated;


-- A. Safe SECURITY DEFINER Trigger for User Auth Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    new_username TEXT;
    seq_num INT;
    generated_passport TEXT;
    existing_passport_id UUID;
BEGIN
    -- 1. Generate unique username
    new_username := SPLIT_PART(NEW.email, '@', 1) || '_' || FLOOR(RANDOM() * 9000 + 1000)::TEXT;
    
    -- 2. Create User Profile
    INSERT INTO public.profiles (id, email, full_name, username, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        new_username,
        NEW.raw_user_meta_data->>'avatar_url',
        'LEARNER'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    -- 3. Create Privacy Settings
    INSERT INTO public.privacy_settings (user_id, is_public_passport_enabled)
    VALUES (NEW.id, TRUE)
    ON CONFLICT (user_id) DO NOTHING;

    -- 4. Passport Assignment Logic (Claim check first, otherwise create new)
    SELECT id INTO existing_passport_id 
    FROM public.passport_cards 
    WHERE user_id IS NULL AND (
        (claim_token IS NOT NULL AND claim_token = NEW.raw_user_meta_data->>'claim_token')
        OR LOWER(passport_number) = LOWER(NEW.raw_user_meta_data->>'passport_number')
    )
    LIMIT 1;

    IF existing_passport_id IS NOT NULL THEN
        -- Claim pre-registered passport card
        UPDATE public.passport_cards 
        SET user_id = NEW.id, activation_status = 'ACTIVATED', updated_at = NOW()
        WHERE id = existing_passport_id;
    ELSE
        -- Issue new unique digital passport card
        seq_num := FLOOR(RANDOM() * 899999 + 100000)::INT;
        generated_passport := 'AIP-L1-2026-' || seq_num::TEXT;

        INSERT INTO public.passport_cards (user_id, passport_number, status, activation_status)
        VALUES (NEW.id, generated_passport, 'ACTIVE', 'ACTIVATED')
        ON CONFLICT (passport_number) DO NOTHING;
    END IF;

    -- 5. Initialize 5 Capability Dimensions
    INSERT INTO public.capability_states (user_id, dimension, state) VALUES
        (NEW.id, 'UNDERSTAND', 'EXPLORE'),
        (NEW.id, 'APPLY', 'EXPLORE'),
        (NEW.id, 'CREATE', 'EXPLORE'),
        (NEW.id, 'EVALUATE', 'EXPLORE'),
        (NEW.id, 'RESPONSIBLE', 'EXPLORE')
    ON CONFLICT (user_id, dimension) DO NOTHING;

    -- 6. Log Initial Journey Event
    INSERT INTO public.journey_events (user_id, event_type, title, description)
    VALUES (NEW.id, 'JOINED', 'Joined AI Passport Ecosystem', 'Issued Digital Passport Identity Space');

    RETURN NEW;
END;
$$;

-- Attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- B. Authoritative Protection Trigger: Prevent Learners from Self-Verifying Projects/Evidence
CREATE OR REPLACE FUNCTION public.prevent_authoritative_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
    -- If executed by normal authenticated user (not service_role)
    IF auth.role() = 'authenticated' THEN
        -- Prevent self-granting VERIFIED status on Projects
        IF TG_TABLE_NAME = 'projects' THEN
            IF NEW.status = 'VERIFIED' AND OLD.status != 'VERIFIED' THEN
                RAISE EXCEPTION 'Unauthorized: Project verification must be granted by an authoritative reviewer.';
            END IF;
        END IF;

        -- Prevent self-granting VERIFIED status or editing mentor notes on Evidence
        IF TG_TABLE_NAME = 'evidence' THEN
            IF NEW.verification_status = 'VERIFIED' AND OLD.verification_status != 'VERIFIED' THEN
                RAISE EXCEPTION 'Unauthorized: Evidence verification status must be granted by an authoritative reviewer.';
            END IF;
            IF NEW.reviewer_notes IS DISTINCT FROM OLD.reviewer_notes THEN
                RAISE EXCEPTION 'Unauthorized: Reviewer notes cannot be modified by learners.';
            END IF;
        END IF;

        -- Prevent modifying Passport card authoritative fields
        IF TG_TABLE_NAME = 'passport_cards' THEN
            IF NEW.passport_number != OLD.passport_number THEN
                RAISE EXCEPTION 'Unauthorized: Passport numbers cannot be altered.';
            END IF;
            IF NEW.status != OLD.status THEN
                RAISE EXCEPTION 'Unauthorized: Passport card status is managed by system administrators.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Attach Tampering Protection Triggers
DROP TRIGGER IF EXISTS check_project_tampering ON public.projects;
CREATE TRIGGER check_project_tampering
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.prevent_authoritative_tampering();

DROP TRIGGER IF EXISTS check_evidence_tampering ON public.evidence;
CREATE TRIGGER check_evidence_tampering
    BEFORE UPDATE ON public.evidence
    FOR EACH ROW EXECUTE FUNCTION public.prevent_authoritative_tampering();

DROP TRIGGER IF EXISTS check_passport_tampering ON public.passport_cards;
CREATE TRIGGER check_passport_tampering
    BEFORE UPDATE ON public.passport_cards
    FOR EACH ROW EXECUTE FUNCTION public.prevent_authoritative_tampering();


-- ==============================================================================
-- 6. HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_events ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies safely
DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own passport card" ON public.passport_cards;
DROP POLICY IF EXISTS "Public can view active cards if public enabled" ON public.passport_cards;

DROP POLICY IF EXISTS "Users can view and manage their own privacy settings" ON public.privacy_settings;

DROP POLICY IF EXISTS "Users can manage their own capability states" ON public.capability_states;
DROP POLICY IF EXISTS "Public capability states viewable if profile public" ON public.capability_states;

DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
DROP POLICY IF EXISTS "Public projects are viewable by anyone" ON public.projects;

DROP POLICY IF EXISTS "Users can manage their own evidence records" ON public.evidence;
DROP POLICY IF EXISTS "Public evidence viewable if enabled" ON public.evidence;

DROP POLICY IF EXISTS "Users can view their own credentials" ON public.credentials;
DROP POLICY IF EXISTS "Public credentials viewable by anyone" ON public.credentials;

DROP POLICY IF EXISTS "Users can view and update their own learning progress" ON public.learning_progress;

DROP POLICY IF EXISTS "Users can view their own journey timeline" ON public.journey_events;
DROP POLICY IF EXISTS "Public journey events viewable if passport enabled" ON public.journey_events;


-- A. PROFILES POLICIES
CREATE POLICY "Public profiles are readable by everyone"
    ON public.profiles FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Prevent self-escalation to ADMIN

-- B. PASSPORT CARDS POLICIES
CREATE POLICY "Users can view their own passport card"
    ON public.passport_cards FOR SELECT
    USING (
        auth.uid() = user_id 
        OR (
            activation_status = 'ACTIVATED' AND EXISTS (
                SELECT 1 FROM public.privacy_settings ps 
                WHERE ps.user_id = passport_cards.user_id 
                AND ps.is_public_passport_enabled = TRUE
            )
        )
    );

-- C. PRIVACY SETTINGS POLICIES
CREATE POLICY "Users can view and manage their own privacy settings"
    ON public.privacy_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- D. CAPABILITY STATES POLICIES
CREATE POLICY "Users can manage their own capability states"
    ON public.capability_states FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public capability states viewable if public passport enabled"
    ON public.capability_states FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.privacy_settings ps 
            WHERE ps.user_id = capability_states.user_id 
            AND ps.is_public_passport_enabled = TRUE
        )
    );

-- E. PROJECTS POLICIES
CREATE POLICY "Users can manage their own projects"
    ON public.projects FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public projects are viewable by anyone"
    ON public.projects FOR SELECT
    USING (
        is_public = TRUE AND EXISTS (
            SELECT 1 FROM public.privacy_settings ps 
            WHERE ps.user_id = projects.user_id 
            AND ps.is_public_passport_enabled = TRUE
        )
    );

-- F. EVIDENCE POLICIES
CREATE POLICY "Users can manage their own evidence"
    ON public.evidence FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public evidence viewable if public passport enabled"
    ON public.evidence FOR SELECT
    USING (
        is_public = TRUE AND EXISTS (
            SELECT 1 FROM public.privacy_settings ps 
            WHERE ps.user_id = evidence.user_id 
            AND ps.is_public_passport_enabled = TRUE
        )
    );

-- G. CREDENTIALS POLICIES (AUTHORITATIVE ISSUANCE ONLY)
-- Note: Learners can ONLY view their credentials. Insert/Update is restricted to Service Role / Admin.
CREATE POLICY "Users can view their own credentials"
    ON public.credentials FOR SELECT
    USING (
        auth.uid() = user_id 
        OR (
            is_public = TRUE AND EXISTS (
                SELECT 1 FROM public.privacy_settings ps 
                WHERE ps.user_id = credentials.user_id 
                AND ps.is_public_passport_enabled = TRUE
            )
        )
    );

-- H. LEARNING PROGRESS POLICIES
CREATE POLICY "Users can manage their own learning progress"
    ON public.learning_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- I. JOURNEY EVENTS POLICIES
CREATE POLICY "Users can manage their own journey events"
    ON public.journey_events FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public journey events viewable if public passport enabled"
    ON public.journey_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.privacy_settings ps 
            WHERE ps.user_id = journey_events.user_id 
            AND ps.is_public_passport_enabled = TRUE
        )
    );


-- ==============================================================================
-- 7. DATA API GRANTS (Required when "Automatically expose new tables" is disabled)
-- ==============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant authenticated learners full access to user tables (subject to RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant anonymous visitors read access to public tables (subject to RLS)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Ensure default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;


-- ==============================================================================
-- 8. STAGE 4 LEARN CATALOGUE MIGRATION & SECURITY POLICIES
-- ==============================================================================

-- Enums for Source Taxonomy & Delivery Format
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_source_type') THEN
        CREATE TYPE public.learning_source_type AS ENUM ('PASSPORT_ORIGINAL', 'PASSPORT_LIVE', 'PARTNER_PATHWAY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_format') THEN
        CREATE TYPE public.learning_format AS ENUM ('SELF_PACED', 'LIVE_WORKSHOP', 'COHORT', 'MASTERCLASS');
    END IF;
END $$;

-- PROGRAMMES TABLE (Master Learning Pathway Catalogue)
CREATE TABLE IF NOT EXISTS public.programmes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    short_description TEXT,
    description TEXT,
    source_type public.learning_source_type NOT NULL DEFAULT 'PASSPORT_ORIGINAL',
    format public.learning_format NOT NULL DEFAULT 'SELF_PACED',
    provider_name TEXT NOT NULL DEFAULT 'AI Passport',
    provider_logo_url TEXT,
    capability_dimensions public.capability_dimension[] NOT NULL DEFAULT '{}',
    estimated_minutes INT,
    level TEXT,
    build_outcome_title TEXT,
    enrollment_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    publication_status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (publication_status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROGRAMME MODULES TABLE (Curriculum Breakdown)
CREATE TABLE IF NOT EXISTS public.programme_modules (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    programme_id UUID NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    sequence_order INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT,
    estimated_minutes INT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(programme_id, sequence_order),
    UNIQUE(programme_id, slug)
);

-- Performance Indexes (Cleaned of duplicates)
CREATE INDEX IF NOT EXISTS idx_programmes_source_type ON public.programmes(source_type);
CREATE INDEX IF NOT EXISTS idx_programmes_publication_status ON public.programmes(publication_status);
CREATE INDEX IF NOT EXISTS idx_programmes_is_featured ON public.programmes(is_featured);
CREATE INDEX IF NOT EXISTS idx_programme_modules_programme_id ON public.programme_modules(programme_id);

-- Standardized updated_at Triggers
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_programmes_modtime') THEN
        CREATE TRIGGER update_programmes_modtime 
        BEFORE UPDATE ON public.programmes 
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_programme_modules_modtime') THEN
        CREATE TRIGGER update_programme_modules_modtime 
        BEFORE UPDATE ON public.programme_modules 
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_modules ENABLE ROW LEVEL SECURITY;

-- RLS Security Policies (Strict Authoritative Publication Access)
DROP POLICY IF EXISTS "Learners can view published programmes" ON public.programmes;
CREATE POLICY "Learners can view published programmes" ON public.programmes
    FOR SELECT TO authenticated
    USING (publication_status = 'PUBLISHED');

DROP POLICY IF EXISTS "Learners can view published modules" ON public.programme_modules;
CREATE POLICY "Learners can view published modules" ON public.programme_modules
    FOR SELECT TO authenticated
    USING (
        is_published = true
        AND EXISTS (
            SELECT 1 FROM public.programmes p
            WHERE p.id = programme_modules.programme_id
              AND p.publication_status = 'PUBLISHED'
        )
    );

-- Data API Grants (Authenticated Select Only)
GRANT SELECT ON public.programmes TO authenticated;
GRANT SELECT ON public.programme_modules TO authenticated;


-- ==============================================================================
-- 9. STAGE 5 PROJECTS & EVIDENCE SCHEMA EXTENSION & SECURITY ENFORCEMENT
-- ==============================================================================

-- Extend projects table with canonical programme FK, AI role & reflection metadata
ALTER TABLE public.projects 
    ADD COLUMN IF NOT EXISTS programme_id UUID REFERENCES public.programmes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS ai_role_description TEXT,
    ADD COLUMN IF NOT EXISTS reflection_text TEXT;

-- Enforce learner workflow status constraint (omits VERIFIED)
ALTER TABLE public.projects 
    DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects 
    ADD CONSTRAINT projects_status_check 
    CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'READY_TO_DEMONSTRATE', 'SUBMITTED', 'ARCHIVED'));

-- Extend evidence table with explicit project FK
ALTER TABLE public.evidence 
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_programme_id ON public.projects(programme_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_evidence_project_id ON public.evidence(project_id);

-- Authoritative Security Trigger for Evidence Verification Status
-- Ensures authenticated learners cannot self-assign verification_status = 'VERIFIED'
CREATE OR REPLACE FUNCTION public.protect_evidence_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_status = 'VERIFIED' AND (OLD IS NULL OR OLD.verification_status IS DISTINCT FROM 'VERIFIED') THEN
        -- Only allow service_role or admin to set VERIFIED
        IF (current_setting('role', true) <> 'service_role' AND current_setting('request.jwt.claim.role', true) <> 'service_role') THEN
            NEW.verification_status := COALESCE(OLD.verification_status, 'UNVERIFIED');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_protect_evidence_verification') THEN
        CREATE TRIGGER trg_protect_evidence_verification
        BEFORE INSERT OR UPDATE ON public.evidence
        FOR EACH ROW EXECUTE FUNCTION public.protect_evidence_verification_status();
    END IF;
END $$;


-- ==============================================================================
-- 10. STAGE 6 CREDENTIALS & VERIFICATION TRUST MIGRATION
-- ==============================================================================

-- 1. Extend credentials table with programme_id, project_id, status, and revocation fields
ALTER TABLE public.credentials 
    ADD COLUMN IF NOT EXISTS programme_id UUID REFERENCES public.programmes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'REVOKED')),
    ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS revocation_reason TEXT;

-- Remove misleading Council default from issuer
ALTER TABLE public.credentials 
    ALTER COLUMN issuer DROP DEFAULT;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_credentials_status ON public.credentials(status);
CREATE INDEX IF NOT EXISTS idx_credentials_programme_id ON public.credentials(programme_id);
CREATE INDEX IF NOT EXISTS idx_credentials_project_id ON public.credentials(project_id);

-- 2. Lock capability_states: Read-only for learners (Authority Protection)
DROP POLICY IF EXISTS "Users can manage their own capability states" ON public.capability_states;
DROP POLICY IF EXISTS "Users can view their own capability states" ON public.capability_states;

CREATE POLICY "Users can view their own capability states"
    ON public.capability_states FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE ON public.capability_states FROM authenticated;
GRANT SELECT ON public.capability_states TO authenticated;

-- 3. Cleanup older Stage 5 evidence triggers to avoid conflicting logic
DROP TRIGGER IF EXISTS trg_protect_evidence_verification ON public.evidence;
DROP TRIGGER IF EXISTS trg_protect_evidence_security_and_immutability ON public.evidence;
DROP TRIGGER IF EXISTS trg_protect_evidence_authority_and_immutability ON public.evidence;

-- 4. Install ONE Consolidated Evidence Authority & Immutability Security Trigger
CREATE OR REPLACE FUNCTION public.protect_evidence_authority_and_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
    -- A. Prevent learners from deleting VERIFIED evidence
    IF TG_OP = 'DELETE' AND OLD.verification_status = 'VERIFIED' THEN
        IF (current_setting('role', true) <> 'service_role') THEN
            RAISE EXCEPTION 'Verified evidence records are immutable and cannot be deleted by learners.';
        END IF;
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- B. Prevent learners from altering content/metadata of VERIFIED evidence (is_public is the ONLY exception)
        IF OLD.verification_status = 'VERIFIED' THEN
            IF (current_setting('role', true) <> 'service_role') THEN
                IF (NEW.url IS DISTINCT FROM OLD.url OR
                    NEW.attachment_url IS DISTINCT FROM OLD.attachment_url OR
                    NEW.capability_dimension IS DISTINCT FROM OLD.capability_dimension OR
                    NEW.evidence_type IS DISTINCT FROM OLD.evidence_type OR
                    NEW.source_type IS DISTINCT FROM OLD.source_type OR
                    NEW.related_id IS DISTINCT FROM OLD.related_id OR
                    NEW.project_id IS DISTINCT FROM OLD.project_id OR
                    NEW.user_id IS DISTINCT FROM OLD.user_id OR
                    NEW.metadata IS DISTINCT FROM OLD.metadata OR
                    NEW.reviewer_notes IS DISTINCT FROM OLD.reviewer_notes OR
                    NEW.verification_status IS DISTINCT FROM OLD.verification_status) THEN
                    RAISE EXCEPTION 'Verified evidence content is immutable and cannot be modified by learners.';
                END IF;
            END IF;
        END IF;

        -- C. Prevent learners from self-assigning VERIFIED status
        IF NEW.verification_status = 'VERIFIED' AND OLD.verification_status IS DISTINCT FROM 'VERIFIED' THEN
            IF (current_setting('role', true) <> 'service_role') THEN
                RAISE EXCEPTION 'Authoritative verification status can only be granted by an authorized reviewer.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_protect_evidence_authority_and_immutability') THEN
        CREATE TRIGGER trg_protect_evidence_authority_and_immutability
        BEFORE UPDATE OR DELETE ON public.evidence
        FOR EACH ROW EXECUTE FUNCTION public.protect_evidence_authority_and_immutability();
    END IF;
END $$;



-- ============================================================================
-- 11. STAGE 8 — PUBLIC AI PASSPORT & SHARING SECURITY MIGRATION
-- ============================================================================

-- A. Revoke direct anon SELECT on profiles to prevent email leakage
REVOKE SELECT ON public.profiles FROM anon;

-- Ensure authenticated users can still select their own profile
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- B. Controlled SECURITY DEFINER Public Passport RPC
CREATE OR REPLACE FUNCTION public.get_public_passport(p_identifier TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_passport_num TEXT;
    v_is_public BOOLEAN;
    v_show_projects BOOLEAN;
    v_show_evidence BOOLEAN;
    v_show_credentials BOOLEAN;
    v_card_status TEXT;
    v_profile RECORD;
    v_caps JSONB;
    v_projects JSONB;
    v_evidence JSONB;
    v_credentials JSONB;
BEGIN
    IF p_identifier IS NULL OR TRIM(p_identifier) = '' THEN
        RETURN jsonb_build_object('status', 'PASSPORT_NOT_AVAILABLE');
    END IF;

    -- 1. Identifier Lookup (Passport Number case-insensitive first, then username)
    SELECT user_id, passport_number, status INTO v_user_id, v_passport_num, v_card_status
    FROM public.passport_cards
    WHERE UPPER(TRIM(passport_number)) = UPPER(TRIM(p_identifier))
    LIMIT 1;

    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id
        FROM public.profiles
        WHERE LOWER(TRIM(username)) = LOWER(TRIM(p_identifier))
        LIMIT 1;

        IF v_user_id IS NOT NULL THEN
            SELECT passport_number, status INTO v_passport_num, v_card_status
            FROM public.passport_cards
            WHERE user_id = v_user_id
            LIMIT 1;
        END IF;
    END IF;

    -- 2. Master Gate Check (Passport must exist & card must be ACTIVE)
    IF v_user_id IS NULL OR v_card_status != 'ACTIVE' THEN
        RETURN jsonb_build_object('status', 'PASSPORT_NOT_AVAILABLE');
    END IF;

    -- Check Privacy Settings
    SELECT is_public_passport_enabled, show_projects, show_evidence, show_credentials
    INTO v_is_public, v_show_projects, v_show_evidence, v_show_credentials
    FROM public.privacy_settings
    WHERE user_id = v_user_id;

    IF v_is_public IS NOT TRUE THEN
        RETURN jsonb_build_object('status', 'PASSPORT_NOT_AVAILABLE');
    END IF;

    -- 3. Fetch Approved Identity Fields (NO email, NO user_id, NO internal IDs)
    SELECT full_name, username, avatar_url, bio, created_at INTO v_profile
    FROM public.profiles WHERE id = v_user_id;

    -- 4. Fetch Authoritative Capability States (NO internal IDs, NO timestamps)
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'dimension', dimension,
        'state', state
    )), '[]'::jsonb) INTO v_caps
    FROM public.capability_states
    WHERE user_id = v_user_id;

    -- 5. Fetch Public Projects (NO internal UUIDs)
    IF v_show_projects IS TRUE THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'title', title,
            'description', description,
            'problem_statement', problem_statement,
            'solution_summary', solution_summary,
            'tools_used', tools_used,
            'capability_dimensions', capability_dimensions,
            'project_url', project_url,
            'repo_url', repo_url,
            'completion_date', completion_date,
            'has_verified_evidence', (
                v_show_evidence IS TRUE AND EXISTS (
                    SELECT 1 FROM public.evidence e 
                    WHERE e.project_id = projects.id 
                      AND e.verification_status = 'VERIFIED'
                      AND e.is_public = TRUE
                )
            )
        )), '[]'::jsonb) INTO v_projects
        FROM public.projects
        WHERE user_id = v_user_id AND is_public = TRUE;
    ELSE
        v_projects := '[]'::jsonb;
    END IF;

    -- 6. Fetch Public Verified Evidence (NO private project leakage, NO internal UUIDs)
    IF v_show_evidence IS TRUE THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'evidence_type', evidence_type,
            'capability_dimension', capability_dimension,
            'verification_status', verification_status,
            'url', url
        )), '[]'::jsonb) INTO v_evidence
        FROM public.evidence
        WHERE user_id = v_user_id AND is_public = TRUE AND verification_status = 'VERIFIED';
    ELSE
        v_evidence := '[]'::jsonb;
    END IF;

    -- 7. Fetch Public Issued Credentials (NO internal UUIDs, NO verification_hash)
    IF v_show_credentials IS TRUE THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'credential_number', credential_number,
            'title', title,
            'issuer', issuer,
            'issue_date', issue_date
        )), '[]'::jsonb) INTO v_credentials
        FROM public.credentials
        WHERE user_id = v_user_id AND is_public = TRUE AND status = 'ISSUED';
    ELSE
        v_credentials := '[]'::jsonb;
    END IF;

    -- 8. Return Curated Public JSON Contract
    RETURN jsonb_build_object(
        'status', 'PUBLIC',
        'identity', jsonb_build_object(
            'full_name', v_profile.full_name,
            'username', v_profile.username,
            'avatar_url', v_profile.avatar_url,
            'bio', v_profile.bio,
            'passport_number', v_passport_num,
            'member_since', v_profile.created_at
        ),
        'record', jsonb_build_object(
            'projects_count', jsonb_array_length(v_projects),
            'verified_evidence_count', jsonb_array_length(v_evidence),
            'credentials_count', jsonb_array_length(v_credentials)
        ),
        'capabilities', v_caps,
        'projects', v_projects,
        'evidence', v_evidence,
        'credentials', v_credentials
    );
END;
$$;

-- Secure Execution Privileges
REVOKE ALL ON FUNCTION public.get_public_passport(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_passport(TEXT) TO anon, authenticated;

