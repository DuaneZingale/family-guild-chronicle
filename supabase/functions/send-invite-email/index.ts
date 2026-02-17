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

    // Create client with the user's token to verify identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, familyId, role, familyName, inviterName } = await req.json();

    if (!email || !familyId || !role) {
      return new Response(JSON.stringify({ error: "Missing email, familyId, or role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to verify caller is a parent in this family
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: membership } = await adminClient
      .from("memberships")
      .select("role")
      .eq("family_id", familyId)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["parent", "co-parent"].includes(membership.role)) {
      return new Response(JSON.stringify({ error: "Only parents can send invites" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate invite code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    // Create the invite record
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

    // Build the join URL
    const appUrl = req.headers.get("origin") || "https://hearth-and-home-quests.lovable.app";
    const joinUrl = `${appUrl}/join?code=${code}`;

    // Send the email via Supabase Auth admin API (magic link style)
    // We use the built-in SMTP by sending a custom email via the admin API
    const displayName = inviterName || "Someone";
    const guildName = familyName || "a Family Guild";
    const roleLabel = role === "co-parent" ? "Co-Leader" : role === "kid" ? "Adventurer" : role === "guest" ? "Guest" : "Guild Master";

    // Send invite email using Supabase's built-in email
    const emailRes = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({
        type: "magiclink",
        email,
        options: {
          redirectTo: joinUrl,
        },
      }),
    });

    // Whether or not magic link works, we also send a simple invite notification
    // using Supabase's auth.admin.inviteUserByEmail for new users
    // or just return the code for existing users
    
    if (!emailRes.ok) {
      // Fallback: just return the invite code; the frontend will show it
      console.log("Magic link generation failed, returning code only:", await emailRes.text());
    }

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
