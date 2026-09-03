import { createClient } from "@supabase/supabase-js";
import { createVerdentAuth } from "@verdent/auth-js";

// 优先使用 Verdent 发布时注入的环境变量；本地预览回退到直接 Supabase URL + publishable key
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://supabase-api-prod.verdent.ai/p/p6536aba27bd9649715e8";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMDk5NDQ1MDI1LCJpYXQiOjE3ODM4MjU4MjUsImlzcyI6InN1cGFiYXNlIiwicHJvamVjdF9yZWYiOiJwNjUzNmFiYTI3YmQ5NjQ5NzE1ZTgiLCJyb2xlIjoiYW5vbiJ9.CXP2t9o4RrfERrvmbmTBstiR9C0eCcecMfBqbQbo7Ec";
const VERDENT_OAUTH_URL = import.meta.env.VITE_VERDENT_OAUTH_INITIATE_URL;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const auth = VERDENT_OAUTH_URL
  ? createVerdentAuth({ supabase, oauth: { authorizeUrl: VERDENT_OAUTH_URL } })
  : createVerdentAuth({ supabase });

// 保持旧代码兼容：window._supabase 仍可访问
if (typeof window !== "undefined") {
  window._supabase = supabase;
}
