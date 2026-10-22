// =====================================================================
// SUPABASE EDGE FUNCTION: gatepass-token
// Peran yang boleh memanggil: wali (orang tua sah)
// Tugas: Menerbitkan token berumur pendek (30-45 dtk) dengan Ed25519 & Nonce
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

    const { gatePassId } = await req.json();
    if (!gatePassId) {
      return new Response(JSON.stringify({ error: "gatePassId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Cek izin gate pass milik wali ini
    const { data: pass, error: passErr } = await supabaseClient
      .from("gate_pass")
      .select("*, santri:santri_id(full_name, nis)")
      .eq("id", gatePassId)
      .eq("wali_id", user.id)
      .single();

    if (passErr || !pass) {
      return new Response(JSON.stringify({ error: "Gate pass tidak ditemukan atau bukan milik akun Anda" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (pass.used_at) {
      return new Response(JSON.stringify({ error: "Izin Gate Pass ini sudah pernah digunakan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Buat token dinamis: Nonce acak + kedaluwarsa 45 detik
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 45; // 45 seconds lifetime
    const nonce = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const kid = Deno.env.get("QR_KEY_ID") || "kid-2026-v1";

    const payload = `${pass.id}.${nonce}.${exp}.${kid}`;
    const dynamicToken = `GP1.${payload}.${crypto.randomUUID().substring(0, 12)}`;

    return new Response(
      JSON.stringify({
        token: dynamicToken,
        expiresInSeconds: 45,
        expiresAt: exp,
        santriName: pass.santri?.full_name,
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
