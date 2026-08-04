-- ================================================================
-- SQL Migration: Auto-log Timeline Events
-- FlowOS — Log appointments & invoice payments to customer_timeline
-- ================================================================

-- 1. Trigger Function: Log Appointment Events (Booked & Completed)
CREATE OR REPLACE FUNCTION public.log_appointment_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Log BOOKED event on initial INSERT (if scheduled)
    IF TG_OP = 'INSERT' AND NEW.status = 'SCHEDULED' AND NEW.customer_id IS NOT NULL THEN
        INSERT INTO public.customer_timeline (
            workspace_id,
            customer_id,
            event_type,
            title,
            description,
            metadata,
            created_at
        ) VALUES (
            NEW.workspace_id,
            NEW.customer_id,
            'APPOINTMENT_BOOKED',
            'Appointment Booked',
            'Booked ' || NEW.service_name || ' with ' || NEW.staff_name,
            jsonb_build_object(
                'appointment_id', NEW.id,
                'service_id', NEW.service_id,
                'service_name', NEW.service_name,
                'staff_name', NEW.staff_name
            ),
            NEW.created_at
        );
    END IF;

    -- Log COMPLETED event on UPDATE to COMPLETED status
    IF TG_OP = 'UPDATE' AND NEW.status = 'COMPLETED' AND OLD.status <> 'COMPLETED' AND NEW.customer_id IS NOT NULL THEN
        INSERT INTO public.customer_timeline (
            workspace_id,
            customer_id,
            event_type,
            title,
            description,
            metadata,
            created_at
        ) VALUES (
            NEW.workspace_id,
            NEW.customer_id,
            'APPOINTMENT_COMPLETED',
            'Appointment Completed',
            'Completed appointment for ' || NEW.service_name,
            jsonb_build_object(
                'appointment_id', NEW.id,
                'service_name', NEW.service_name,
                'staff_name', NEW.staff_name
            ),
            NEW.updated_at
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger on Appointments Table
DROP TRIGGER IF EXISTS trigger_log_appointment_timeline ON public.appointments;
CREATE TRIGGER trigger_log_appointment_timeline
    AFTER INSERT OR UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.log_appointment_timeline_event();


-- 2. Trigger Function: Log Invoice Paid Events
CREATE OR REPLACE FUNCTION public.log_invoice_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Log INVOICE_PAID event when status switches to PAID
    IF TG_OP = 'UPDATE' AND NEW.status = 'PAID' AND OLD.status <> 'PAID' AND NEW.customer_id IS NOT NULL THEN
        INSERT INTO public.customer_timeline (
            workspace_id,
            customer_id,
            event_type,
            title,
            description,
            metadata,
            created_at
        ) VALUES (
            NEW.workspace_id,
            NEW.customer_id,
            'INVOICE_PAID',
            'Invoice Paid in Full',
            'Paid invoice ' || NEW.invoice_number || ' for $' || NEW.total_amount,
            jsonb_build_object(
                'invoice_id', NEW.id,
                'invoice_number', NEW.invoice_number,
                'total_amount', NEW.total_amount
            ),
            NEW.updated_at
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger on Invoices Table
DROP TRIGGER IF EXISTS trigger_log_invoice_timeline ON public.invoices;
CREATE TRIGGER trigger_log_invoice_timeline
    AFTER UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.log_invoice_timeline_event();


-- 3. One-time populating of timeline events for existing completed appointments and paid invoices
-- Insert existing completed appointments
INSERT INTO public.customer_timeline (workspace_id, customer_id, event_type, title, description, metadata, created_at)
SELECT 
  workspace_id, 
  customer_id, 
  'APPOINTMENT_COMPLETED', 
  'Appointment Completed', 
  'Completed appointment for ' || service_name, 
  jsonb_build_object('appointment_id', id, 'service_name', service_name, 'staff_name', staff_name),
  updated_at
FROM public.appointments
WHERE status = 'COMPLETED' 
  AND customer_id IS NOT NULL
  AND id NOT IN (
    SELECT (metadata->>'appointment_id')::UUID 
    FROM public.customer_timeline 
    WHERE event_type = 'APPOINTMENT_COMPLETED' 
      AND metadata->>'appointment_id' IS NOT NULL
  );

-- Insert existing paid invoices
INSERT INTO public.customer_timeline (workspace_id, customer_id, event_type, title, description, metadata, created_at)
SELECT 
  workspace_id, 
  customer_id, 
  'INVOICE_PAID', 
  'Invoice Paid in Full', 
  'Paid invoice ' || invoice_number || ' for $' || total_amount, 
  jsonb_build_object('invoice_id', id, 'invoice_number', invoice_number, 'total_amount', total_amount),
  updated_at
FROM public.invoices
WHERE status = 'PAID' 
  AND customer_id IS NOT NULL
  AND id NOT IN (
    SELECT (metadata->>'invoice_id')::UUID 
    FROM public.customer_timeline 
    WHERE event_type = 'INVOICE_PAID' 
      AND metadata->>'invoice_id' IS NOT NULL
  );
