-- Update handle_farmer_intake to include new fields and create verification record
CREATE OR REPLACE FUNCTION handle_farmer_intake(
    p_full_name TEXT,
    p_village TEXT,
    p_district TEXT,
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
        INSERT INTO public.farmers (
            user_id, full_name, village, district, 
            total_family, female_members, unmarried_girls, yearly_yield
        )
        VALUES (
            auth.uid(), p_full_name, p_village, p_district, 
            p_total_family, p_female_members, p_unmarried_girls, p_yearly_yield
        )
        RETURNING id INTO v_farmer_id;
    ELSE
        -- Update existing farmer
        UPDATE public.farmers 
        SET full_name = p_full_name,
            village = p_village,
            district = p_district,
            total_family = p_total_family,
            female_members = p_female_members,
            unmarried_girls = p_unmarried_girls,
            yearly_yield = p_yearly_yield
        WHERE id = v_farmer_id;
    END IF;

    -- Delete old farms to keep it simple for MVP
    DELETE FROM public.farms WHERE farmer_id = v_farmer_id;

    -- Insert new farm polygon
    INSERT INTO public.farms (farmer_id, area_hectares, geom)
    VALUES (
        v_farmer_id, 
        p_area_hectares, 
        ST_SetSRID(ST_GeomFromGeoJSON(p_geojson), 4326)
    );

    -- Ensure a verification record exists
    INSERT INTO public.farmer_verifications (farmer_id, ward_member_id, status)
    SELECT v_farmer_id, id, 'pending'
    FROM public.ward_members
    WHERE ward_number = p_district -- Using district as ward_number for MVP mapping
    ON CONFLICT DO NOTHING;

    RETURN v_farmer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
