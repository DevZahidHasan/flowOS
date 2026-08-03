-- 1. ADD CUSTOMER ID TO APPOINTMENTS
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- 2. ADD CUSTOMER ID TO QUEUE TOKENS
ALTER TABLE public.queue_tokens ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- 3. FIX STAFF ID CONSTRAINT IN APPOINTMENTS
-- First drop the constraint referencing profiles(id)
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_staff_id_fkey;

-- Then re-add it referencing staff_profiles(id)
ALTER TABLE public.appointments ADD CONSTRAINT appointments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff_profiles(id) ON DELETE SET NULL;
