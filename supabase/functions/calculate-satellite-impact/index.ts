import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { farmer_id, area_hectares, total_family, female_members, unmarried_girls, yearly_yield } = await req.json()

    if (!farmer_id || !area_hectares) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. Calculate W_social
    // Base weight = 1.0, +0.2 per female member, +0.3 per unmarried girl
    let w_social = 1.0 + (female_members * 0.2) + (unmarried_girls * 0.3)
    
    // Cap W_social to a maximum reasonable value, e.g., 3.0
    w_social = Math.min(w_social, 3.0)

    // 2. Fetch/Mock Satellite Data (W_regen)
    // TODO: Integrate Google Earth Engine API here to get NDVI/NDWI
    // Stubbing out the API call for now
    const w_regen = 0.8 // Mock value

    // 3. Define Gap_Factor
    // The gap factor is designed to recover the unrecognized 84% value.
    // If they receive 16%, the gap is 84%. The factor represents this gap multiplier.
    const gap_factor = 0.84

    // 4. Calculate final AIC
    // AIC = (Area * [W_social + W_regen]) + (Yield * Gap_Factor)
    const total_aic = (area_hectares * (w_social + w_regen)) + (yearly_yield * gap_factor)

    // 5. Save to impact_credits table
    const { data, error } = await supabaseClient
      .from('impact_credits')
      .insert({
        farmer_id,
        w_social,
        w_regen,
        gap_factor,
        total_aic
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
