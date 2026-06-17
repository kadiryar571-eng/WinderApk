const router = require("express").Router();
const { supabase } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password, full_name, role_label, location, lat, lng } = req.body;

  if (!email || !password || !full_name)
    return res.status(400).json({ error: "Email, şifre ve isim zorunlu" });

  // Supabase Auth kaydı
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return res.status(400).json({ error: authError.message });

  const userId = authData.user.id;
  const nameParts = full_name.trim().split(" ");
  const initials = nameParts.map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  const short = nameParts[0];

  // Profil oluştur
  const { error: profileError } = await supabase.from("profiles").insert({
    id:         userId,
    full_name,
    short_name: short,
    initials,
    role_label: role_label || "",
    location:   location  || "",
    lat:        lat        || null,
    lng:        lng        || null,
  });

  if (profileError) return res.status(500).json({ error: profileError.message });

  res.status(201).json({ user_id: userId, message: "Kayıt başarılı" });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  res.json({
    access_token:  data.session.access_token,
    refresh_token: data.session.refresh_token,
    user:          data.user,
    profile,
  });
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;
  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error) return res.status(401).json({ error: error.message });
  res.json({
    access_token:  data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

module.exports = router;
