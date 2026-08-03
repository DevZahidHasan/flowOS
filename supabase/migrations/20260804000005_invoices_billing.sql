-- 1. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNPAID', -- DRAFT, UNPAID, PAID, VOID
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. INVOICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_invoices_workspace ON public.invoices(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR INVOICES
CREATE POLICY "Workspace members view invoices" ON public.invoices
    FOR SELECT USING (
        workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Workspace members manage invoices" ON public.invoices
    FOR ALL USING (
        workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    );

-- RLS POLICIES FOR INVOICE ITEMS
CREATE POLICY "Workspace members view invoice_items" ON public.invoice_items
    FOR SELECT USING (
        invoice_id IN (SELECT id FROM public.invoices WHERE workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()))
    );

CREATE POLICY "Workspace members manage invoice_items" ON public.invoice_items
    FOR ALL USING (
        invoice_id IN (SELECT id FROM public.invoices WHERE workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()))
    );
