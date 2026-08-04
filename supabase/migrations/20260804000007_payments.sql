-- ================================================================
-- Phase 6: Manual Payment Recording
-- FlowOS — Enterprise Invoices & Billing Module
-- ================================================================

-- Payment Method ENUM
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'CASH',
        'CARD',
        'BANK_TRANSFER',
        'MOBILE_BANKING',
        'CHEQUE',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id      UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    invoice_id        UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method    payment_method NOT NULL DEFAULT 'CASH',
    reference_number  TEXT,
    notes             TEXT,
    payment_date      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    received_by       TEXT,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_workspace      ON public.payments(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_invoice        ON public.payments(invoice_id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_payment_date   ON public.payments(payment_date) WHERE deleted_at IS NULL;

-- Auto-updated_at trigger
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS: workspace members can view active payments for their invoices
CREATE POLICY "Workspace members view payments" ON public.payments
    FOR SELECT USING (
        deleted_at IS NULL AND
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

-- RLS: workspace members can manage payments for their invoices
CREATE POLICY "Workspace members manage payments" ON public.payments
    FOR ALL USING (
        deleted_at IS NULL AND
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );
