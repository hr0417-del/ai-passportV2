-- ==============================================================================
-- MY AI PASSPORT™ — SUPABASE PHASE 1 DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================
-- Run this complete SQL script in your Supabase SQL Editor:
-- https://app.supabase.com -> Project -> SQL Editor -> New Query

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE passport_status AS ENUM ('ACTIVE', 'PENDING_DELIVERY', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE activation_status AS ENUM ('ACTIVATED', 'UNCLAIMED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE capability_dimension AS ENUM ('UNDERSTAND', 'APPLY', 'CREATE', 'EVALUATE', 'RESPONSIBLE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE progression_state AS ENUM ('EXPLORE', 'DEVELOP', 'DEMONSTRATE', 'ADVANCE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE evidence_type AS ENUM ('GITHUB_REPO', 'LIVE_AGENT', 'TECHNICAL_DOC', 'ARCHITECTURE_DIAGRAM', 'EXTERNAL_WORK', 'MENTOR_REVIEW');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE badge_type AS ENUM ('FOUNDATION', 'PRACTITIONER', 'ARCHITECT', 'WORKSHOP_BUILD');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE journey_event_type AS ENUM (
        'JOINED', 'CLAIMED_PASSPORT', 'STARTED_PROGRAMME', 'COMPLETED_MODULE', 
        'BUILT_PROJECT', 'PROJECT_VERIFIED', 'CREDENTIAL_EARNED', 'CAPABILITY_PROGRESSED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ==============================================================================
-- 3. CORE TABLES
-- ==============================================================================

-- A. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    role TEXT DEFAULT 'LEARNER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. PASSPORT CARDS TABLE (Physical & Digital Identity)
CREATE TABLE IF NOT EXISTS public.passport_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    passport_number TEXT UNIQUE NOT NULL, -- e.g. AIP-L1-2026-000245
    issue_date DATE DEFAULT CURRENT_DATE,
    status passport_status DEFAULT 'ACTIVE',
    activation_status activation_status DEFAULT 'ACTIVATED',
    qr_code_url TEXT,
    claim_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. PRIVACY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public_passport_enabled BOOLEAN DEFAULT TRUE,
    show_learning_progress BOOLEAN DEFAULT FALSE,
    show_incomplete_projects BOOLEAN DEFAULT FALSE,
    public_project_ids JSONB DEFAULT '[]'::jsonb,
    public_credential_ids JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. CAPABILITY STATES TABLE (5 Dimensions, 4 Progression States)
CREATE TABLE IF NOT EXISTS public.capability_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dimension capability_dimension NOT NULL,
    state progression_state NOT NULL DEFAULT 'EXPLORE',
    evidence_ids JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, dimension)
);

-- E. PROJECTS TABLE (Evidence of Capability)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    problem_statement TEXT,
    solution_summary TEXT,
    learner_role TEXT DEFAULT 'CREATOR',
    tools_used TEXT[] DEFAULT '{}',
    capability_dimensions capability_dimension[] DEFAULT '{}',
    evidence_type evidence_type DEFAULT 'GITHUB_REPO',
    status TEXT DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED'
    project_url TEXT,
    repo_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    completion_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. EVIDENCE TABLE (Foundational Evidence Engine)
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evidence_type evidence_type NOT NULL,
    capability_dimension capability_dimension NOT NULL,
    source_type TEXT NOT NULL, -- 'PROJECT', 'ASSESSMENT', 'WORKSHOP', 'EXTERNAL'
    related_id UUID,
    verification_status TEXT DEFAULT 'UNVERIFIED', -- 'UNVERIFIED', 'PENDING', 'VERIFIED'
    reviewer_notes TEXT,
    url TEXT,
    attachment_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. CREDENTIALS TABLE (Verified Credential Wallet)
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    badge_type badge_type DEFAULT 'FOUNDATION',
    issuer TEXT DEFAULT 'AI PASSPORT COUNCIL™',
    issue_date DATE DEFAULT CURRENT_DATE,
    verification_hash TEXT UNIQUE NOT NULL,
    verification_url TEXT,
    certificate_pdf_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. LEARNING PROGRESS TABLE (Module & Pathway Tracking)
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    programme_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    state progression_state DEFAULT 'EXPLORE',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- I. JOURNEY EVENTS TABLE (Milestone Event Stream)
CREATE TABLE IF NOT EXISTS public.journey_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type journey_event_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- 4. AUTOMATIC TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_username TEXT;
    seq_num INT;
    generated_passport TEXT;
BEGIN
    -- Generate unique username from email
    new_username := SPLIT_PART(NEW.email, '@', 1) || '_' || FLOOR(RANDOM() * 9000 + 1000)::TEXT;
    
    -- Insert profile
    INSERT INTO public.profiles (id, email, full_name, username, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        new_username,
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- Generate sequential Passport ID: AIP-L1-2026-XXXXXX
    seq_num := FLOOR(RANDOM() * 899999 + 100000)::INT;
    generated_passport := 'AIP-L1-2026-' || seq_num::TEXT;

    -- Create Passport Card
    INSERT INTO public.passport_cards (user_id, passport_number, status, activation_status)
    VALUES (NEW.id, generated_passport, 'ACTIVE', 'ACTIVATED');

    -- Create Privacy Settings
    INSERT INTO public.privacy_settings (user_id, is_public_passport_enabled)
    VALUES (NEW.id, TRUE);

    -- Initialize 5 Capability Dimensions
    INSERT INTO public.capability_states (user_id, dimension, state) VALUES
        (NEW.id, 'UNDERSTAND', 'EXPLORE'),
        (NEW.id, 'APPLY', 'EXPLORE'),
        (NEW.id, 'CREATE', 'EXPLORE'),
        (NEW.id, 'EVALUATE', 'EXPLORE'),
        (NEW.id, 'RESPONSIBLE', 'EXPLORE');

    -- Record Journey Event
    INSERT INTO public.journey_events (user_id, event_type, title, description)
    VALUES (NEW.id, 'JOINED', 'Joined AI Passport Ecosystem', 'Issued Digital Passport Identity: ' || generated_passport);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_events ENABLE ROW LEVEL SECURITY;

-- A. PROFILES POLICIES
CREATE POLICY "Public profiles are readable by everyone"
    ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- B. PASSPORT CARDS POLICIES
CREATE POLICY "Users can view their own passport card"
    ON public.passport_cards FOR SELECT USING (auth.uid() = user_id OR activation_status = 'ACTIVATED');

CREATE POLICY "Users can update their own passport card"
    ON public.passport_cards FOR UPDATE USING (auth.uid() = user_id);

-- C. PRIVACY SETTINGS POLICIES
CREATE POLICY "Users can view and manage their own privacy settings"
    ON public.privacy_settings FOR ALL USING (auth.uid() = user_id);

-- D. CAPABILITY STATES POLICIES
CREATE POLICY "Users can manage their own capability states"
    ON public.capability_states FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public capability states viewable if profile public"
    ON public.capability_states FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.privacy_settings ps 
            WHERE ps.user_id = capability_states.user_id 
            AND ps.is_public_passport_enabled = TRUE
        )
    );

