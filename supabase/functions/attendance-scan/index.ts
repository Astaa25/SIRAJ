// =====================================================================
// SUPABASE EDGE FUNCTION: attendance-scan
// Peran yang boleh memanggil: musyrif, guru, admin
// Tugas: Memverifikasi QR kartu santri, validasi waktu server, anti-duplikasi
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

    const { qrToken, sesiId } = await req.json();
    if (!qrToken || !sesiId) {
      return new Response(JSON.stringify({ error: "qrToken and sesiId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Parse token: SRJ1.<santri_id>.<card_version>.<kid>.<signature>
    const parts = qrToken.split(".");
    if (parts.length < 5 || parts[0] !== "SRJ1") {
      return new Response(JSON.stringify({ error: "Format QR tidak sah / bukan kartu resmi SIRAJ" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [_, santriId, tokenCardVersionStr] = parts;
    const tokenCardVersion = parseInt(tokenCardVersionStr, 10);

    // 2. Periksa santri & card_version terkini di database
    const { data: santri, error: santriErr } = await supabaseClient
      .from("santri")
      .select("id, full_name, card_version, is_active")
      .eq("id", santriId)
      .single();

    if (santriErr || !santri) {
      return new Response(JSON.stringify({ error: "Santri tidak ditemukan" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!santri.is_active) {
      return new Response(JSON.stringify({ error: "Status santri tidak aktif" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (santri.card_version !== tokenCardVersion) {
      return new Response(JSON.stringify({ error: "Kartu sudah dicabut / kedaluwarsa. Gunakan kartu versi terbaru." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Catat absensi dengan Waktu Server (Anti-Duplikasi dengan constraint unique)
    const serverNow = new Date();
    const todayDate = serverNow.toISOString().split("T")[0];

    const { data: attendance, error: attErr } = await supabaseClient
      .from("absensi")
      .insert({
        santri_id: santri.id,
        sesi_id: sesiId,
        tanggal: todayDate,
        waktu_aktual: serverNow.toISOString(),
        status: "hadir",
        recorded_by: user.id,
      })
      .select()
      .single();

    if (attErr) {
      // 23505 adalah kode PostgreSQL unique_violation
      if (attErr.code === "23505") {
        return new Response(
          JSON.stringify({
            status: "DUPLICATE",
            message: `Peringatan: ${santri.full_name} sudah tercatat hadir pada sesi ini!`,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw attErr;
    }

    // 4. Catat Audit Log
    await supabaseClient.from("audit_log").insert({
      actor_id: user.id,
      actor_role: "musyrif",
      action: "ABSENSI QR SUKSES",
      target_table: "absensi",
      target_id: attendance.id,
      details: { santri: santri.full_name, sesi_id: sesiId, waktu: serverNow.toISOString() },
    });

    return new Response(
      JSON.stringify({
        status: "SUCCESS",
        message: `${santri.full_name} berhasil dicatat HADIR.`,
        data: attendance,
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
