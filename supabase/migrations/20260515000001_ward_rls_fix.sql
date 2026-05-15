-- Update RLS for farmers table to allow Ward Members to view them
CREATE POLICY "Ward members can view farmers in their ward" ON public.farmers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ward_members 
            WHERE user_id = auth.uid() 
            AND ward_number = farmers.district
        )
    );

-- Update RLS for farms table to allow Ward Members to view them
CREATE POLICY "Ward members can view farms in their ward" ON public.farms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.farmers f
            JOIN public.ward_members wm ON wm.ward_number = f.district
            WHERE f.id = farms.farmer_id
            AND wm.user_id = auth.uid()
        )
    );

-- Ensure farmer_verifications can be seen by ward members
-- (Already handled by 20260513000002_ward_validation.sql but verifying)
DROP POLICY IF EXISTS "Ward members can view verifications" ON public.farmer_verifications;
CREATE POLICY "Ward members can view verifications" ON public.farmer_verifications
    FOR SELECT USING (
        ward_member_id IN (SELECT id FROM public.ward_members WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Ward members can update verifications" ON public.farmer_verifications;
CREATE POLICY "Ward members can update verifications" ON public.farmer_verifications
    FOR ALL USING (
        ward_member_id IN (SELECT id FROM public.ward_members WHERE user_id = auth.uid())
    );