-- E. PROJECTS POLICIES
CREATE POLICY "Users can manage their own projects"
    ON public.projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public projects are viewable by anyone"
    ON public.projects FOR SELECT USING (
        is_public = TRUE AND EXISTS (
            SELECT 1 FROM public.privacy_settings ps 
            WHERE ps.user_id = projects.user_id 
            AND ps.is_public_passport_enabled = TRUE
        )
    );

-- F. EVIDENCE POLICIES
CREATE POLICY "Users can manage their own evidence records"
    ON public.evidence FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public evidence viewable if enabled"
    ON public.evidence FOR SELECT USING (is_public = TRUE);

-- G. CREDENTIALS POLICIES
CREATE POLICY "Users can view their own credentials"
    ON public.credentials FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public credentials viewable by anyone"
    ON public.credentials FOR SELECT USING (is_public = TRUE);

-- H. LEARNING PROGRESS POLICIES
CREATE POLICY "Users can view and update their own learning progress"
    ON public.learning_progress FOR ALL USING (auth.uid() = user_id);

-- I. JOURNEY EVENTS POLICIES
CREATE POLICY "Users can view their own journey timeline"
    ON public.journey_events FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public journey events viewable if passport enabled"
    ON public.journey_events FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.privacy_settings ps 
            WHERE ps.user_id = journey_events.user_id 
            AND ps.is_public_passport_enabled = TRUE
        )
    );
