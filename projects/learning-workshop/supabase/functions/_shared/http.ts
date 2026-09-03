const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.escapefromhongye.xyz",
  "http://localhost:4173",
  "http://localhost:5173",
  "http://localhost:8420",
];

function allowedOrigins() {
  const configured = (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
}

export function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = allowedOrigins();
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function jsonResponse(
  req: Request,
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

export async function authenticateRequest(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, authorization },
    });
    if (!response.ok) return null;
    const user = await response.json();
    return user?.id ? user : null;
  } catch (error) {
    console.error("Auth verification failed", error);
    return null;
  }
}
