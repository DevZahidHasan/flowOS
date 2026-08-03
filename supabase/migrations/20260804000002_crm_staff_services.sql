-- 1. EXPANDED CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    birthday DATE,
    marketing_consent BOOLEAN DEFAULT false,
    referral_source TEXT DEFAULT 'Direct',
    preferred_staff_name TEXT,
    preferred_service_name TEXT,
    tags TEXT[] DEFAULT '{}',
    loyalty_points INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    lifetime_spending NUMERIC(10,2) DEFAULT 0.00,
    outstanding_balance NUMERIC(10,2) DEFAULT 0.00,
    last_visit_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. CUSTOMER NOTES TABLE
CREATE TABLE IF NOT EXISTS public.customer_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. AUTOMATED CUSTOMER TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.customer_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- CREATED, APPOINTMENT_BOOKED, APPOINTMENT_COMPLETED, INVOICE_PAID, POINTS_ADDED, NOTE_ADDED
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. EXPANDED STAFF PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    role_title TEXT DEFAULT 'Staff Member',
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    commission_rate NUMERIC(5,2) DEFAULT 0.00,
    specialties TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    average_rating NUMERIC(3,2) DEFAULT 5.00,
    completed_appointments INTEGER DEFAULT 0,
    total_revenue_generated NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. STAFF WORKING SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 (Sun) to 6 (Sat)
    start_time TIME NOT NULL DEFAULT '09:00',
    end_time TIME NOT NULL DEFAULT '17:00',
    break_start TIME DEFAULT '12:00',
    break_end TIME DEFAULT '13:00',
    is_day_off BOOLEAN DEFAULT false,
    UNIQUE(staff_id, day_of_week)
);

-- 6. STAFF SERVICES COMPATIBILITY TABLE
CREATE TABLE IF NOT EXISTS public.staff_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    UNIQUE(staff_id, service_id)
);

-- 7. EXPANDED SERVICES CATALOG TABLE
-- (Updating existing services table columns)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS prep_time_min INTEGER DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS buffer_time_min INTEGER DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS cleanup_time_min INTEGER DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS required_skill TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 0.00;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS color_code TEXT DEFAULT '#8B5CF6';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- INDEXES FOR SPEED
CREATE INDEX IF NOT EXISTS idx_customers_workspace ON public.customers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_customer_timeline ON public.customer_timeline(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_workspace ON public.staff_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff ON public.staff_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_link ON public.staff_services(staff_id, service_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Workspace members manage customers" ON public.customers
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Workspace members manage customer notes" ON public.customer_notes
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Workspace members view customer timeline" ON public.customer_timeline
    FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Workspace members manage staff profiles" ON public.staff_profiles
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Workspace members manage staff schedules" ON public.staff_schedules
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Workspace members manage staff services" ON public.staff_services
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
