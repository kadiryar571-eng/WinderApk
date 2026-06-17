const router = require("express").Router();
const { requireAuth, supabase } = require("../middleware/auth");

// GET /api/matches?status=new|active|interview|hired
router.get("/", requireAuth, async (req, res) => {
  const { status } = req.query;

  let query = supabase
    .from("matches")
    .select(`
      id, status, match_score, created_at, updated_at,
      jobs (
        id, title,
        companies ( id, name, initials, verified )
      ),
      messages ( id, content, created_at, sender_type )
    `)
    .eq("user_id", req.user.id)
    .order("updated_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // Her match için okunmamış mesaj sayısı
  const enriched = data.map((m) => ({
    ...m,
    unread_count: (m.messages || []).filter(
      (msg) => msg.sender_type === "company" && !msg.read_at
    ).length,
    last_message: (m.messages || []).at(-1) || null,
  }));

  res.json(enriched);
});

// GET /api/matches/:id — tek match + mesajlar
router.get("/:id", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      jobs ( *, companies ( * ) ),
      messages ( * ),
      interviews ( * )
    `)
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .single();

  if (error) return res.status(404).json({ error: "Eşleşme bulunamadı" });
  res.json(data);
});

// PATCH /api/matches/:id  { status: "..." }
router.patch("/:id", requireAuth, async (req, res) => {
  const { status } = req.body;
  const allowed = ["active", "rejected"];
  if (!allowed.includes(status))
    return res.status(400).json({ error: "Geçersiz durum" });

  const { data, error } = await supabase
    .from("matches")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
