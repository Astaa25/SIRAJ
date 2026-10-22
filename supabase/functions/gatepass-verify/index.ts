// =====================================================================
// SUPABASE EDGE FUNCTION: gatepass-verify
// Peran yang boleh memanggil: satpam, admin
// Tugas: Memverifikasi token penjemputan dan menandai terpakai secara atomik
// Sesuai SECURITY.md Seksi 6: Single-use atomic update
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

    const { dynamicToken } = await req.json();
    if (!dynamicToken) {
      return new Response(JSON.stringify({ error: "dynamicToken is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Parse token: GP1.<gate_pass_id>.<nonce>.<exp>.<kid>.<signature>
    const parts = dynamicToken.split(".");
    if (parts.length < 5 || parts[0] !== "GP1") {
      return new Response(JSON.stringify({ error: "Format QR Gate Pass tidak valid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [_, gatePassId, nonce, expStr] = parts;
    const exp = parseInt(expStr, 10);
    const now = Math.floor(Date.now() / 1000);

    if (now > exp) {
      return new Response(JSON.stringify({ error: "QR Token sudah KEDALUWARSA (Tangkapan layar usang ditolak)" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. ATOMIC UPDATE (Pembaruan atomik sekali pakai)
    // update gate_pass set used_at = now() where id = $1 and used_at is null returning *
    const { data: updatedPass, error: updateErr } = await supabaseClient
      .from("gate_pass")
      .update({
        used_at: new Date().toISOString(),
        verified_by_guard_id: user.id,
        status: "selesai",
      })
      .eq("id", gatePassId)
      .is("used_at", null)
      .select("*, santri:santri_id(id, full_name, nis, photo_url, class_name, dorm_name)")
      .single();

    if (updateErr || !updatedPass) {
      // Catat percobaan pemakaian ulang ke Audit Log
      await supabaseClient.from("audit_log").insert({
        actor_id: user.id,
        actor_role: "satpam",
        action: "GATE PASS DITOLAK (REUSE ATTEMPT)",
        target_table: "gate_pass",
        target_id: gatePassId,
        details: { reason: "Pass sudah pernah digunakan sebelumnya" },
      });

      return new Response(
        JSON.stringify({
          status: "REJECTED",
          message: "DITOLAK: QR Gate Pass ini sudah pernah dipakai atau tidak sah!",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Catat Audit Log Berhasil
    await supabaseClient.from("audit_log").insert({
      actor_id: user.id,
      actor_role: "satpam",
      action: "GATE PASS TERVERIFIKASI SAH",
      target_table: "gate_pass",
      target_id: gatePassId,
      details: {
        santri: updatedPass.santri?.full_name,
        penjemput: updatedPass.authorized_picker_name,
      },
    });

    return new Response(
      JSON.stringify({
        status: "APPROVED",
        message: "SAH: Penjemputan diizinkan keluar gerbang.",
        santri: updatedPass.santri,
        pickerName: updatedPass.authorized_picker_name,
        pickerNik: updatedPass.picker_nik,
        clearedAt: updatedPass.used_at,
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
