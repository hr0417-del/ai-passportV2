-- ==============================================================================
-- MY AI PASSPORT™ — SUPABASE PRODUCTION DATABASE SCHEMA & RLS SECURITY POLICIES
-- ==============================================================================
-- Target Supabase Project: https://uxuaisvdmvkircymwvdl.supabase.co
-- Safety: Fully idempotent. Safe to execute against new or existing Supabase projects.

-- 1. Enable Required Extensions (in extensions schema)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 2. Create Custom Enums (Idempotent)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'passport_status') THEN
        CREATE TYPE public.passport_status AS ENUM ('ACTIVE', 'PENDING_DELIVERY', 'SUSPENDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activation_status') THEN
        CREATE TYPE public.activation_status AS ENUM ('ACTIVATED', 'UNCLAIMED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'capability_dimension') THEN
        CREATE TYPE public.capability_dimension AS ENUM ('UNDERSTAND', 'APPLY', 'CREATE', 'EVALUATE', 'RESPONSIBLE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progression_state') THEN
        CREATE TYPE public.progression_state AS ENUM ('EXPLORE', 'DEVELOP', 'DEMONSTRATE', 'ADVANCE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evidence_type') THEN
        CREATE TYPE public.evidence_type AS ENUM ('GITHUB_REPO', 'LIVE_AGENT', 'TECHNICAL_DOC', 'ARCHITECTURE_DIAGRAM', 'EXTERNAL_WORK', 'MENTOR_REVIEW');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_type') THEN
        CREATE TYPE public.badge_type AS ENUM ('FOUNDATION', 'PRACTITIONER', 'ARCHITECT', 'WORKSHOP_BUILD');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'journey_event_type') THEN
        CREATE TYPE public.journey_event_type AS ENUM (
            'JOINED', 'CLAIMED_PASSPORT', 'STARTED_PROGRAMME', 'COMPLETED_MODULE', 
            'BUILT_PROJECT', 'PROJECT_VERIFIED', 'CREDENTIAL_EARNED', 'CAPABILITY_PROGRESSED'
        );
    END IF;
END $$;


-- ==============================================================================
-- 3. CORE TABLES & CONSTRAINTS
-- ==============================================================================

-- A. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'LEARNER', -- 'LEARNER', 'MENTOR', 'ADMIN'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B. PASSPORT CARDS TABLE (Supports Pre-registered Unclaimed & Claimed Cards)
CREATE TABLE IF NOT EXISTS public.passport_cards (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL if unclaimed pre-registered card
    passport_number TEXT UNIQUE NOT NULL, -- e.g. AIP-L1-2026-000245
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status public.passport_status NOT NULL DEFAULT 'ACTIVE',
    activation_status public.activation_status NOT NULL DEFAULT 'ACTIVATED',
    qr_code_url TEXT,
    claim_token TEXT UNIQUE, -- Used for future "Claim Your Passport" flow
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- C. PRIVACY SETTINGS TABLE (Granular Visibility Controls)
CREATE TABLE IF NOT EXISTS public.privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public_passport_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    show_learning_progress BOOLEAN NOT NULL DEFAULT FALSE,
    show_incomplete_projects BOOLEAN NOT NULL DEFAULT FALSE,
    public_project_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    public_credential_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- D. CAPABILITY STATES TABLE (5 Dimensions, 4 Progression States)
CREATE TABLE IF NOT EXISTS public.capability_states (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dimension public.capability_dimension NOT NULL,
    state public.progression_state NOT NULL DEFAULT 'EXPLORE',
    evidence_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, dimension)
);

-- E. PROJECTS TABLE (Evidence of Capability)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    problem_statement TEXT,
    solution_summary TEXT,
    learner_role TEXT DEFAULT 'CREATOR',
    tools_used TEXT[] DEFAULT '{}',
    capability_dimensions public.capability_dimension[] DEFAULT '{}',
    evidence_type public.evidence_type DEFAULT 'GITHUB_REPO',
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED'
    project_url TEXT,
    repo_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    completion_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- F. EVIDENCE TABLE (Foundational Evidence Engine)
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evidence_type public.evidence_type NOT NULL,
    capability_dimension public.capability_dimension NOT NULL,
    source_type TEXT NOT NULL, -- 'PROJECT', 'ASSESSMENT', 'WORKSHOP', 'EXTERNAL'
    related_id UUID,
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED', -- 'UNVERIFIED', 'PENDING', 'VERIFIED'
    reviewer_notes TEXT,
    url TEXT,
    attachment_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- G. CREDENTIALS TABLE (Verified Credential Wallet - Authoritative Only)
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    badge_type public.badge_type NOT NULL DEFAULT 'FOUNDATION',
    issuer TEXT NOT NULL DEFAULT 'AI PASSPORT COUNCIL™',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    verification_hash TEXT UNIQUE NOT NULL,
    verification_url TEXT,
    certificate_pdf_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- H. LEARNING PROGRESS TABLE (Module & Pathway Tracking)
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    programme_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    state public.progression_state NOT NULL DEFAULT 'EXPLORE',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- I. JOURNEY EVENTS TABLE (Milestone Event Stream)
CREATE TABLE IF NOT EXISTS public.journey_events (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type public.journey_event_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_passport_cards_user ON public.passport_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_passport_cards_number ON public.passport_cards(passport_number);
CREATE INDEX IF NOT EXISTS idx_passport_cards_claim ON public.passport_cards(claim_token) WHERE claim_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_public ON public.projects(user_id, is_public);

CREATE INDEX IF NOT EXISTS idx_evidence_user_dim ON public.evidence(user_id, capability_dimension);
CREATE INDEX IF NOT EXISTS idx_credentials_user ON public.credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_hash ON public.credentials(verification_hash);

CREATE INDEX IF NOT EXISTS idx_capability_user ON public.capability_states(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_user_time ON public.journey_events(user_id, occurred_at DESC);


-- ==============================================================================
-- 5. SECURE AUTOMATIC TRIGGERS & FUNCTIONS
-- ==============================================================================

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
