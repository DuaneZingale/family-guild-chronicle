import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const mode = body.mode || "invite";
    const { email, familyId, role, familyName, inviterName, inviteCode } = body;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is a parent in this family
    const { data: membership } = await adminClient
      .from("memberships")
      .select("role")
      .eq("family_id", familyId)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["parent", "co-parent"].includes(membership.role)) {
      return new Response(JSON.stringify({ error: "Only parents can perform this action" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── MODE: resend ──
    if (mode === "resend") {
      if (!inviteCode || !familyId) {
        return new Response(JSON.stringify({ error: "Missing inviteCode or familyId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Look up the invite
      const { data: invite } = await adminClient
        .from("family_invites")
        .select("email, role")
        .eq("invite_code", inviteCode)
        .eq("family_id", familyId)
        .single();

      if (!invite || !invite.email) {
        return new Response(JSON.stringify({ error: "Invite not found or has no email" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const appUrl = "https://hearth-and-home-quests.lovable.app";
      const joinUrl = `${appUrl}/join?code=${inviteCode}`;

      await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({ type: "magiclink", email: invite.email, options: { redirectTo: joinUrl } }),
      });

      return new Response(
        JSON.stringify({ success: true, message: `Invite resent to ${invite.email}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── MODE: magic-link ──
    if (mode === "magic-link") {
      if (!email || !familyId) {
        return new Response(JSON.stringify({ error: "Missing email or familyId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const appUrl = "https://hearth-and-home-quests.lovable.app";
      await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({ type: "magiclink", email, options: { redirectTo: appUrl } }),
      });

      return new Response(
        JSON.stringify({ success: true, message: `Magic link sent to ${email}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── MODE: reset-password ──
    if (mode === "reset-password") {
      if (!email || !familyId) {
        return new Response(JSON.stringify({ error: "Missing email or familyId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const appUrl = "https://hearth-and-home-quests.lovable.app";
      const resetRes = await fetch(`${supabaseUrl}/auth/v1/recover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({ email, redirect_to: `${appUrl}/reset-password` }),
      });

      if (!resetRes.ok) {
        const errText = await resetRes.text();
        console.error("Password reset failed:", errText);
      }

      return new Response(
        JSON.stringify({ success: true, message: `Password reset email sent to ${email}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── MODE: invite (default) ──
    if (!email || !familyId || !role) {
      return new Response(JSON.stringify({ error: "Missing email, familyId, or role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate invite code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const { error: invErr } = await adminClient.from("family_invites").insert({
      family_id: familyId,
      invite_code: code,
      role,
      email,
    });

    if (invErr) {
      return new Response(JSON.stringify({ error: "Failed to create invite: " + invErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appUrl = "https://hearth-and-home-quests.lovable.app";
    const joinUrl = `${appUrl}/join?code=${code}`;

    const displayName = inviterName || "Someone";
    const guildName = familyName || "a Family Guild";

    await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({ type: "magiclink", email, options: { redirectTo: joinUrl } }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        inviteCode: code,
        joinUrl,
        message: `Invite sent to ${email}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in send-invite-email:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
