-- 0. MIGRATE DEPRECATED MODULE KEYS
DELETE FROM public.workspace_modules m1
WHERE m1.module_key = 'reports'
  AND EXISTS (
    SELECT 1 FROM public.workspace_modules m2
    WHERE m2.workspace_id = m1.workspace_id
      AND m2.module_key = 'finance'
  );

UPDATE public.workspace_modules SET module_key = 'finance' WHERE module_key = 'reports';

-- 1. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL DEFAULT 'Other', -- Rent, Utilities, Salaries, Marketing, Supplies, Equipment, Software, Transportation, Taxes, Maintenance, Other
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'Cash', -- Cash, Card, Bank Transfer, Check, Other
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_period TEXT, -- Monthly, Weekly, Yearly
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_expenses_workspace ON public.expenses(workspace_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_deleted ON public.expenses(deleted_at) WHERE deleted_at IS NULL;

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
DROP POLICY IF EXISTS "Workspace members manage expenses" ON public.expenses;
CREATE POLICY "Workspace members manage expenses" ON public.expenses
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
