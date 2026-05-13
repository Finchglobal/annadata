-- Ward Members Table
CREATE TABLE IF NOT EXISTS public.ward_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    full_name TEXT NOT NULL,
    ward_number TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Farmer Verifications Table
CREATE TABLE IF NOT EXISTS public.farmer_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE NOT NULL,
    ward_member_id UUID REFERENCES public.ward_members(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add verification status to farmers table
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS village TEXT;
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS district TEXT;

-- Enable RLS
ALTER TABLE public.ward_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_verifications ENABLE ROW LEVEL SECURITY;

-- Ward Member Policies
CREATE POLICY "Ward members can view their own profile" ON public.ward_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Ward members can insert their own profile" ON public.ward_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verification Policies: Ward members can read all verifications for their area
CREATE POLICY "Ward members can view verifications" ON public.farmer_verifications
    FOR SELECT USING (
        ward_member_id IN (SELECT id FROM public.ward_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Ward members can update verifications" ON public.farmer_verifications
    FOR UPDATE USING (
        ward_member_id IN (SELECT id FROM public.ward_members WHERE user_id = auth.uid())
    );

-- Allow farmers to see their own verification status
CREATE POLICY "Farmers can view their verification" ON public.farmer_verifications
    FOR SELECT USING (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

-- Service role can insert verifications (triggered when a farmer submits intake)
CREATE POLICY "Service role can insert verifications" ON public.farmer_verifications
    FOR INSERT WITH CHECK (true);
