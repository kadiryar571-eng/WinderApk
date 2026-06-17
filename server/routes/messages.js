const router = require("express").Router();
const { requireAuth, supabase } = require("../middleware/auth");

// GET /api/messages/:matchId — mesaj geçmişi
router.get("/:matchId", requireAuth, async (req, res) => {
  const { matchId } = req.params;

  // Kullanıcının bu match'e erişimi var mı?
  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("id", matchId)
    .eq("user_id", req.user.id)
    .single();

  if (!match) return res.status(403).json({ error: "Erişim yok" });

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Okunmamışları oku olarak işaretle
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("match_id", matchId)
    .eq("sender_type", "company")
    .is("read_at", null);

  res.json(data);
});

// POST /api/messages/:matchId  { content: "..." }
// Socket.io da mesajı broadcast eder — bu endpoint sadece DB'ye kaydeder
router.post("/:matchId", requireAuth, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "İçerik boş olamaz" });

  const { matchId } = req.params;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      match_id:    matchId,
      sender_id:   req.user.id,
      sender_type: "user",
      content:     content.trim(),
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;
