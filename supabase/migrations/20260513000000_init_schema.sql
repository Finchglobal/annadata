-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create farmers table
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    total_family INTEGER NOT NULL DEFAULT 0,
    female_members INTEGER NOT NULL DEFAULT 0,
    unmarried_girls INTEGER NOT NULL DEFAULT 0,
    yearly_yield NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create farms table for land polygons
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE NOT NULL,
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    area_hectares NUMERIC(10, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create impact_credits table
CREATE TABLE IF NOT EXISTS public.impact_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE NOT NULL,
    w_social NUMERIC(5, 2) NOT NULL,
    w_regen NUMERIC(5, 2) NOT NULL,
    gap_factor NUMERIC(5, 2) NOT NULL,
    total_aic NUMERIC(15, 2) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farmers
CREATE POLICY "Farmers can view their own data" ON public.farmers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert their own data" ON public.farmers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can update their own data" ON public.farmers
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for farms
CREATE POLICY "Farmers can view their own farm" ON public.farms
    FOR SELECT USING (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

CREATE POLICY "Farmers can insert their own farm" ON public.farms
    FOR INSERT WITH CHECK (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

-- RLS Policies for impact_credits
CREATE POLICY "Farmers can view their own credits" ON public.impact_credits
    FOR SELECT USING (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

CREATE POLICY "Farmers can insert their own credits" ON public.impact_credits
    FOR INSERT WITH CHECK (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );
