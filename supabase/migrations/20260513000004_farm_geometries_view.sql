-- Create a view that returns farm geometries as GeoJSON
-- This makes it easy for the Edge Function to get clean JSON
CREATE OR REPLACE VIEW farm_geometries AS
SELECT 
    id,
    farmer_id,
    ST_AsGeoJSON(geom)::jsonb as geojson,
    area_hectares,
    created_at
FROM public.farms;

-- Grant access to the view
GRANT SELECT ON farm_geometries TO authenticated;
GRANT SELECT ON farm_geometries TO service_role;
