-- 1. CREATE ENUMS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_role_enum') THEN
        CREATE TYPE public.platform_role_enum AS ENUM ('platform_admin', 'platform_support', 'platform_user');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status_enum') THEN
        CREATE TYPE public.account_status_enum AS ENUM ('pending', 'active', 'suspended', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_role_enum') THEN
        CREATE TYPE public.workspace_role_enum AS ENUM ('owner', 'manager', 'staff');
    END IF;
END $$;

-- 2. ALTER PROFILES TABLE
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS platform_role public.platform_role_enum NOT NULL DEFAULT 'platform_user',
ADD COLUMN IF NOT EXISTS account_status public.account_status_enum NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_create_workspace BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. ALTER WORKSPACE MEMBERS TABLE (MIGRATE strings to lower-case enums)
-- Map existing uppercase role strings to lowercase enum counterparts
UPDATE public.workspace_members 
SET role = CASE 
    WHEN UPPER(role) = 'OWNER' THEN 'owner'
    WHEN UPPER(role) = 'ADMIN' THEN 'manager'
    WHEN UPPER(role) = 'MANAGER' THEN 'manager'
    WHEN UPPER(role) = 'STAFF' THEN 'staff'
    ELSE 'staff'
END;
-- Drop depending policies that reference the role column before altering type
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- Drop the legacy default value of the role column before type change
ALTER TABLE public.workspace_members ALTER COLUMN role DROP DEFAULT;

-- Alter the role column type to the new workspace_role_enum
ALTER TABLE public.workspace_members 
ALTER COLUMN role TYPE public.workspace_role_enum 
USING role::text::public.workspace_role_enum;

-- Alter DEFAULT value for role column to lowercase enum
ALTER TABLE public.workspace_members
ALTER COLUMN role SET DEFAULT 'staff'::public.workspace_role_enum;

-- 4. ALTER AUDIT LOGS TABLE (SUPPORT platform-level logs)
ALTER TABLE public.audit_logs ALTER COLUMN workspace_id DROP NOT NULL;

ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 5. CREATE SECURITY DEFINER FUNCTION TO PREVENT RLS RECURSION
CREATE OR REPLACE FUNCTION public.get_platform_role(user_id UUID)
RETURNS public.platform_role_enum AS $$
BEGIN
    RETURN (SELECT platform_role FROM public.profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RE-ENFORCE ROW LEVEL SECURITY & UPDATE POLICIES

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or platform_admin view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or platform_admin update all" ON public.profiles;

CREATE POLICY "Users can view own profile or platform_admin view all" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR public.get_platform_role(auth.uid()) = 'platform_admin'
    );

CREATE POLICY "Users can update own profile or platform_admin update all" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id 
        OR public.get_platform_role(auth.uid()) = 'platform_admin'
    );

-- Workspace members policies
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and Managers can manage workspace members" ON public.workspace_members;

CREATE POLICY "Members can view workspace members" ON public.workspace_members
    FOR SELECT USING (
        workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
        OR public.get_platform_role(auth.uid()) = 'platform_admin'
    );

CREATE POLICY "Owners and Managers can manage workspace members" ON public.workspace_members
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
        )
    );

-- Workspaces policies
DROP POLICY IF EXISTS "Members can view workspace" ON public.workspaces;

CREATE POLICY "Members can view workspace" ON public.workspaces
    FOR SELECT USING (
        id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
        OR public.get_platform_role(auth.uid()) = 'platform_admin'
    );

-- Audit logs policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        (workspace_id IS NOT NULL AND workspace_id IN (
            SELECT workspace_id FROM public.workspace_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
        ))
        OR public.get_platform_role(auth.uid()) = 'platform_admin'
    );
