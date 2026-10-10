// ================= SUPABASE CONFIGURATION =================
//
// This file runs in the BROWSER, so it may only contain PUBLIC values:
//   1. Your Supabase Project URL
//   2. Your Supabase "publishable" key (older projects call it the "anon" key)
//
// Find both in: Supabase Dashboard > Project Settings > API (or "API Keys").
//
// NEVER put these here:  service_role / secret key, database password,
// JWT secret. Those would give everyone full access to your database.
//
// Your data is protected by Row Level Security (see supabase-schema.sql),
// not by hiding this key.

const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "YOUR-PUBLISHABLE-KEY";

// True only after you have replaced the two placeholder values above.
const SUPABASE_IS_CONFIGURED =
    !SUPABASE_URL.includes("YOUR-PROJECT-REF") &&
    !SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR-");

// "window.supabase" is the library loaded from the CDN in index.html.
// We store our own client in "supabaseClient" so the names do not clash.
const supabaseClient =
    SUPABASE_IS_CONFIGURED && window.supabase
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
              auth: {
                  persistSession: true,      // keep the user logged in after reload
                  autoRefreshToken: true,    // renew the session automatically
                  detectSessionInUrl: true   // handles the email-confirmation link
              }
          })
        : null;

if (!supabaseClient) {
    console.warn(
        "Supabase is not configured. Open supabase.js and add your Project URL and publishable key."
    );
}
