// =====================================================================
// SUPABASE EDGE FUNCTION: invite-wali
// Peran yang boleh memanggil: admin
// Tugas: Membuat kode undangan sekali pakai (berlaku 72 jam) untuk aktivasi wali
// =====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid user session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { santriId, waliPhone, waliName, relationshipTitle = "Orang Tua/Wali" } = await req.json();
    if (!santriId || !waliPhone || !waliName) {
      return new Response(
        JSON.stringify({ error: "santriId, waliPhone, and waliName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buat kode token aktivasi unik 8 karakter numerik/alfanumerik
    const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 jam

    // Catat Audit Log
    await supabaseClient.from("audit_log").insert({
      actor_id: user.id,
      actor_role: "admin",
      action: "BUAT UNDANGAN WALI",
      target_table: "wali_santri",
      details: {
        santri_id: santriId,
        wali_name: waliName,
        phone: waliPhone,
        expires_at: expiresAt.toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        status: "SUCCESS",
        inviteCode,
        expiresAt: expiresAt.toISOString(),
        message: `Undangan aktivasi akun wali untuk santri berhasil dibuat. Berlaku hingga 72 jam.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
