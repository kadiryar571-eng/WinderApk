const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * JWT doğrulama middleware.
 * Authorization: Bearer <supabase_access_token>
 * Doğrulanırsa req.user = { id, email, ... }
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/, "");
  if (!token) return res.status(401).json({ error: "Token gerekli" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Geçersiz token" });

  req.user = data.user;
  next();
}

module.exports = { requireAuth, supabase };
