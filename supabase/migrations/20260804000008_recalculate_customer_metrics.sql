-- ================================================================
-- SQL Migration: Recalculate Customer Metrics
-- FlowOS — Automatically sync total_visits and lifetime_spending
-- ================================================================

-- 1. Function: Recalculate Customer Lifetime Spending from Payments
CREATE OR REPLACE FUNCTION public.update_customer_lifetime_spending()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_workspace_id UUID;
    v_total NUMERIC(10,2);
BEGIN
    -- Resolve customer_id and workspace_id from the related invoice
    IF TG_OP = 'DELETE' THEN
        SELECT customer_id, workspace_id INTO v_customer_id, v_workspace_id
        FROM public.invoices WHERE id = OLD.invoice_id;
    ELSE
        SELECT customer_id, workspace_id INTO v_customer_id, v_workspace_id
        FROM public.invoices WHERE id = NEW.invoice_id;
    END IF;

    IF v_customer_id IS NOT NULL THEN
        -- Sum all non-deleted payments for this customer's active invoices
        SELECT COALESCE(SUM(amount), 0.00) INTO v_total
        FROM public.payments p
        JOIN public.invoices i ON p.invoice_id = i.id
        WHERE i.customer_id = v_customer_id
          AND p.deleted_at IS NULL
          AND i.deleted_at IS NULL;

        -- Update customer record
        UPDATE public.customers
        SET lifetime_spending = v_total,
            updated_at = NOW()
        WHERE id = v_customer_id AND workspace_id = v_workspace_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for spending update on payments insert/update/delete
DROP TRIGGER IF EXISTS trigger_update_customer_spending ON public.payments;
CREATE TRIGGER trigger_update_customer_spending
    AFTER INSERT OR UPDATE OR DELETE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_customer_lifetime_spending();


-- 2. Function: Recalculate Customer Total Visits (Completed Appointments)
CREATE OR REPLACE FUNCTION public.update_customer_visits()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_workspace_id UUID;
    v_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_customer_id := OLD.customer_id;
        v_workspace_id := OLD.workspace_id;
    ELSE
        v_customer_id := NEW.customer_id;
        v_workspace_id := NEW.workspace_id;
    END IF;

    IF v_customer_id IS NOT NULL THEN
        -- Count completed appointments
        SELECT COUNT(*) INTO v_count
        FROM public.appointments
        WHERE customer_id = v_customer_id
          AND status = 'COMPLETED';

        -- Update customer record
        UPDATE public.customers
        SET total_visits = v_count,
            updated_at = NOW()
        WHERE id = v_customer_id AND workspace_id = v_workspace_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for visits update on appointments insert/update/delete
DROP TRIGGER IF EXISTS trigger_update_customer_visits ON public.appointments;
CREATE TRIGGER trigger_update_customer_visits
    AFTER INSERT OR UPDATE OR DELETE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_customer_visits();


-- 3. One-time recalculation of existing customer metrics
UPDATE public.customers c
SET 
  lifetime_spending = COALESCE(
    (
      SELECT SUM(p.amount) 
      FROM public.payments p
      JOIN public.invoices i ON p.invoice_id = i.id
      WHERE i.customer_id = c.id
        AND p.deleted_at IS NULL
        AND i.deleted_at IS NULL
    ), 
    0.00
  ),
  total_visits = COALESCE(
    (
      SELECT COUNT(*) 
      FROM public.appointments a
      WHERE a.customer_id = c.id
        AND a.status = 'COMPLETED'
    ),
    0
  ),
  updated_at = NOW();
