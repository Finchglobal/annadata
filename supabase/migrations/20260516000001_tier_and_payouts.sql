-- 1. Add current_tier and female_member_count to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_tier INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS female_member_count INTEGER DEFAULT 0;

-- 2. Create payout_status ENUM
DO $$ BEGIN
    CREATE TYPE payout_status AS ENUM ('PROJECTION', 'INTENT_LOCKED', 'SATELLITE_VERIFIED', 'PAID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create payouts table
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    status payout_status NOT NULL DEFAULT 'PROJECTION',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view their own payouts" ON public.payouts
    FOR SELECT USING (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage payouts" ON public.payouts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Ward members can view payouts in their ward" ON public.payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.farmers f
            JOIN public.ward_members wm ON wm.ward_number = f.district
            WHERE f.id = payouts.farmer_id
            AND wm.user_id = auth.uid()
        )
    );
