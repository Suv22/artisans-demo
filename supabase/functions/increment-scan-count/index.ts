// File: supabase/functions/increment-scan-count/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // This is required to handle browser requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the artisan_id from the request
    const { artisan_id } = await req.json();
    if (!artisan_id) throw new Error("Artisan ID is required.");

    // Create a Supabase admin client to safely update the database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call the database function 'increment_scan' to update the count
    const { error } = await supabaseAdmin.rpc('increment_scan', { artisanid: artisan_id });

    if (error) throw error;

    return new Response(JSON.stringify({ message: `Scan counted for ${artisan_id}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});