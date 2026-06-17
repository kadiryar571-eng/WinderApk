/* ═══════════════════════════════════════════════════════════════════
   MATCHWORK — API Layer
   Supabase (auth + db) + Socket.io (realtime) bağlantısı
   ═══════════════════════════════════════════════════════════════════ */

/* ─── CONFIG ─────────────────────────────────────────────────────── */
// Kendi Supabase projen bilgilerini gir:
const SUPABASE_URL     = "https://lscfbmmipaorethwnnln.supabase.co";
const SUPABASE_ANON    = "sb_publishable_ZSIFCipXX-zEibFw6qrNsA_IFxdJG1v";
const SERVER_URL       = "http://localhost:4000";   // Node.js + Socket.io sunucusu

/* ─── SUPABASE CLIENT ────────────────────────────────────────────── */
let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (typeof window !== "undefined" && window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  return _supabase;
}

/* ─── TOKEN YÖNETIMI ─────────────────────────────────────────────── */
const Auth = {
  getToken()  { return localStorage.getItem("mw_token"); },
  getRefresh(){ return localStorage.getItem("mw_refresh"); },
  setSession(access, refresh) {
    localStorage.setItem("mw_token",   access);
    localStorage.setItem("mw_refresh", refresh);
  },
  clear() {
    localStorage.removeItem("mw_token");
    localStorage.removeItem("mw_refresh");
  },
  isLoggedIn() { return !!this.getToken(); },
};

/* ─── HTTP HELPER ────────────────────────────────────────────────── */
async function api(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${SERVER_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Token süresi dolmuş → yenile
    const refreshed = await refreshToken();
    if (!refreshed) { Auth.clear(); window.location.hash = "auth"; return null; }
    headers["Authorization"] = `Bearer ${Auth.getToken()}`;
    return fetch(`${SERVER_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined }).then(r => r.json());
  }

  return res.json();
}

async function refreshToken() {
  const refresh_token = Auth.getRefresh();
  if (!refresh_token) return false;
  const data = await fetch(`${SERVER_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  }).then(r => r.json()).catch(() => null);

  if (!data?.access_token) return false;
  Auth.setSession(data.access_token, data.refresh_token);
  return true;
}

/* ─── AUTH ───────────────────────────────────────────────────────── */
const AuthAPI = {
  async login(email, password) {
    const data = await api("POST", "/api/auth/login", { email, password });
    if (data?.access_token) {
      Auth.setSession(data.access_token, data.refresh_token);
      return { ok: true, profile: data.profile };
    }
    return { ok: false, error: data?.error || "Giriş başarısız" };
  },

  async register(payload) {
    const data = await api("POST", "/api/auth/register", payload);
    return data?.user_id ? { ok: true } : { ok: false, error: data?.error };
  },

  logout() { Auth.clear(); },
  isLoggedIn() { return Auth.isLoggedIn(); },
};

/* ─── JOBS ───────────────────────────────────────────────────────── */
const JobsAPI = {
  async list(params = {}) {
    const q = new URLSearchParams(params).toString();
    return api("GET", `/api/jobs${q ? "?" + q : ""}`);
  },

  async nearby(lat, lng, radius = 5000) {
    return api("GET", `/api/jobs?lat=${lat}&lng=${lng}&radius=${radius}`);
  },

  async get(id) { return api("GET", `/api/jobs/${id}`); },

  async swipe(id, direction) {
    return api("POST", `/api/jobs/${id}/swipe`, { direction });
  },
};

/* ─── MATCHES ────────────────────────────────────────────────────── */
const MatchesAPI = {
  async list(status) {
    const q = status ? `?status=${status}` : "";
    return api("GET", `/api/matches${q}`);
  },
  async get(id)      { return api("GET",   `/api/matches/${id}`); },
  async update(id,s) { return api("PATCH", `/api/matches/${id}`, { status: s }); },
};

/* ─── MESSAGES ───────────────────────────────────────────────────── */
const MessagesAPI = {
  async list(matchId) { return api("GET",  `/api/messages/${matchId}`); },
  async send(matchId, content) {
    return api("POST", `/api/messages/${matchId}`, { content });
  },
};

/* ─── SOCKET.IO ──────────────────────────────────────────────────── */
let _socket = null;

const Socket = {
  connect() {
    if (_socket?.connected) return _socket;
    if (typeof io === "undefined") { console.warn("Socket.io CDN yüklenemedi"); return null; }

    _socket = io(SERVER_URL, { transports: ["websocket"], autoConnect: false });
    _socket.connect();

    _socket.once("connect", () => {
      const token = Auth.getToken();
      if (token) _socket.emit("auth", { token });
    });

    _socket.on("auth:ok",        (d)  => console.log("🔐 Socket auth OK:", d.userId));
    _socket.on("connect_error",  (e)  => console.warn("Socket hatası:", e.message));
    return _socket;
  },

  disconnect() { _socket?.disconnect(); _socket = null; },

  joinMatch(matchId) { _socket?.emit("join:match", matchId); },

  sendMessage(matchId, content) { _socket?.emit("message:send", { matchId, content }); },

  onMessage(cb)      { _socket?.on("message:new",      cb); },
  onTypingStart(cb)  { _socket?.on("typing:start",     cb); },
  onTypingStop(cb)   { _socket?.on("typing:stop",      cb); },
  onNotification(cb) { _socket?.on("notification:new", cb); },

  typingStart(matchId) { _socket?.emit("typing:start", { matchId }); },
  typingStop(matchId)  { _socket?.emit("typing:stop",  { matchId }); },

  off(event, cb) { _socket?.off(event, cb); },
  get connected() { return _socket?.connected || false; },
};

/* ─── KONUM ──────────────────────────────────────────────────────── */
const Location = {
  current: null,

  async get() {
    if (this.current) return this.current;
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        this.current = { lat: 40.9906, lng: 29.0250 }; // Kadıköy fallback
        resolve(this.current);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          resolve(this.current);
        },
        () => {
          this.current = { lat: 40.9906, lng: 29.0250 };
          resolve(this.current);
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  },
};

/* ─── EXPORT ─────────────────────────────────────────────────────── */
window.MW = { AuthAPI, JobsAPI, MatchesAPI, MessagesAPI, Socket, Auth, Location };
