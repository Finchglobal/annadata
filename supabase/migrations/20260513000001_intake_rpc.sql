-- Migration to add RPC for farmer intake

CREATE OR REPLACE FUNCTION handle_farmer_intake(
    p_total_family INT,
    p_female_members INT,
    p_unmarried_girls INT,
    p_yearly_yield NUMERIC,
    p_area_hectares NUMERIC,
    p_geojson JSONB
) RETURNS UUID AS $$
DECLARE
    v_farmer_id UUID;
BEGIN
    -- Check if farmer exists for this user
    SELECT id INTO v_farmer_id FROM public.farmers WHERE user_id = auth.uid() LIMIT 1;

    IF v_farmer_id IS NULL THEN
        -- Insert new farmer
        INSERT INTO public.farmers (user_id, total_family, female_members, unmarried_girls, yearly_yield)
        VALUES (auth.uid(), p_total_family, p_female_members, p_unmarried_girls, p_yearly_yield)
        RETURNING id INTO v_farmer_id;
    ELSE
        -- Update existing farmer
        UPDATE public.farmers 
        SET total_family = p_total_family,
            female_members = p_female_members,
            unmarried_girls = p_unmarried_girls,
            yearly_yield = p_yearly_yield
        WHERE id = v_farmer_id;
    END IF;

    -- Delete old farms to keep it simple for MVP
    DELETE FROM public.farms WHERE farmer_id = v_farmer_id;

    -- Insert new farm polygon
    -- Assuming p_geojson represents the geometry object of the feature
    INSERT INTO public.farms (farmer_id, area_hectares, geom)
    VALUES (
        v_farmer_id, 
        p_area_hectares, 
        ST_SetSRID(ST_GeomFromGeoJSON(p_geojson), 4326)
    );

    RETURN v_farmer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
