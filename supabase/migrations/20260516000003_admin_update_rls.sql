-- Allow Admins to update farmers
CREATE POLICY "Admins can update all farmers" ON public.farmers
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
