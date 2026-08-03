-- 1. Create a function to check membership without triggering RLS recursively
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
    AND user_id = auth.uid()
  );
$$;

-- 2. Create a function to check role without triggering RLS recursively
CREATE OR REPLACE FUNCTION public.get_workspace_role(ws_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM workspace_members
  WHERE workspace_id = ws_id
  AND user_id = auth.uid()
  LIMIT 1;
$$;

-- 3. Fix workspace_members policy to avoid infinite recursion
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
CREATE POLICY "Members can view workspace members" ON public.workspace_members
    FOR SELECT USING (public.is_workspace_member(workspace_id));

-- 4. Add missing INSERT policies so users can create workspaces
CREATE POLICY "Authenticated users can create workspaces" ON public.workspaces
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can add themselves to workspaces" ON public.workspace_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can insert workspace modules" ON public.workspace_modules
    FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

-- 5. Add missing UPDATE policies for workspaces and modules
CREATE POLICY "Owners and Admins can update workspaces" ON public.workspaces
    FOR UPDATE USING (public.get_workspace_role(id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owners and Admins can update modules" ON public.workspace_modules
    FOR UPDATE USING (public.get_workspace_role(workspace_id) IN ('OWNER', 'ADMIN'));
