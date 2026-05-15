-- Promote hello@philanthroforge.com to Super Admin
-- This script searches for the user by email and updates their role in the profiles table

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Find the user ID from auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'hello@philanthroforge.com';

    IF v_user_id IS NOT NULL THEN
        -- Ensure profile exists (it should be created by trigger, but being safe)
        INSERT INTO public.profiles (id, role, full_name)
        VALUES (v_user_id, 'admin', 'Super Admin')
        ON CONFLICT (id) DO UPDATE SET role = 'admin';
        
        RAISE NOTICE 'User hello@philanthroforge.com has been promoted to Super Admin.';
    ELSE
        RAISE NOTICE 'User hello@philanthroforge.com not found. Please ensure they have signed up first.';
    END IF;
END $$;
