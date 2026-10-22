// =====================================================================
// SUPABASE EDGE FUNCTION: sp-issue
// Peran yang boleh memanggil: system (cron / trigger), admin
// Tugas: Mengevaluasi ambang pelanggaran, menerbitkan SP, mengunci hak
// Sesuai SKILLS.md Seksi 8: Logika berjalan di server (pg_cron), idempoten
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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { santriId } = await req.json();
    if (!santriId) {
      return new Response(JSON.stringify({ error: "santriId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Hitung total poin pelanggaran santri
    const { data: points, error: ptErr } = await supabaseAdmin
      .from("catatan_poin")
      .select("points")
      .eq("santri_id", santriId)
      .lt("points", 0); // Poin minus

    if (ptErr) throw ptErr;

    const totalViolationPoints = Math.abs(
      points?.reduce((acc: number, curr: any) => acc + curr.points, 0) || 0
    );

    // 2. Ambil konfigurasi ambang SP
    const { data: configs, error: cfgErr } = await supabaseAdmin
      .from("konfigurasi_sp")
      .select("*")
      .order("points_threshold", { ascending: true });

    if (cfgErr) throw cfgErr;

    let issuedTier = null;
    let requiredApproval = false;

    // Evaluasi ambang
    for (const cfg of configs || []) {
      if (totalViolationPoints >= cfg.points_threshold) {
        issuedTier = cfg.tier;
        requiredApproval = cfg.requires_admin_approval;
      }
    }

    if (!issuedTier) {
      return new Response(
        JSON.stringify({
          status: "SAFE",
          message: `Poin pelanggaran (${totalViolationPoints}) masih di bawah ambang SP.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Pastikan Idempoten: Cek apakah SP tingkat ini sudah pernah terbit untuk santri ini
    const { data: existingSp } = await supabaseAdmin
      .from("surat_peringatan")
      .select("id, letter_number")
      .eq("santri_id", santriId)
      .eq("tier", issuedTier)
      .maybeSingle();

    if (existingSp) {
      return new Response(
        JSON.stringify({
          status: "ALREADY_ISSUED",
          message: `Surat peringatan tingkat ${issuedTier} sudah pernah diterbitkan sebelumnya (${existingSp.letter_number}).`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Terbitkan draf SP resmi
    const letterNumber = `SP.${issuedTier.toUpperCase()}/PP-DR/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: newSp, error: spErr } = await supabaseAdmin
      .from("surat_peringatan")
      .insert({
        santri_id: santriId,
        tier: issuedTier,
        letter_number: letterNumber,
        is_approved: !requiredApproval,
      })
      .select()
      .single();

    if (spErr) throw spErr;

    // 5. Catat ke Audit Log
    await supabaseAdmin.from("audit_log").insert({
      actor_role: "system",
      action: "PENERBITAN DRAF SP",
      target_table: "surat_peringatan",
      target_id: newSp.id,
      details: {
        santri_id: santriId,
        tier: issuedTier,
        total_points: totalViolationPoints,
        letter_number: letterNumber,
        requires_approval: requiredApproval,
      },
    });

    return new Response(
      JSON.stringify({
        status: "ISSUED",
        message: `Draf ${letterNumber} berhasil diterbitkan di server.`,
        sp: newSp,
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
