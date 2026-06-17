/* ═══════════════════════════════════════════════════════════════════
   MATCHWORK — app.js  (vanilla JS SPA, hash routing)
   ═══════════════════════════════════════════════════════════════════ */

/* ─── STATE ──────────────────────────────────────────────────────── */
const state = {
  selectedResult: "",
  rating: 0,
  onboarding: {
    userType: null,
    categories: [],
    distance: 5,
    workTypes: ["Yarı zamanlı"],
    minSalary: 550,
    name: "",
    phone: "",
  },
  register: {
    phone: "",
    firstname: "",
    lastname: "",
    skills: [],
    city: "İstanbul",
    district: "Kadıköy",
    otpVerified: false,
  },
  messages: [
    { from:"business", text:"Merhaba Selin, profilini inceledik. Hafta sonu vardiyası için görüşmek ister misin?", time:"14:08" },
    { from:"me",       text:"Merhaba, uygunum. Vardiya saatleri nasıl olacak?", time:"14:10" },
    { from:"business", text:"Cumartesi ve pazar 10:00-18:00. Kısa bir görüntülü görüşme planlayalım.", time:"14:12" }
  ],
  swipe: {
    deckIndex:0, likedIds:[], skippedIds:[],
    lastAction:null, deckFilter:"Tümü",
    isDragging:false, startX:0, startY:0,
    currentDeltaX:0, currentDeltaY:0,
    thresholdReached:false, directionLocked:null,
    activeCard:null,
  },
  detailJobId: 1,
  detailSource: "home",
  matchesTab: 0,
  selectedPin: null,
  sheetExpanded: false,
  dirMode: "walk",
  chatMatchId: null,
  chatMatch: null,
  chatMessages: [],
  chatTyping: false,
  matchesList: [],
  notifications: [],
  activeInterview: null,
  notifPrefs: { match:true, message:true, interview:true, email:true, promo:false },
  prefTypes: ["Yarı zamanlı","Tam zamanlı"],
  prefRadius: "5 km",
};

/* ─── DATA ───────────────────────────────────────────────────────── */
let _apiJobsLoaded = false;

const user = {
  name:"Selin Kaya", short:"Selin", initials:"SK",
  role:"Barista · Satış Danışmanı", location:"Kadıköy, İstanbul",
  matchScore:72, responseRate:"92%", rating:4.8,
  verified:true, experience:"3 yıl",
  availability:"Hafta sonu & Hafta içi akşam",
  skills:["Kahve hazırlama","Kasa kullanımı","Müşteri iletişimi","Ekip çalışması","Ürün bilgisi"],
  certs:["Barista Sertifikası","Gıda Hijyeni"],
};

let jobs = [
  { id:1, title:"Barista", company:"Cafe Lumiere", initials:"CL",
    sal:{ min:520, max:580, cur:"₺", per:"gün" },
    distance:1.2, travel:{ walk:15, bus:6, car:4 },
    matchScore:92, type:"Yarı zamanlı", pin:{ x:48, y:50, tier:"high" },
    desc:"Sahil kenarında sakin ve modern bir kafe. Hafta sonu vardiyası, yemek dahil. Deneyimsiz adaylara açık, ekibimiz size her şeyi öğretir.",
    req:["İletişim becerileri","Ekip çalışması","Esnek saat"],
    benefits:["Yemek ikramı","Servis ikramı","Prim sistemi"],
    schedule:"Cumartesi–Pazar 10:00–18:00",
    tags:["Hafta sonu","Yemek dahil","Prim"],
    hue:"108,78,255" },

  { id:2, title:"Garson", company:"Beyaz Masa", initials:"BM",
    sal:{ min:480, max:560, cur:"₺", per:"gün" },
    distance:0.8, travel:{ walk:10, bus:4, car:3 },
    matchScore:85, type:"Tam zamanlı", pin:{ x:62, y:38, tier:"high" },
    desc:"Şehrin kalbinde köklü bir restoran. Tecrübeli bir ekiple çalışma fırsatı. Düzenli müşteri kitlesi, sakin çalışma ortamı.",
    req:["Güler yüz","Dikkatli","Fiziksel dayanıklılık"],
    benefits:["Yemek ikramı","Ulaşım desteği"],
    schedule:"Hafta içi 11:00–20:00",
    tags:["Tam zamanlı","Ulaşım"],
    hue:"34,197,94" },

  { id:3, title:"Kurye", company:"HızlıGit", initials:"HG",
    sal:{ min:600, max:700, cur:"₺", per:"gün" },
    distance:2.1, travel:{ walk:25, bus:9, car:6 },
    matchScore:78, type:"Serbest", pin:{ x:35, y:45, tier:"mid" },
    desc:"Esnek saatler ve yüksek kazanç. Kendi hızınızda çalışın. Bisiklet veya motorsikletle teslimat yapabilirsiniz.",
    req:["Sürücü belgesi (isteğe bağlı)","Fiziksel form","Telefon"],
    benefits:["Esnek saat","Yakıt desteği","Hızlı ödeme"],
    schedule:"Esnek — haftanın 7 günü",
    tags:["Esnek","Yüksek kazanç","Serbest"],
    hue:"245,158,11" },

  { id:4, title:"Kasa Görevlisi", company:"Teknomarket", initials:"TM",
    sal:{ min:490, max:540, cur:"₺", per:"gün" },
    distance:1.8, travel:{ walk:22, bus:8, car:5 },
    matchScore:80, type:"Yarı zamanlı", pin:{ x:55, y:65, tier:"mid" },
    desc:"Büyük bir teknoloji perakende zinciri. Kasa ve iade işlemlerine yardım. Teknolojiyle iç içe bir iş ortamı.",
    req:["Kasa deneyimi","Dikkatli sayım","Müşteri odaklılık"],
    benefits:["Çalışan indirimi","SGK","Yemek kartı"],
    schedule:"Haftaiçi 14:00–20:00",
    tags:["SGK","İndirim","Hafta içi"],
    hue:"239,68,68" },

  { id:5, title:"Güvenlik Görevlisi", company:"SafeGuard", initials:"SG",
    sal:{ min:550, max:620, cur:"₺", per:"gün" },
    distance:3.4, travel:{ walk:40, bus:14, car:8 },
    matchScore:75, type:"Tam zamanlı", pin:{ x:72, y:55, tier:"mid" },
    desc:"AVM güvenlik ekibi. Güvenli ve sakin iş ortamı. Düzenli mola ve yemek aralıkları.",
    req:["Güvenlik belgesi (yoksa verilebilir)","Dikkat","Soğukkanlılık"],
    benefits:["SGK","Yemek","Üniforma"],
    schedule:"Gece/Gündüz vardiyalı",
    tags:["SGK","Vardiyalı","Üniforma"],
    hue:"139,92,255" },

  { id:6, title:"Satış Temsilcisi", company:"ModaPlus", initials:"MP",
    sal:{ min:500, max:650, cur:"₺", per:"gün" },
    distance:1.5, travel:{ walk:18, bus:7, car:4 },
    matchScore:88, type:"Yarı zamanlı", pin:{ x:40, y:30, tier:"high" },
    desc:"Kadıköy'ün en popüler giyim mağazalarından biri. Prim sistemiyle yüksek kazanç imkânı. Genç ve dinamik ekip.",
    req:["Satış yeteneği","Stil bilgisi","Müşteri iletişimi"],
    benefits:["Prim","Çalışan indirimi","Esnek saat"],
    schedule:"Cumartesi–Pazar 11:00–19:00",
    tags:["Prim","Moda","Hafta sonu"],
    hue:"34,197,94" },

  { id:7, title:"Aşçı Yardımcısı", company:"Lezzet Durağı", initials:"LD",
    sal:{ min:460, max:520, cur:"₺", per:"gün" },
    distance:2.8, travel:{ walk:34, bus:12, car:7 },
    matchScore:72, type:"Tam zamanlı", pin:{ x:58, y:35, tier:"mid" },
    desc:"Aile işletmesi, ev yemeği tarzı restoran. Mutfakta temel hazırlık ve temizlik işleri. Sıcak çalışma ortamı.",
    req:["Temel mutfak bilgisi","Hijyen sertifikası (isteğe bağlı)","Fiziksel dayanıklılık"],
    benefits:["Öğle yemeği","Ulaşım desteği"],
    schedule:"Hafta içi 08:00–16:00",
    tags:["Öğle yemeği","Haftaiçi","Tam zamanlı"],
    hue:"245,158,11" },

  { id:8, title:"Çağrı Merkezi Temsilcisi", company:"NetCall", initials:"NC",
    sal:{ min:480, max:580, cur:"₺", per:"gün" },
    distance:1.1, travel:{ walk:13, bus:5, car:3 },
    matchScore:82, type:"Yarı zamanlı", pin:{ x:25, y:62, tier:"high" },
    desc:"Modern ofis ortamında müşteri hizmetleri. Uzaktan çalışma seçeneği de mevcut. Hızlı kariyer ilerleme fırsatı.",
    req:["İyi iletişim","Bilgisayar kullanımı","Sabır"],
    benefits:["SGK","Uzaktan çalışma","Prim"],
    schedule:"Esnek — 09:00–21:00 arası",
    tags:["SGK","Uzaktan","Prim"],
    hue:"108,78,255" },
];

const matchItems = [
  [
    { initials:"CL", name:"Cafe Lumiere",      role:"Barista",               time:"Şimdi",   preview:"Tebrikler! Profilin ilgimizi çekti ✦", unread:2, dot:"dot-new" },
    { initials:"MP", name:"ModaPlus",           role:"Satış Temsilcisi",      time:"2 dk",    preview:"Merhaba, müsait misiniz?", unread:1, dot:"dot-new" },
    { initials:"NC", name:"NetCall",            role:"Çağrı Mrk. Temsilcisi", time:"15 dk",   preview:"Profilinizi inceledik...", unread:0, dot:"dot-new" },
  ],
  [
    { initials:"BM", name:"Beyaz Masa",         role:"Garson",                time:"Dün",     preview:"Yarın 14:00 müsait misiniz?", unread:1, dot:"dot-active" },
    { initials:"SG", name:"SafeGuard",          role:"Güvenlik Görevlisi",    time:"2 gün",   preview:"Belgeleri ilettiniz mi?", unread:0, dot:"dot-active" },
  ],
  [
    { initials:"TM", name:"Teknomarket",        role:"Kasa Görevlisi",        time:"17 Haz",  preview:"Görüşme 17 Haz 14:00 onaylandı", unread:0, dot:"dot-interview" },
  ],
  [
    { initials:"LD", name:"Lezzet Durağı",      role:"Aşçı Yardımcısı",      time:"10 Haz",  preview:"İşe başlama tarihin 20 Haziran", unread:0, dot:"dot-hired" },
  ],
];
const matchTabLabels = ["Yeni Eşleşme","Aktif Konuşma","Görüşme","İşe Alındı"];
const matchTabCounts = matchItems.map(t => t.length);

/* ─── ROUTING ────────────────────────────────────────────────────── */
const navItems = [
  ["home",     "ti-home",           "Ana Sayfa"],
  ["nearby",   "ti-map-pin",        "Yakında"],
  ["matches",  "ti-sparkles",       "Eşleşmeler"],
  ["messages", "ti-message-circle", "Mesajlar"],
  ["profile",  "ti-user",           "Profil"],
];
const navRoutes = navItems.map(n => n[0]);

function currentRoute() {
  return location.hash.replace(/^#\/?/, "") || "auth";
}
function go(route) {
  location.hash = route;
}

/* ─── HELPERS ────────────────────────────────────────────────────── */
function icon(cls) { return `<i class="${cls}" aria-hidden="true"></i>`; }

function screen(content, nav = "") {
  return `<section class="screen">${content}</section>${nav}`;
}

function topbar(title, backRoute, action = "") {
  const back = backRoute
    ? `<button class="topbar-action" onclick="go('${backRoute}')" aria-label="Geri">${icon("ti-arrow-left")}</button>`
    : "";
  return `<header class="topbar">${back}<h1 class="topbar-title">${title}</h1>${action}</header>`;
}

function bottomNav(active) {
  return `<nav class="bottom-nav" aria-label="Gezinti">
    <div class="sidebar-brand">
      <div class="sidebar-brand-mark">✦</div>
      <span class="sidebar-brand-text">Matchwork</span>
    </div>
    ${navItems.map(([route, ic, label]) => `
      <button class="nav-item${active === route ? " active" : ""}" onclick="go('${route}')" aria-label="${label}">
        ${icon(ic)}<span>${label}</span>
      </button>`).join("")}
  </nav>`;
}

function scorePillClass(s) { return s >= 85 ? "score-high" : s >= 70 ? "score-mid" : "score-low"; }
function pinTier(s) { return s >= 85 ? "pin-high" : s >= 70 ? "pin-mid" : "pin-low"; }
function scoreColor(s) { return s >= 85 ? "var(--success)" : s >= 70 ? "var(--primary)" : "var(--pin-low)"; }

function svgRing(score, r, sw, fgColor, bgColor = "rgba(255,255,255,.15)") {
  const c = 2 * Math.PI * r;
  const fill = (score / 100) * c;
  return `<svg viewBox="0 0 ${(r+sw)*2} ${(r+sw)*2}" width="100%" height="100%">
    <circle cx="${r+sw}" cy="${r+sw}" r="${r}" fill="none" stroke="${bgColor}" stroke-width="${sw}"/>
    <circle cx="${r+sw}" cy="${r+sw}" r="${r}" fill="none"
      stroke="${fgColor}" stroke-width="${sw}" stroke-linecap="round"
      stroke-dasharray="${fill.toFixed(1)} ${c.toFixed(1)}"
      stroke-dashoffset="0" transform="rotate(-90,${r+sw},${r+sw})"/>
  </svg>`;
}

function travelPills(t) {
  return `<div class="featured-travel">
    <div class="travel-pill">${icon("ti-walk")} ${t.walk} dk</div>
    <div class="travel-pill">${icon("ti-bus")} ${t.bus} dk</div>
    <div class="travel-pill">${icon("ti-car")} ${t.car} dk</div>
  </div>`;
}

/* ─── JOB CARD COMPONENTS ────────────────────────────────────────── */
function featuredCard(job) {
  const fill = (job.matchScore / 100) * (2 * Math.PI * 22);
  const circ = 2 * Math.PI * 22;
  return `<div class="featured-card" onclick="openJob(${job.id},'home')">
    <div class="featured-visual">
      <div class="featured-initials">${job.initials}</div>
      <div class="featured-match-ring">
        <svg viewBox="0 0 60 60" style="transform:rotate(-90deg)">
          <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="4"/>
          <circle cx="30" cy="30" r="22" fill="none" stroke="${scoreColor(job.matchScore)}" stroke-width="4"
            stroke-linecap="round" stroke-dasharray="${fill.toFixed(1)} ${circ.toFixed(1)}"/>
        </svg>
        <div class="featured-match-num">${job.matchScore}<span>%</span></div>
      </div>
      ${travelPills(job.travel)}
    </div>
    <div class="featured-body">
      <div class="meta">
        <span class="badge badge-success">Sana En Yakın</span>
        <span class="badge badge-dim">${job.type}</span>
      </div>
      <h2>${job.title}</h2>
      <p class="company">${job.company} · ${job.location || "Kadıköy"}</p>
      <div class="featured-footer">
        <div class="featured-salary">${job.sal.cur}${job.sal.min}–${job.sal.max}<span>/${job.sal.per}</span></div>
        <span class="body-sm">${job.distance} km uzaklıkta</span>
      </div>
    </div>
  </div>`;
}

function jobMiniCard(job) {
  const sc = job.matchScore >= 85 ? "" : job.matchScore >= 70 ? " mid" : " low";
  return `<div class="job-mini" onclick="openJob(${job.id},'home')">
    <div class="job-mini-visual">
      <span class="initials">${job.initials}</span>
      <span class="job-mini-score${sc}">${job.matchScore}%</span>
    </div>
    <div class="job-mini-body">
      <h3>${job.title}</h3>
      <p class="co">${job.company}</p>
      <p class="sal">${job.sal.cur}${job.sal.min}–${job.sal.max}<span>/${job.sal.per}</span></p>
      <p class="job-mini-dist">${icon("ti-map-pin")} ${job.distance} km</p>
    </div>
  </div>`;
}

function jobRow(job) {
  return `<div class="job-row" onclick="openJob(${job.id},'home')">
    <div class="job-row-avatar">${job.initials}</div>
    <div class="job-row-body">
      <h3>${job.title}</h3>
      <p class="co">${job.company}</p>
      <div class="job-row-meta">
        <span>${icon("ti-map-pin")} ${job.distance} km</span>
        <span>${icon("ti-walk")} ${job.travel.walk} dk</span>
        <span>${job.type}</span>
      </div>
    </div>
    <div class="job-row-right">
      <span class="job-row-sal">${job.sal.cur}${job.sal.min}<span>/${job.sal.per}</span></span>
      <span class="score-pill ${scorePillClass(job.matchScore)}">${job.matchScore}%</span>
    </div>
  </div>`;
}

/* ─── HOME CARD COMPONENTS ──────────────────────────────────────── */

function heroCard(job) {
  const circ = 2 * Math.PI * 22;
  const fill = (job.matchScore / 100) * circ;
  const distColor = job.distance < 1 ? "var(--success)" : job.distance < 3 ? "var(--primary)" : "var(--text-2)";
  return `<div class="hero-card" onclick="openJob(${job.id},'home')">
    <div class="hero-visual" style="background:linear-gradient(135deg,rgba(${job.hue},1) 0%,rgba(${job.hue},.25) 60%,#080E1F 100%)">
      <div class="hero-initials">${job.initials}</div>
      <div class="hero-ring">
        <svg viewBox="0 0 60 60" style="transform:rotate(-90deg)">
          <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="4"/>
          <circle cx="30" cy="30" r="22" fill="none" stroke="${scoreColor(job.matchScore)}" stroke-width="4"
            stroke-linecap="round" stroke-dasharray="${fill.toFixed(1)} ${circ.toFixed(1)}"/>
        </svg>
        <div class="hero-ring-num">${job.matchScore}<span>%</span></div>
      </div>
      <div class="hero-badges">
        <span class="badge badge-success">✦ Sana En Uygun</span>
        <span class="badge badge-dim">${job.type}</span>
      </div>
      <div class="featured-travel">
        <div class="travel-pill">${icon("ti-walk")} ${job.travel.walk} dk</div>
        <div class="travel-pill">${icon("ti-bus")} ${job.travel.bus} dk</div>
        <div class="travel-pill">${icon("ti-car")} ${job.travel.car} dk</div>
      </div>
    </div>
    <div class="hero-body">
      <div class="hero-title-row">
        <div>
          <h2 class="hero-role">${job.title}</h2>
          <p class="hero-company">${job.company} · Kadıköy</p>
        </div>
        <div class="hero-dist" style="color:${distColor}">
          <span class="hero-dist-num">${job.distance}</span>
          <span class="hero-dist-unit">km</span>
        </div>
      </div>
      <p class="hero-reason">${job.desc.slice(0, 72)}…</p>
      <div class="hero-footer">
        <span class="hero-salary">${job.sal.cur}${job.sal.min}–${job.sal.max}<em>/${job.sal.per}</em></span>
        <div class="hero-btns">
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();go('navigation')">Yol Tarifi</button>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openJob(${job.id},'home')">Detaylar →</button>
        </div>
      </div>
    </div>
  </div>`;
}

function discCard(job) {
  const circ = 2 * Math.PI * 16;
  const fill = (job.matchScore / 100) * circ;
  return `<div class="disc-card" onclick="openJob(${job.id},'home')">
    <div class="disc-visual" style="background:linear-gradient(145deg,rgba(${job.hue},1) 0%,rgba(${job.hue},.35) 100%)">
      <div class="disc-initials">${job.initials}</div>
      <div class="disc-ring">
        <svg viewBox="0 0 44 44" style="transform:rotate(-90deg)">
          <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="3"/>
          <circle cx="22" cy="22" r="16" fill="none" stroke="${scoreColor(job.matchScore)}" stroke-width="3"
            stroke-linecap="round" stroke-dasharray="${fill.toFixed(1)} ${circ.toFixed(1)}"/>
        </svg>
        <span class="disc-ring-num">${job.matchScore}%</span>
      </div>
    </div>
    <div class="disc-body">
      <h3 class="disc-role">${job.title}</h3>
      <p class="disc-co">${job.company}</p>
      <div class="disc-kpis">
        <span class="disc-sal">${job.sal.cur}${job.sal.min}</span>
        <span class="disc-dist">${icon("ti-map-pin")} ${job.distance} km</span>
      </div>
      <span class="disc-type">${job.type}</span>
    </div>
  </div>`;
}

function distCard(job) {
  const distColor = job.distance < 1 ? "var(--success)" : job.distance < 3 ? "var(--primary)" : "var(--text-2)";
  return `<div class="dist-card" onclick="openJob(${job.id},'home')">
    <div class="dist-avatar" style="background:rgba(${job.hue},.18);color:rgba(${job.hue},1)">${job.initials}</div>
    <div class="dist-body">
      <div class="dist-top">
        <div class="dist-info">
          <h3 class="dist-role">${job.title}</h3>
          <p class="dist-co">${job.company}</p>
        </div>
        <span class="score-pill ${scorePillClass(job.matchScore)}">${job.matchScore}%</span>
      </div>
      <div class="dist-pills">
        <span class="dist-pill">${icon("ti-walk")} ${job.travel.walk} dk</span>
        <span class="dist-pill">${icon("ti-bus")} ${job.travel.bus} dk</span>
        <span class="dist-pill">${icon("ti-car")} ${job.travel.car} dk</span>
      </div>
      <div class="dist-bottom">
        <span class="dist-sal">${job.sal.cur}${job.sal.min}–${job.sal.max}/${job.sal.per}</span>
        <span class="dist-km" style="color:${distColor}">📍 ${job.distance} km</span>
      </div>
    </div>
  </div>`;
}

const HOME_TIMESTAMPS = ["Az önce", "45 dk önce", "2 saat önce", "Bugün", "Dün"];
function homeNewRow(job, i) {
  return `<div class="job-row" onclick="openJob(${job.id},'home')">
    <div class="job-row-avatar" style="background:rgba(${job.hue},.15);color:rgba(${job.hue},1)">${job.initials}</div>
    <div class="job-row-body">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
        <h3>${job.title}</h3>
        ${i === 0 ? '<span class="new-tag">YENİ</span>' : ""}
      </div>
      <p class="co">${job.company}</p>
      <div class="job-row-meta">
        <span>${icon("ti-map-pin")} ${job.distance} km</span>
        <span>${icon("ti-walk")} ${job.travel.walk} dk</span>
        <span>${job.type}</span>
      </div>
    </div>
    <div class="job-row-right">
      <span class="job-row-sal">${job.sal.cur}${job.sal.min}<span>/${job.sal.per}</span></span>
      <span class="score-pill ${scorePillClass(job.matchScore)}">${job.matchScore}%</span>
      <span class="new-time">${HOME_TIMESTAMPS[i] || "Bugün"}</span>
    </div>
  </div>`;
}

function trendCard(job) {
  const views = 84 + job.id * 23 + job.matchScore;
  return `<div class="disc-card" onclick="openJob(${job.id},'home')">
    <div class="disc-visual" style="background:linear-gradient(145deg,rgba(${job.hue},.95) 0%,rgba(${job.hue},.35) 100%)">
      <div class="disc-initials">${job.initials}</div>
      <div class="trend-views-badge">👁 ${views}</div>
    </div>
    <div class="disc-body">
      <h3 class="disc-role">${job.title}</h3>
      <p class="disc-co">${job.company}</p>
      <div class="disc-kpis">
        <span class="disc-sal">${job.sal.cur}${job.sal.min}</span>
        <span class="disc-dist">${icon("ti-map-pin")} ${job.distance} km</span>
      </div>
      <span class="disc-type" style="color:var(--warning)">◆ Trend</span>
    </div>
  </div>`;
}

/* ─── SCREENS ────────────────────────────────────────────────────── */

/* AUTH — Phone-based entry */
function renderAuth() {
  const fmtPhone = state.register.phone.length >= 10
    ? state.register.phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")
    : state.register.phone;
  return `<div class="reg-screen anim-fade-in">
    <div class="reg-brand">
      <div class="reg-brand-mark">✦</div>
      <span class="reg-brand-name">Matchwork</span>
    </div>
    <div class="reg-phone-hero">
      <div class="reg-ping-ring reg-ring-1"></div>
      <div class="reg-ping-ring reg-ring-2"></div>
      <div class="reg-phone-icon">📱</div>
    </div>
    <div class="reg-copy">
      <h2 class="reg-h1">Numaranı gir</h2>
      <p class="reg-sub">Sana bir onay kodu göndereceğiz.<br>
        <span class="reg-time-hint">60 saniyede içeridesın.</span></p>
    </div>
    <div class="reg-form">
      <div class="ob-phone-wrap">
        <span class="ob-phone-prefix">🇹🇷 +90</span>
        <input class="input-field ob-phone-input" id="auth-phone"
          type="tel" inputmode="numeric"
          placeholder="5XX XXX XX XX" maxlength="14"
          autocomplete="tel-national" value="${fmtPhone}"
          oninput="formatAuthPhone(this)"
          onkeydown="if(event.key==='Enter')submitAuthPhone()">
      </div>
      <button class="btn btn-primary btn-full reg-cta" id="auth-phone-btn"
        style="margin-top:12px" onclick="submitAuthPhone()"
        ${state.register.phone.length >= 10 ? "" : "disabled"}>Devam Et →</button>
      <div class="auth-divider">veya</div>
      <button class="btn btn-ghost btn-full" onclick="demoLogin()">Demo ile Dene →</button>
    </div>
  </div>`;
}

/* HOME */
function renderHome() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
  const byMatch = [...jobs].sort((a,b) => b.matchScore - a.matchScore);
  const byDist  = [...jobs].sort((a,b) => a.distance - b.distance);
  const byNew   = [...jobs].sort((a,b) => b.id - a.id);
  const hero  = byMatch[0];
  const recs  = byMatch.slice(1);
  const near  = byDist;
  const newJs = byNew.slice(0, 4);
  const trend = byMatch.filter(j => j.id !== hero.id);
  const catTags = [...new Set(jobs.flatMap(j => j.tags || []))].slice(0, 12);

  return screen(`
    <div class="home-hdr">
      <div class="home-hdr-left">
        <p class="home-sub">${greeting} 👋</p>
        <h1 class="home-name">${user.short}</h1>
      </div>
      <div class="home-hdr-right">
        <button class="topbar-action" onclick="go('search')" aria-label="Arama">${icon("ti-search")}</button>
        <button class="topbar-action home-bell-btn" onclick="go('notifications')" aria-label="Bildirimler">
          ${icon("ti-bell")}<span class="home-bell-dot"></span>
        </button>
        <div class="home-avatar" onclick="go('profile')">${user.initials}</div>
      </div>
    </div>

    <div class="screen-body home-body">

      <button class="home-pulse" onclick="go('discover')">
        <span class="home-pulse-dot"></span>
        <span>Kadıköy'de bugün <strong>${jobs.length} fırsat</strong> seni bekliyor</span>
        <span class="home-pulse-arr">→</span>
      </button>

      ${heroCard(hero)}

      <div class="quick-actions home-qa">
        <div class="quick-action" onclick="go('discover')">
          <div class="qa-icon primary">${icon("ti-compass")}</div>
          <h3>Keşfet</h3><p>Kaydır & eşleş</p>
        </div>
        <div class="quick-action" onclick="go('nearby')">
          <div class="qa-icon success">${icon("ti-map-pin")}</div>
          <h3>Haritada</h3><p>Yakınındakiler</p>
        </div>
        <div class="quick-action home-qa-matches" onclick="go('matches')">
          <div class="qa-icon warning" style="position:relative">
            ${icon("ti-sparkles")}
            ${matchTabCounts[0] > 0 ? `<span class="qa-badge">${matchTabCounts[0]}</span>` : ""}
          </div>
          <h3>Eşleşmeler</h3><p>${matchTabCounts[0]} yeni</p>
        </div>
      </div>

      <div class="home-section">
        <div class="home-sh">
          <div class="home-sh-l"><span class="sh-ico">✦</span>Sana Özel</div>
          <button class="home-sh-r" onclick="go('discover')">Hepsini gör →</button>
        </div>
        <div class="h-scroll">${recs.map(j => discCard(j)).join("")}</div>
      </div>

      <div class="home-section">
        <div class="home-sh">
          <div class="home-sh-l"><span class="sh-ico">◉</span>Yakınında</div>
          <button class="home-sh-r" onclick="go('nearby')">Haritada gör →</button>
        </div>
        <div class="h-scroll">${near.map(j => distCard(j)).join("")}</div>
      </div>

      <div class="home-section">
        <div class="home-sh">
          <div class="home-sh-l"><span class="sh-ico">◎</span>Yeni Eklendi</div>
          <button class="home-sh-r" onclick="go('discover')">Tümünü gör →</button>
        </div>
        <div class="home-new-list">${newJs.map((j,i) => homeNewRow(j,i)).join("")}</div>
      </div>

      <div class="home-section">
        <div class="home-sh">
          <div class="home-sh-l"><span class="sh-ico">◆</span>Trend</div>
          <button class="home-sh-r" onclick="go('discover')">Tümünü gör →</button>
        </div>
        <div class="h-scroll">${trend.map(j => trendCard(j)).join("")}</div>
      </div>

      <div class="home-section home-cat-section">
        <div class="home-sh">
          <div class="home-sh-l"><span class="sh-ico">⊟</span>Kategori Keşfi</div>
        </div>
        <div class="h-scroll" style="padding-top:0">
          ${catTags.map(tag => `<div class="home-cat-chip" onclick="go('discover')">${tag}</div>`).join("")}
        </div>
      </div>

      <div style="height:20px"></div>
    </div>
  `, bottomNav("home"));
}

/* NEARBY — Opportunity Discovery Map */
let _leafletMap = null;
let _leafletMarkers = {};
let _mapRouteLayer = null;
let _mapDistanceRings = [];

function renderNearby() {
  if (!state.sheetState) state.sheetState = "peek";
  const sheetCls = state.sheetState === "mid" ? " sheet-mid"
    : state.sheetState === "expanded" ? " sheet-expanded" : "";
  const nearby  = [...jobs].sort((a,b) => a.distance - b.distance);
  const sorted  = [...jobs].sort((a,b) => b.matchScore - a.matchScore);
  const bestPct = Math.max(...jobs.map(j => j.matchScore));

  return screen(`
    <div class="map-wrap">
      <div id="leaflet-map" class="map-full"></div>

      <!-- ETA banner -->
      <div class="map-eta-banner" id="map-eta-banner"
        style="display:${state.selectedPin ? "flex" : "none"}">
        <span id="map-eta-text">♟ ${(() => { const j = jobs.find(x=>x.id===state.selectedPin); return j ? j.travel[state.dirMode||"walk"]+" dk" : ""; })()}</span>
        <button onclick="deselectMapPin()">✕</button>
      </div>

      <!-- Top overlay -->
      <div class="map-overlay-top">
        <div class="map-search-row">
          <button class="topbar-action" onclick="go('home')" style="flex-shrink:0">${icon("ti-arrow-left")}</button>
          <div class="map-search">
            ${icon("ti-search")}
            <input type="search" id="map-search-input" placeholder="Kadıköy'de iş ara..."
              oninput="filterMapSearch(this.value)">
          </div>
          <button class="topbar-action" id="map-locate-btn" onclick="centerMapOnUser()" style="flex-shrink:0">${icon("ti-map-pin")}</button>
        </div>
        <div class="map-chips" id="map-filter-chips">
          <div class="chip active" onclick="setMapTypeFilter(this,'')">Tümü</div>
          <div class="chip" onclick="setMapTypeFilter(this,'Yarı zamanlı')">Yarı zamanlı</div>
          <div class="chip" onclick="setMapTypeFilter(this,'Tam zamanlı')">Tam zamanlı</div>
          <div class="chip" onclick="setMapTypeFilter(this,'Serbest')">Serbest</div>
        </div>
      </div>

      <!-- Bottom Sheet -->
      <div class="map-sheet${sheetCls}" id="map-sheet">
        <div class="map-sheet-handle" onclick="cycleSheetState()">
          <div class="sheet-handle"></div>
        </div>

        <!-- PEEK layer -->
        <div class="ms-layer ms-peek">
          <button class="sheet-insights" onclick="setSheetState('expanded')">
            <span class="si-dot"></span>
            <span id="sheet-insight-text">
              <strong>${jobs.length}</strong> fırsat &middot;
              En yakın <strong>${nearby[0].distance} km</strong> &middot;
              En iyi <strong>${bestPct}%</strong>
            </span>
            <span class="si-arr">↑</span>
          </button>
          <div class="h-scroll" style="padding:0 14px 12px">
            <div class="mini-filter-chip active" onclick="setSortMode(this,'match')">✦ En İyi Uyum</div>
            <div class="mini-filter-chip" onclick="setSortMode(this,'distance')">📍 En Yakın</div>
            <div class="mini-filter-chip" onclick="setSortMode(this,'new')">◎ Yeni</div>
            <div class="mini-filter-chip" onclick="setSortMode(this,'salary')">₺ Ücret</div>
          </div>
        </div>

        <!-- MID layer -->
        <div class="ms-layer ms-mid">
          <div id="sheet-selected-card">
            ${state.selectedPin
              ? mapDetailCard(jobs.find(j => j.id === state.selectedPin))
              : mapBrowseCard()}
          </div>
          <div class="sheet-nearby-row">
            <p class="sheet-nearby-label">Diğer fırsatlar →</p>
            <div class="h-scroll" id="sheet-nearby-cards">
              ${nearby.map(j => sheetMiniCard(j)).join("")}
            </div>
          </div>
        </div>

        <!-- EXPANDED layer -->
        <div class="ms-layer ms-expanded">
          <div class="ms-exp-header">
            <span id="sheet-exp-count">${jobs.length} fırsat · Kadıköy</span>
            <button class="ms-exp-close" onclick="setSheetState('peek')">${icon("ti-x")}</button>
          </div>
          <div class="ms-exp-list" id="sheet-full-list">
            ${sorted.map(j => mapListRow(j)).join("")}
          </div>
        </div>
      </div>
    </div>
  `, bottomNav("nearby"));
}

/* ─── MAP CARD COMPONENTS ────────────────────────────────────────── */

function mapDetailCard(job) {
  if (!job) return mapBrowseCard();
  const circ = 2 * Math.PI * 18;
  const fill = (job.matchScore / 100) * circ;
  const mode = state.dirMode || "walk";
  return `<div class="map-detail-card">
    <div class="mdc-header">
      <div class="mdc-avatar" style="background:rgba(${job.hue},.2);color:rgba(${job.hue},1)">${job.initials}</div>
      <div class="mdc-info">
        <h3 class="mdc-role">${job.title}</h3>
        <p class="mdc-co">${job.company}</p>
      </div>
      <div class="mdc-ring">
        <svg viewBox="0 0 48 48" style="transform:rotate(-90deg)">
          <circle cx="24" cy="24" r="18" fill="none" stroke="var(--surface-3)" stroke-width="4"/>
          <circle cx="24" cy="24" r="18" fill="none" stroke="${scoreColor(job.matchScore)}" stroke-width="4"
            stroke-linecap="round" stroke-dasharray="${fill.toFixed(1)} ${circ.toFixed(1)}"/>
        </svg>
        <div class="mdc-ring-num">${job.matchScore}%</div>
      </div>
      <button class="mdc-close" onclick="deselectMapPin()">✕</button>
    </div>
    <div class="mdc-travel-tabs">
      <button class="travel-tab${mode==="walk"?" active":""}" data-mode="walk" onclick="setMapRouteMode('walk')">${icon("ti-walk")} ${job.travel.walk} dk</button>
      <button class="travel-tab${mode==="bus"?" active":""}" data-mode="bus"  onclick="setMapRouteMode('bus')">${icon("ti-bus")} ${job.travel.bus} dk</button>
      <button class="travel-tab${mode==="car"?" active":""}" data-mode="car"  onclick="setMapRouteMode('car')">${icon("ti-car")} ${job.travel.car} dk</button>
    </div>
    <div class="mdc-kpis">
      <div class="mdc-kpi"><span class="mdc-kv">${job.sal.cur}${job.sal.min}–${job.sal.max}</span><span class="mdc-kl">/${job.sal.per}</span></div>
      <div class="mdc-sep"></div>
      <div class="mdc-kpi"><span class="mdc-kv">${job.distance} km</span><span class="mdc-kl">mesafe</span></div>
      <div class="mdc-sep"></div>
      <div class="mdc-kpi"><span class="mdc-kv" style="font-size:11px">${job.type}</span><span class="mdc-kl">çalışma</span></div>
    </div>
    <p class="mdc-desc">${job.desc.slice(0, 78)}…</p>
    <div class="mdc-actions">
      <button class="btn btn-ghost btn-sm" onclick="go('navigation')">Yol Tarifi</button>
      <button class="btn btn-primary" style="flex:1;height:40px;font-size:13px;border-radius:12px" onclick="openJob(${job.id},'nearby')">Detayları Gör →</button>
    </div>
  </div>`;
}

function mapBrowseCard() {
  return `<div class="map-browse-prompt">
    <div class="mbp-icon">◉</div>
    <p class="mbp-text">Haritadan bir fırsat seçin<br>veya aşağıyı kaydırın</p>
    <button class="btn btn-ghost btn-sm" onclick="setSheetState('expanded')">Tüm Fırsatları Gör →</button>
  </div>`;
}

function sheetMiniCard(job) {
  const active = state.selectedPin === job.id;
  return `<div class="sheet-mini-card${active ? " smc-active" : ""}" onclick="selectMapPin(${job.id})">
    <div class="smc-avatar" style="background:rgba(${job.hue},.2);color:rgba(${job.hue},1)">${job.initials}</div>
    <h4 class="smc-role">${job.title}</h4>
    <p class="smc-dist">${icon("ti-map-pin")} ${job.distance} km</p>
    <p class="smc-walk">${icon("ti-walk")} ${job.travel.walk} dk</p>
    <span class="score-pill ${scorePillClass(job.matchScore)}">${job.matchScore}%</span>
  </div>`;
}

function mapListRow(job) {
  return `<div class="job-row" onclick="selectMapPin(${job.id});setSheetState('mid')">
    <div class="job-row-avatar" style="background:rgba(${job.hue},.15);color:rgba(${job.hue},1)">${job.initials}</div>
    <div class="job-row-body">
      <h3>${job.title}</h3>
      <p class="co">${job.company}</p>
      <div class="job-row-meta">
        <span>${icon("ti-map-pin")} ${job.distance} km</span>
        <span>${icon("ti-walk")} ${job.travel.walk} dk</span>
        <span>${job.type}</span>
      </div>
    </div>
    <div class="job-row-right">
      <span class="job-row-sal">${job.sal.cur}${job.sal.min}<span>/${job.sal.per}</span></span>
      <span class="score-pill ${scorePillClass(job.matchScore)}">${job.matchScore}%</span>
    </div>
  </div>`;
}

/* ─── MAP INIT ───────────────────────────────────────────────────── */

function initLeafletMap() {
  if (!window.L) return;
  const el = document.getElementById("leaflet-map");
  if (!el) return;
  if (_leafletMap) { _leafletMap.remove(); _leafletMap = null; }
  _leafletMarkers = {};
  _mapRouteLayer = null;

  const center = [40.9906, 29.0250];
  _leafletMap = L.map("leaflet-map", {
    center, zoom: 15,
    zoomControl: false, attributionControl: false,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
  }).addTo(_leafletMap);

  // Distance rings
  _mapDistanceRings.forEach(r => { try { r.remove(); } catch(_) {} });
  _mapDistanceRings = [
    L.circle(center, { radius:500,  color:"#6C4EFF", opacity:.45, weight:1.5, fill:false, dashArray:"5 5" }),
    L.circle(center, { radius:1000, color:"#6C4EFF", opacity:.28, weight:1,   fill:false, dashArray:"3 7" }),
    L.circle(center, { radius:2000, color:"#6C4EFF", opacity:.14, weight:1,   fill:false, dashArray:"2 9" }),
  ];
  _mapDistanceRings.forEach(r => r.addTo(_leafletMap));

  // User location pin
  const userIcon = L.divIcon({
    html: `<div class="lpin-user"><div class="lpu-dot"></div><div class="lpu-ring"></div></div>`,
    className: "", iconSize:[36,36], iconAnchor:[18,18],
  });
  L.marker(center, { icon: userIcon, zIndexOffset:1000 }).addTo(_leafletMap);

  if (window.MW?.Location) {
    window.MW.Location.get().then(loc => {
      if (loc && _leafletMap) _leafletMap.setView([loc.lat, loc.lng], 15);
    });
  }

  _leafletMap.on("click", () => { if (state.selectedPin) deselectMapPin(); });
  addJobPinsToMap(jobs);
}

function addJobPinsToMap(jobList) {
  if (!_leafletMap || !window.L) return;
  Object.values(_leafletMarkers).forEach(m => m.remove());
  _leafletMarkers = {};

  jobList.forEach(job => {
    const tier   = job.matchScore >= 85 ? "high" : job.matchScore >= 70 ? "mid" : "low";
    const isSel  = state.selectedPin === job.id;
    const isDim  = state.selectedPin && !isSel;
    const licon  = L.divIcon({
      html: `<div class="lpin-wrap lpin-${tier}${isSel?" lpin-sel":""}${isDim?" lpin-dim":""}" id="lpin-${job.id}">
        <div class="lpin-circle">${job.initials}</div>
        <div class="lpin-tail"></div>
        <div class="lpin-score">${job.matchScore}%</div>
      </div>`,
      className: "", iconSize:null, iconAnchor:[20,46],
    });

    const lat = job.pin?.lat || (40.9906 + (job.pin?.y - 50) * 0.002);
    const lng = job.pin?.lng || (29.0250 + (job.pin?.x - 50) * 0.003);

    const marker = L.marker([lat, lng], { icon: licon })
      .addTo(_leafletMap)
      .on("click", e => { L.DomEvent.stopPropagation(e); selectMapPin(job.id); });

    _leafletMarkers[job.id] = marker;
  });
}

function centerMapOnUser() {
  if (!_leafletMap) return;
  const btn = document.getElementById("map-locate-btn");
  if (btn) btn.style.opacity = ".5";
  const done = () => { if (btn) btn.style.opacity = ""; };
  if (window.MW?.Location) {
    window.MW.Location.get().then(loc => {
      if (loc) _leafletMap?.flyTo([loc.lat, loc.lng], 15, { duration: 0.8 });
      done();
    });
  } else {
    _leafletMap.flyTo([40.9906, 29.0250], 15, { duration: 0.8 });
    setTimeout(done, 900);
  }
}

function filterMapSearch(q) {
  state.mapSearchQ = q;
  applyMapFilters();
}

function setMapTypeFilter(btn, type) {
  document.querySelectorAll("#map-filter-chips .chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  state.mapTypeFilter = type;
  applyMapFilters();
}

function applyMapFilters() {
  const q    = (state.mapSearchQ || "").toLowerCase();
  const type = state.mapTypeFilter || "";
  const filtered = jobs.filter(j =>
    (!q    || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)) &&
    (!type || j.type === type)
  );
  addJobPinsToMap(filtered);
  const sorted  = sortMapJobs(filtered);
  const listEl  = document.getElementById("sheet-full-list");
  if (listEl) listEl.innerHTML = sorted.map(j => mapListRow(j)).join("");
  const nearbyEl = document.getElementById("sheet-nearby-cards");
  if (nearbyEl) nearbyEl.innerHTML = [...filtered].sort((a,b)=>a.distance-b.distance).map(j=>sheetMiniCard(j)).join("");
  updateSheetInsights(filtered);
}

function sortMapJobs(list) {
  const arr = [...list];
  const m = state.mapSortMode || "match";
  if (m === "distance") return arr.sort((a,b) => a.distance - b.distance);
  if (m === "new")      return arr.sort((a,b) => b.id - a.id);
  if (m === "salary")   return arr.sort((a,b) => b.sal.min - a.sal.min);
  return arr.sort((a,b) => b.matchScore - a.matchScore);
}

function setSortMode(btn, mode) {
  state.mapSortMode = mode;
  document.querySelectorAll(".mini-filter-chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  applyMapFilters();
}

function updateSheetInsights(list) {
  const el = document.getElementById("sheet-insight-text");
  if (!el || !list.length) return;
  const near = [...list].sort((a,b)=>a.distance-b.distance)[0];
  const best = Math.max(...list.map(j=>j.matchScore));
  el.innerHTML = `<strong>${list.length}</strong> fırsat &middot; En yakın <strong>${near.distance} km</strong> &middot; En iyi <strong>${best}%</strong>`;
}

function sheetCard(job) {
  const active = state.selectedPin === job.id ? " active" : "";
  return `<div class="sheet-card${active}" onclick="openJob(${job.id},'nearby')">
    <div class="sheet-card-top">
      <div><h3>${job.title}</h3><p class="co">${job.company}</p></div>
      <span class="score-pill ${scorePillClass(job.matchScore)}">${job.matchScore}%</span>
    </div>
    <div class="sheet-card-meta">
      <span>${icon("ti-map-pin")} ${job.distance} km</span>
      <span>${icon("ti-walk")} ${job.travel.walk} dk</span>
      <span>${job.type}</span>
    </div>
    <div class="sheet-card-footer">
      <span class="sheet-card-sal">${job.sal.cur}${job.sal.min}–${job.sal.max}/${job.sal.per}</span>
      <span class="caption">Detay →</span>
    </div>
  </div>`;
}

/* ─── DISCOVER ────────────────────────────────────────────────────── */

const DC_CAT_MAP = {
  "Kafe":    ["Barista"],
  "Restoran":["Garson","Aşçı Yardımcısı"],
  "Mağaza":  ["Satış Temsilcisi","Kasa Görevlisi"],
  "Kurye":   ["Kurye"],
  "Çağrı":   ["Çağrı Merkezi Temsilcisi"],
};

const DC_REASONS = {
  1:"Kahve deneyimin tam burada geçer",
  2:"Müşteri odaklı çalışma tarzına uygun",
  3:"Esnek saatler sana tam uyar",
  4:"Teknoloji ve satış — tam kombinasyon",
  5:"Güvenilirlik ve düzen senin tarzın",
  6:"Satış yeteneğin burada parlar",
  7:"Mutfak tecrübeni değerlendirme zamanı",
  8:"İletişim becerilerin ön plana çıkar",
};

const DC_ALGO_REASONS = [
  "📍 Hepsine yürüyerek gidebilirsin",
  "✨ Bugün eklendi, henüz görülmedi",
  "₺ Bu kategoride en yüksek ücret",
  "🔥 3 kişi bugün başvurdu",
  "✦ Profiline en yakın fırsatlar",
];

function filteredSwipeJobs() {
  const f = state.swipe.deckFilter || "";
  const base = jobs.filter(j => j.matchScore >= 60);
  if (!f) return base;
  const titles = DC_CAT_MAP[f] || [];
  return base.filter(j => titles.includes(j.title));
}

function buildDiscoverDeck() {
  return [...filteredSwipeJobs()].sort((a, b) => {
    const sa = a.matchScore * .7 + Math.max(0, 5 - a.distance) * 6;
    const sb = b.matchScore * .7 + Math.max(0, 5 - b.distance) * 6;
    return sb - sa;
  });
}

function currentSwipeJob() {
  const deck = buildDiscoverDeck();
  if (!deck.length) return null;
  return deck[state.swipe.deckIndex % deck.length];
}

function discoverCard(job, slot) {
  const isTop = slot === 0;
  const isSpotlight = isTop && job.matchScore >= 85;
  const tier   = job.matchScore >= 85 ? "high" : job.matchScore >= 70 ? "mid" : "low";
  const rColor = scoreColor(job.matchScore);
  const circ   = 2 * Math.PI * 20;
  const fill   = (job.matchScore / 100) * circ;

  if (!isTop) {
    return `<div class="dc-card dc-back dc-back-${slot}" style="z-index:${10 - slot}">
      <div class="dc-hero" style="background:linear-gradient(145deg,rgba(${job.hue},.4),rgba(${job.hue},.1) 65%,var(--surface-2))">
        <div class="dc-big-init">${job.initials}</div>
        <div class="dc-hero-fade"></div>
      </div>
    </div>`;
  }

  return `<div class="dc-card dc-top${isSpotlight ? " dc-spotlight" : ""}" id="top-card" tabindex="0" role="article">
    <div class="swipe-overlay like-overlay"   id="like-ol"><div class="dc-stamp dc-stamp-like">İLGİLENİYORUM ♥</div></div>
    <div class="swipe-overlay pass-overlay"   id="pass-ol"><div class="dc-stamp dc-stamp-pass">GEÇ ✕</div></div>
    <div class="swipe-overlay detail-overlay" id="detail-ol"><div class="dc-stamp dc-stamp-detail">DETAYLAR ↑</div></div>

    <div class="dc-hero" style="background:linear-gradient(155deg,rgba(${job.hue},.55) 0%,rgba(${job.hue},.22) 55%,var(--surface-2) 90%)">
      <div class="dc-big-init">${job.initials}</div>
      ${isSpotlight ? '<div class="dc-spotlight-badge">✦ Sana Özel</div>' : ""}

      <div class="dc-mini-map">
        <div class="dcm-road dcm-h" style="top:35%"></div>
        <div class="dcm-road dcm-h" style="top:62%"></div>
        <div class="dcm-road dcm-v" style="left:38%"></div>
        <div class="dcm-road dcm-v" style="left:68%"></div>
        <div class="dcm-route"></div>
        <div class="dcm-pin dcm-pin-${tier}" style="left:${job.pin.x}%;top:${job.pin.y}%"></div>
        <div class="dcm-user"></div>
      </div>

      <div class="dc-match-ring">
        <svg viewBox="0 0 48 48" width="52" height="52" style="transform:rotate(-90deg)">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="4"/>
          <circle cx="24" cy="24" r="20" fill="none" stroke="${rColor}" stroke-width="4"
            stroke-linecap="round" stroke-dasharray="${fill.toFixed(1)} ${circ.toFixed(1)}"
            class="dc-ring-arc"/>
        </svg>
        <div class="dc-ring-num">${job.matchScore}%</div>
      </div>

      <div class="dc-hero-fade"></div>
    </div>

    <div class="dc-body">
      <div class="dc-title-row">
        <div class="dc-avatar" style="background:rgba(${job.hue},.2);color:rgba(${job.hue},1)">${job.initials}</div>
        <div class="dc-title-info">
          <h2 class="dc-role">${job.title}</h2>
          <p class="dc-co">${job.company}</p>
        </div>
        <span class="dc-type-badge">${job.type}</span>
      </div>

      <p class="dc-reason">✓ "${DC_REASONS[job.id] || "Profiline uygun bir fırsat"}"</p>

      <div class="dc-kpis">
        <div class="dc-kpi"><span class="dc-kv" style="color:var(--success)">${job.sal.cur}${job.sal.min}–${job.sal.max}</span><span class="dc-kl">/${job.sal.per}</span></div>
        <div class="dc-ksep"></div>
        <div class="dc-kpi"><span class="dc-kv">${icon("ti-map-pin")} ${job.distance} km</span><span class="dc-kl">mesafe</span></div>
        <div class="dc-ksep"></div>
        <div class="dc-kpi"><span class="dc-kv">${icon("ti-walk")} ${job.travel.walk} dk</span><span class="dc-kl">yürüyüş</span></div>
      </div>

      <div class="dc-travel">
        <span class="dc-t dc-walk">${icon("ti-walk")} ${job.travel.walk} dk</span>
        <span class="dc-t dc-bus">${icon("ti-bus")} ${job.travel.bus} dk</span>
        <span class="dc-t dc-car">${icon("ti-car")} ${job.travel.car} dk</span>
      </div>

      <div class="dc-tags">
        ${job.tags.slice(0,3).map(t => `<span class="dc-tag">${t}</span>`).join("")}
      </div>
    </div>
  </div>`;
}

function renderCardDeck() {
  const deck  = buildDiscoverDeck();
  const total = deck.length;
  if (!total || state.swipe.deckIndex >= total) return discoverEmptyState();
  const cards = [];
  for (let i = Math.min(2, total - 1 - state.swipe.deckIndex); i >= 0; i--) {
    cards.push(discoverCard(deck[state.swipe.deckIndex + i], i));
  }
  return cards.join("");
}

function discoverEmptyState() {
  return `<div class="dc-empty">
    <div class="dc-empty-icon">✦</div>
    <h2 class="dc-empty-title">Tüm fırsatları gördün!</h2>
    <p class="dc-empty-sub">Bu oturumda <strong>${state.swipe.likedIds.length}</strong> ilana ilgi gösterdin.</p>
    <div class="dc-empty-stats">
      <div class="dc-es"><strong>${state.swipe.likedIds.length}</strong><span>Beğeni</span></div>
      <div class="dc-es"><strong>${state.swipe.skippedIds.length}</strong><span>Geçilen</span></div>
    </div>
    <button class="btn btn-primary" style="margin-top:20px;height:48px;padding:0 32px" onclick="resetDeck()">Yeniden Keşfet</button>
    <button class="btn btn-ghost" style="margin-top:8px" onclick="go('nearby')">Haritada Gör →</button>
  </div>`;
}

function quickBrowseCard(job) {
  return `<div class="qbc" onclick="openJob(${job.id},'discover')">
    <div class="qbc-avatar" style="background:rgba(${job.hue},.18);color:rgba(${job.hue},1)">${job.initials}</div>
    <div class="qbc-body">
      <h4 class="qbc-role">${job.title}</h4>
      <p class="qbc-co">${job.company}</p>
      <p class="qbc-dist">${icon("ti-map-pin")} ${job.distance} km · ${icon("ti-walk")} ${job.travel.walk} dk</p>
    </div>
    <span class="score-pill ${scorePillClass(job.matchScore)}" style="align-self:center;flex-shrink:0">${job.matchScore}%</span>
  </div>`;
}

function updateDeckInfo() {
  const deck      = buildDiscoverDeck();
  const remaining = Math.max(0, deck.length - state.swipe.deckIndex);
  const dotsEl    = document.getElementById("dc-dots");
  const countEl   = document.getElementById("dc-count");
  const reasonEl  = document.getElementById("dc-algo-reason");
  const detailBtn = document.getElementById("dc-detail-btn");
  const job       = currentSwipeJob();

  if (dotsEl) dotsEl.innerHTML = Array.from({length: Math.min(5, remaining)}, (_, i) =>
    `<div class="dc-dot${i === 0 ? " dc-dot-active" : ""}"></div>`).join("");
  if (countEl)  countEl.textContent  = `${remaining} / ${deck.length}`;
  if (reasonEl) reasonEl.textContent = DC_ALGO_REASONS[state.swipe.deckIndex % DC_ALGO_REASONS.length];
  if (detailBtn && job) detailBtn.setAttribute("onclick", `openJob(${job.id},'discover')`);
}

function showLikeExplosion() {
  const stage = document.querySelector(".dc-stage");
  if (!stage) return;
  const ex = document.createElement("div");
  ex.className = "dc-like-explosion";
  ex.innerHTML = Array.from({length: 7}, (_, i) =>
    `<div class="dc-lh" style="--i:${i}">♥</div>`).join("");
  stage.appendChild(ex);
  setTimeout(() => ex.remove(), 900);
}

function showSwipeToast(msg) {
  const wrap = document.querySelector(".dc-wrap");
  if (!wrap) return;
  const t = document.createElement("div");
  t.className = "dc-toast";
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add("dc-toast-show"));
  setTimeout(() => { t.classList.remove("dc-toast-show"); setTimeout(() => t.remove(), 300); }, 2800);
}

function toggleSpeedMode() {
  state.speedMode = !state.speedMode;
  const btn   = document.getElementById("dc-speed-btn");
  const stage = document.querySelector(".dc-stage");
  if (btn)   btn.classList.toggle("dc-speed-active", state.speedMode);
  if (stage) stage.classList.toggle("dc-speed-mode", state.speedMode);
}

function renderDetailPane(job) {
  if (!job) return "";
  return `<div style="padding:24px 20px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <div style="width:52px;height:52px;border-radius:var(--r-sm);background:linear-gradient(135deg,rgba(${job.hue},.3),rgba(${job.hue},.1));display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:var(--text-2);">${job.initials}</div>
      <div><h2 style="font-size:18px;font-weight:800">${job.title}</h2><p style="font-size:13px;color:var(--text-2)">${job.company}</p></div>
      <span class="score-pill ${scorePillClass(job.matchScore)}" style="margin-left:auto">${job.matchScore}%</span>
    </div>
    <p style="font-size:14px;color:var(--text-2);line-height:1.6;margin-bottom:16px">${job.desc}</p>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" style="flex:1" onclick="openJob(${job.id},'discover')">Detayları Gör</button>
      <button class="btn btn-success" style="flex:1" onclick="swipeCard('right')">İlgileniyorum</button>
    </div>
  </div>`;
}

function renderDiscover() {
  const deck      = buildDiscoverDeck();
  const remaining = Math.max(0, deck.length - state.swipe.deckIndex);
  const job       = currentSwipeJob();
  const filter    = state.swipe.deckFilter || "";

  const cats = [
    {val:"",        label:"◉ Tümü"},
    {val:"Kafe",    label:"☕ Kafe"},
    {val:"Restoran",label:"🍽 Restoran"},
    {val:"Mağaza",  label:"🛍 Mağaza"},
    {val:"Kurye",   label:"📦 Kurye"},
    {val:"Çağrı",   label:"📞 Çağrı"},
  ];

  return screen(`
    <div class="dc-wrap">
      <header class="dc-topbar">
        <button class="dc-loc-btn" onclick="go('nearby')">
          ${icon("ti-map-pin")} Kadıköy <span style="opacity:.5;font-size:10px">▾</span>
        </button>
        <div class="topbar-logo">
          <div class="topbar-logo-mark">✦</div>
          <span class="topbar-logo-text">Keşfet</span>
        </div>
        <div style="display:flex;gap:2px">
          <button class="topbar-action${state.speedMode ? " dc-speed-active" : ""}" id="dc-speed-btn" onclick="toggleSpeedMode()" title="Hız Modu">⚡</button>
          <button class="topbar-action" onclick="go('notifications')">${icon("ti-bell")}</button>
        </div>
      </header>

      <div class="dc-chips" id="dc-filter-chips">
        ${cats.map(c => `<div class="chip${filter === c.val ? " active" : ""}" onclick="filterSwipeDeck(this,'${c.val}')">${c.label}</div>`).join("")}
      </div>

      <div class="dc-stage${state.speedMode ? " dc-speed-mode" : ""}" id="dc-stage">
        <div class="card-deck" id="card-deck">${renderCardDeck()}</div>
      </div>

      <div class="dc-deck-info">
        <div class="dc-dots" id="dc-dots">
          ${Array.from({length: Math.min(5, remaining)}, (_, i) =>
            `<div class="dc-dot${i === 0 ? " dc-dot-active" : ""}"></div>`).join("")}
        </div>
        <div class="dc-algo-reason" id="dc-algo-reason">${DC_ALGO_REASONS[state.swipe.deckIndex % DC_ALGO_REASONS.length]}</div>
        <span class="dc-count" id="dc-count">${remaining} / ${deck.length}</span>
      </div>

      <div class="dc-actions">
        <button class="dc-btn dc-undo"   onclick="undoSwipe()"                               title="Geri Al">${icon("ti-undo")}</button>
        <button class="dc-btn dc-pass"   onclick="swipeCard('left')"                         title="Geç">✕</button>
        <button class="dc-btn dc-detail" onclick="openJob(${job ? job.id : 1},'discover')"   title="Detay" id="dc-detail-btn">↑</button>
        <button class="dc-btn dc-like"   onclick="swipeCard('right')"                        title="İlgileniyorum">♥</button>
      </div>

      <div class="dc-quick-browse">
        <div class="dc-qb-hdr">
          <span class="dc-qb-title">Tüm fırsatlar</span>
          <span class="dc-qb-count">${deck.length} ilan</span>
        </div>
        <div class="h-scroll" style="padding:0 14px 16px;gap:8px">
          ${deck.map(j => quickBrowseCard(j)).join("")}
        </div>
      </div>
    </div>`, bottomNav(""));
}

/* JOB DETAIL */
function openJob(id, source) {
  state.detailJobId = String(id);
  state.detailSource = source || "home";
  go("job-detail");
}

function renderJobDetail() {
  const job = jobs.find(j => String(j.id) === String(state.detailJobId)) || jobs[0];
  const backRoute = state.detailSource === "discover" ? "discover" :
                   state.detailSource === "nearby" ? "nearby" : "home";
  const grad = `linear-gradient(135deg,rgba(${job.hue},.5) 0%,rgba(${job.hue},.15) 50%,var(--bg) 100%)`;
  return screen(`
    <div class="detail-hero" style="background:${grad}">
      <div class="big-initials">${job.initials}</div>
      <button class="detail-hero-back" onclick="go('${backRoute}')">${icon("ti-arrow-left")}</button>
      <button class="detail-hero-save">${icon("ti-bookmark")}</button>
      <div class="detail-score-badge">${job.matchScore}% Uyum</div>
    </div>
    <div class="detail-body">
      <div class="detail-head">
        <h1>${job.title}</h1>
        <p class="company">${job.company} · ${job.location || "Kadıköy, İstanbul"}</p>
        <div class="detail-kpis">
          <div class="detail-kpi">
            <span class="kpi-v" style="color:var(--success)">${job.sal.cur}${job.sal.min}</span>
            <span class="kpi-l">Günlük Min</span>
          </div>
          <div class="detail-kpi">
            <span class="kpi-v">${job.distance} km</span>
            <span class="kpi-l">Mesafe</span>
          </div>
          <div class="detail-kpi">
            <span class="kpi-v">${icon("ti-walk")} ${job.travel.walk}dk</span>
            <span class="kpi-l">Yürüyerek</span>
          </div>
          <div class="detail-kpi">
            <span class="kpi-v" style="color:var(--primary)">${job.type}</span>
            <span class="kpi-l">Tip</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>İlan Hakkında</h3>
        <p>${job.desc}</p>
      </div>
      <div class="detail-section">
        <h3>Aranan Özellikler</h3>
        <ul class="detail-list">${job.req.map(r => `<li>${r}</li>`).join("")}</ul>
      </div>
      <div class="detail-section">
        <h3>Çalışma Saatleri</h3>
        <p>${job.schedule}</p>
      </div>
      <div class="detail-section">
        <h3>Yan Haklar</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:2px">
          ${job.benefits.map(b => `<span class="badge badge-success">${b}</span>`).join("")}
        </div>
      </div>
      <div class="detail-section">
        <h3>Ulaşım Süresi</h3>
        <div style="display:flex;gap:10px;margin-top:4px">
          <div class="detail-kpi"><span class="kpi-v">${icon("ti-walk")} ${job.travel.walk}dk</span><span class="kpi-l">Yürüyerek</span></div>
          <div class="detail-kpi"><span class="kpi-v">${icon("ti-bus")} ${job.travel.bus}dk</span><span class="kpi-l">Otobüs</span></div>
          <div class="detail-kpi"><span class="kpi-v">${icon("ti-car")} ${job.travel.car}dk</span><span class="kpi-l">Araba</span></div>
        </div>
      </div>
    </div>
    <div class="detail-ctas">
      <button class="btn btn-ghost" style="flex:1" onclick="go('navigation')">
        ${icon("ti-map-pin")} Yol Tarifi
      </button>
      <button class="btn btn-primary" style="flex:2" onclick="swipeCard('right');go('match')">
        ${icon("ti-heart")} Eşleş
      </button>
    </div>`);
}

/* MATCH CELEBRATION */
function renderMatch() {
  const last = state.swipe.lastAction;
  const job = last ? last.job : jobs[0];
  return screen(`
    <div class="match-celebrate anim-fade-in">
      <div class="confetti-ring">
        <div class="confetti-inner"><div class="emoji">✦</div></div>
      </div>
      <h1 class="h1" style="margin-bottom:8px">Yeni Eşleşme!</h1>
      <p style="font-size:16px;color:var(--text-2);margin-bottom:6px">
        <strong style="color:var(--text-1)">${job ? job.company : "İşveren"}</strong> seni beğendi
      </p>
      <p class="body-sm" style="margin-bottom:32px;max-width:260px">
        ${job ? `${job.title} pozisyonu için mesajlaşmaya başlayabilirsin.` : ""}
      </p>
      <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:280px">
        <button class="btn btn-primary btn-full" onclick="go('messages')">
          ${icon("ti-message-circle")} Mesaj Gönder
        </button>
        <button class="btn btn-ghost btn-full" onclick="go('discover')">
          Keşfetmeye Devam Et
        </button>
      </div>
    </div>`);
}

/* NOTIFICATIONS */
const _staticNotifs = [
  { icon:"✦", bg:"var(--primary-dim)", title:"Yeni Eşleşme",         body:"Cafe Lumiere seni beğendi!", time:"Az önce", unread:true,  action:"messages" },
  { icon:"◎", bg:"var(--success-dim)", title:"Mesaj",                  body:"Beyaz Masa: 'Yarın müsait misiniz?'", time:"10 dk", unread:true, action:"chat" },
  { icon:"▤", bg:"var(--warning-dim)", title:"Görüşme Hatırlatması",   body:"Teknomarket görüşmen yarın 14:00'te", time:"1 saat", unread:false, action:"interview" },
  { icon:"⊙", bg:"var(--surface-3)",   title:"Profil Güncelleme",      body:"Profilin tamamlanma oranı %72'de", time:"Dün", unread:false, action:"settings-profile" },
  { icon:"↗", bg:"var(--primary-dim)", title:"Yeni İlanlar",           body:"Bölgene 5 yeni ilan eklendi", time:"Dün", unread:false, action:"nearby" },
];

function renderNotifications() {
  const notifs = state.notifications.length ? state.notifications : _staticNotifs;
  return screen(`
    ${topbar("Bildirimler", "home",
      `<button class="topbar-action" style="font-size:12px;font-weight:700;color:var(--primary);width:auto;padding:0 8px" onclick="markAllRead()">Tümünü Oku</button>`)}
    <div class="screen-body">
      ${notifs.map((n,i) => `
        <div class="notif-item${n.unread ? " unread" : ""}" id="notif-${i}" onclick="go('${n.action || 'home'}');markNotifRead(${i})">
          <div class="notif-icon" style="background:${n.bg}">${n.icon}</div>
          <div class="notif-body">
            <h3>${n.title}</h3>
            <p>${n.body}</p>
          </div>
          <span class="notif-time">${n.time}</span>
        </div>`).join("")}
    </div>`, bottomNav(""));
}

/* MATCHES */
function renderMatches() {
  const tab = state.matchesTab;
  const items = matchItems[tab] || [];
  return screen(`
    ${topbar("Eşleşmeler")}
    <div class="tab-bar">
      ${matchTabLabels.map((l,i) => `
        <button class="tab-btn${tab===i?" active":""}" onclick="setMatchesTab(${i})">
          ${l}
          <span class="tab-count">${matchTabCounts[i]}</span>
        </button>`).join("")}
    </div>
    <div class="screen-body">
      ${items.length ? items.map(m => `
        <div class="match-card" onclick="${tab === 2 ? `openInterview('${m.name}','${m.initials}','${m.role}')` : "go('chat')"}">
          <div class="match-avatar">
            ${m.initials}
            <div class="match-status-dot ${m.dot}"></div>
          </div>
          <div class="match-body">
            <h3>${m.name}</h3>
            <p class="role">${m.role}</p>
            <p class="preview">${m.preview}</p>
          </div>
          <div class="match-right">
            <span class="match-time">${m.time}</span>
            ${m.unread > 0 ? `<span class="match-unread">${m.unread}</span>` : ""}
            ${tab === 2 ? `<span style="font-size:10px;color:var(--primary)">→ Görüşme</span>` : ""}
          </div>
        </div>`).join("") :
        `<div class="empty-state">
          <div class="empty-icon">✦</div>
          <h2 class="empty-title">Henüz yok</h2>
          <p class="empty-sub">Bu kategoride henüz bir aktiviten yok.</p>
        </div>`}
    </div>`, bottomNav("matches"));
}

/* MESSAGES */
function renderMessages() {
  const list = state.matchesList;
  const cards = list.length > 0
    ? list.map(m => {
        const co = m.jobs?.companies || {};
        const lastMsg = m.last_message;
        const preview = lastMsg ? lastMsg.content.slice(0, 60) : "Eşleşme oluştu! 🎉";
        const timeStr = lastMsg ? formatTime(lastMsg.created_at) : formatTime(m.created_at);
        return `
        <div class="match-card" onclick="openChat('${m.id}','${(co.name||"").replace(/'/g,"\\'")}','${co.initials||"?"}')">
          <div class="match-avatar">
            ${co.initials || "?"}
            <div class="match-status-dot dot-new"></div>
          </div>
          <div class="match-body">
            <h3>${co.name || "?"}</h3>
            <p class="role">${m.jobs?.title || ""}</p>
            <p class="preview">${preview}</p>
          </div>
          <div class="match-right">
            <span class="match-time">${timeStr}</span>
            ${m.unread_count > 0 ? `<span class="match-unread">${m.unread_count}</span>` : ""}
          </div>
        </div>`;
      }).join("")
    : matchItems.flat().map(m => `
        <div class="match-card" onclick="go('chat')">
          <div class="match-avatar">${m.initials}<div class="match-status-dot ${m.dot}"></div></div>
          <div class="match-body">
            <h3>${m.name}</h3><p class="role">${m.role}</p><p class="preview">${m.preview}</p>
          </div>
          <div class="match-right">
            <span class="match-time">${m.time}</span>
            ${m.unread > 0 ? `<span class="match-unread">${m.unread}</span>` : ""}
          </div>
        </div>`).join("");

  return screen(`
    ${topbar("Mesajlar")}
    <div class="screen-body">
      ${cards || '<p style="text-align:center;color:var(--text-3);margin-top:60px">Henüz eşleşme yok.</p>'}
    </div>`, bottomNav("messages"));
}

/* CHAT */
function renderChat() {
  const match = state.chatMatch;
  const name  = match?.company || "Cafe Lumiere";
  const inits = match?.initials || "CL";
  const statusTxt = state.chatTyping ? "● Yazıyor..." : "● Çevrimiçi";

  const msgHtml = state.chatMatchId
    ? state.chatMessages.map(m => `
        <div class="msg ${m.sender_type === "user" ? "from-me" : "from-other"}">
          ${m.content}<div class="msg-time">${formatTime(m.created_at)}</div>
        </div>`).join("") +
      (state.chatMessages.length === 0
        ? '<p style="text-align:center;color:var(--text-3);font-size:13px;margin-top:40px">Henüz mesaj yok. İlk mesajı sen gönder!</p>'
        : "")
    : state.messages.map(m => `
        <div class="msg ${m.from === "me" ? "from-me" : "from-other"}">
          ${m.text}<div class="msg-time">${m.time}</div>
        </div>`).join("");

  return screen(`
    <div class="chat-header">
      <button class="topbar-action" onclick="go('messages')">${icon("ti-arrow-left")}</button>
      <div class="chat-avatar">${inits}</div>
      <div>
        <p class="chat-name">${name}</p>
        <p class="chat-status" id="chat-status">${statusTxt}</p>
      </div>
      <button class="topbar-action" style="margin-left:auto">${icon("ti-phone")}</button>
    </div>
    <div class="messages-list" id="messages-list">${msgHtml}</div>
    <div class="chat-input-row">
      <input class="chat-input" id="chat-input" placeholder="Mesaj yaz..."
        onkeydown="if(event.key==='Enter')sendMessage()"
        oninput="onChatTyping()">
      <button class="chat-send" onclick="sendMessage()">${icon("ti-send")}</button>
    </div>`);
}

/* PROFILE */
function renderProfile() {
  const score = user.matchScore;
  const fills = score * 2 * Math.PI * 52 / 100;
  const circ  = 2 * Math.PI * 52;
  const suggestions = [
    { icon:"▧", label:"Profil Fotoğrafı Ekle", sub:"Görünürlüğünü %20 artır", pts:"+10 puan" },
    { icon:"▦", label:"İş Deneyimi Ekle",       sub:"İşverenler daha kolay bulur",  pts:"+15 puan" },
    { icon:"✓", label:"Sertifika Ekle",          sub:"Güvenilirliğini kanıtla",      pts:"+8 puan"  },
  ];
  return screen(`
    ${topbar("Profilim", "", `<button class="topbar-action" onclick="go('settings')">${icon("ti-settings")}</button>`)}
    <div class="screen-body">
      <div class="profile-header">
        <div class="profile-top">
          <div class="profile-avatar">${user.initials}</div>
          <div class="profile-info">
            <h2>${user.name}</h2>
            <p class="role">${user.role}</p>
            <p class="loc">${icon("ti-map-pin")} ${user.location}</p>
            <p class="profile-verified">${icon("ti-check")} Kimlik Doğrulandı</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="profile-stat">
            <span class="profile-stat-val">${user.experience}</span>
            <span class="profile-stat-lbl">Deneyim</span>
          </div>
          <div class="profile-stat">
            <span class="profile-stat-val">${user.responseRate}</span>
            <span class="profile-stat-lbl">Yanıt Oranı</span>
          </div>
          <div class="profile-stat">
            <span class="profile-stat-val">★ ${user.rating}</span>
            <span class="profile-stat-lbl">Puan</span>
          </div>
        </div>
      </div>

      <div class="profile-section" style="display:flex;align-items:center;gap:20px">
        <div class="score-ring">
          <svg viewBox="0 0 120 120" style="transform:rotate(-90deg)">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-3)" stroke-width="8"/>
            <circle cx="60" cy="60" r="52" fill="none"
              stroke="${scoreColor(score)}" stroke-width="8"
              stroke-linecap="round"
              stroke-dasharray="${fills.toFixed(1)} ${circ.toFixed(1)}"/>
          </svg>
          <div class="ring-center">
            <span class="score-num" style="color:${scoreColor(score)}">${score}</span>
            <span class="score-lbl">Uyum Puanı</span>
          </div>
        </div>
        <div style="flex:1">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:4px">Profil Gücü</h3>
          <p class="body-sm" style="margin-bottom:12px">3 adımda puanını 90'a çıkar</p>
          <div class="progress-bar"><div class="progress-fill" style="width:${score}%"></div></div>
          <p class="caption" style="margin-top:4px">${score}/100 · Çok İyi</p>
        </div>
      </div>

      <div class="profile-section">
        <p class="profile-section-title">Profilini Güçlendir</p>
        ${suggestions.map(s => `
          <div class="improve-card" onclick="go('settings-profile')" style="cursor:pointer">
            <div class="improve-icon">${s.icon}</div>
            <div class="improve-body">
              <h4>${s.label}</h4>
              <p>${s.sub}</p>
            </div>
            <span class="improve-pts">${s.pts}</span>
          </div>`).join("")}
      </div>

      <div class="profile-section">
        <p class="profile-section-title">Yetenekler</p>
        <div class="skill-grid">
          ${user.skills.map(s => `<span class="skill-chip">${s}</span>`).join("")}
          ${user.certs.map(c => `<span class="skill-chip" style="background:var(--success-dim);color:var(--success);border-color:rgba(34,197,94,.25)">${icon("ti-badge")} ${c}</span>`).join("")}
          <span class="skill-chip" style="border-style:dashed;opacity:.7;cursor:pointer" onclick="go('settings-profile')">+ Düzenle</span>
        </div>
      </div>

      <div class="profile-section">
        <p class="profile-section-title">Tercihler</p>
        <div class="job-list">
          <div class="job-row" style="border-radius:var(--r-sm)">
            <span style="font-size:16px">⚡</span>
            <div class="job-row-body"><h3>Müsaitlik</h3><p class="co">${user.availability}</p></div>
          </div>
          <div class="job-row" style="border-radius:var(--r-sm)">
            <span style="font-size:16px">₺</span>
            <div class="job-row-body"><h3>Beklenti</h3><p class="co">Günlük ₺500–700</p></div>
          </div>
        </div>
      </div>

      <div style="padding:16px 18px 32px">
        <button class="btn btn-ghost btn-full" onclick="go('settings')">
          ${icon("ti-settings")} Ayarlar
        </button>
      </div>
    </div>`, bottomNav("profile"));
}

/* SETTINGS */
function renderSettings() {
  const dark = document.body.classList.contains("light-mode") ? false : true;
  return screen(`
    ${topbar("Ayarlar", "profile")}
    <div class="screen-body">
      <div class="settings-group">
        <p class="settings-group-title">Hesap</p>
        <div class="settings-row" onclick="go('settings-profile')"><div class="settings-row-icon" style="background:var(--primary-dim);color:var(--primary)">⊙</div><div class="settings-row-body"><h3>Profil Düzenle</h3><p>İsim, fotoğraf, beceriler</p></div><span class="settings-row-right">→</span></div>
        <div class="settings-row" onclick="go('settings-verify')"><div class="settings-row-icon" style="background:var(--success-dim);color:var(--success)">◈</div><div class="settings-row-body"><h3>Kimlik Doğrulama</h3><p>Doğrulandı ✓</p></div><span class="settings-row-right">→</span></div>
        <div class="settings-row" onclick="go('settings-notifs')"><div class="settings-row-icon" style="background:var(--warning-dim);color:var(--warning)">◉</div><div class="settings-row-body"><h3>Bildirimler</h3><p>Push, e-posta ayarları</p></div><span class="settings-row-right">→</span></div>
      </div>
      <div class="settings-group">
        <p class="settings-group-title">Tercihler</p>
        <div class="settings-row" onclick="go('settings-prefs')"><div class="settings-row-icon" style="background:var(--surface-3);color:var(--text-2)">⊞</div><div class="settings-row-body"><h3>İş Tercihleri</h3><p>${user.availability}</p></div><span class="settings-row-right">→</span></div>
        <div class="settings-row" onclick="go('settings-location')"><div class="settings-row-icon" style="background:var(--surface-3);color:var(--text-2)">◉</div><div class="settings-row-body"><h3>Konum</h3><p>${user.location}</p></div><span class="settings-row-right">→</span></div>
        <div class="settings-row" onclick="toggleDarkMode()">
          <div class="settings-row-icon" style="background:var(--surface-3);color:var(--text-2)">⌘</div>
          <div class="settings-row-body"><h3>Karanlık Mod</h3><p>Uygulama genelinde</p></div>
          <div class="toggle${dark?" on":""}"><div class="toggle-knob"></div></div>
        </div>
      </div>
      <div class="settings-group">
        <p class="settings-group-title">Uygulama</p>
        <div class="settings-row" onclick="go('settings-about')"><div class="settings-row-icon" style="background:var(--surface-3);color:var(--text-2)">⋄</div><div class="settings-row-body"><h3>Hakkında</h3><p>Matchwork v2.0</p></div><span class="settings-row-right">→</span></div>
        <div class="settings-row" onclick="doLogout()"><div class="settings-row-icon" style="background:var(--danger-dim);color:var(--danger)">✕</div><div class="settings-row-body"><h3 style="color:var(--danger)">Çıkış Yap</h3></div></div>
      </div>
    </div>`, bottomNav(""));
}

/* SETTINGS SUB-SCREENS */
function renderSettingsProfile() {
  return screen(`
    ${topbar("Profil Düzenle", "settings")}
    <div class="screen-body">
      <div class="settings-group">
        <p class="settings-group-title">Kişisel Bilgiler</p>
        <div class="input-group"><label class="input-label">Tam Ad</label>
          <input class="input-field" id="sp-name" value="${user.name}"></div>
        <div class="input-group"><label class="input-label">Rol / Unvan</label>
          <input class="input-field" id="sp-role" value="${user.role}"></div>
        <div class="input-group"><label class="input-label">Konum</label>
          <input class="input-field" id="sp-location" value="${user.location}"></div>
        <div class="input-group"><label class="input-label">Deneyim</label>
          <input class="input-field" id="sp-exp" value="${user.experience}"></div>
        <div class="input-group"><label class="input-label">Müsaitlik</label>
          <input class="input-field" id="sp-avail" value="${user.availability}"></div>
      </div>
      <div class="settings-group">
        <p class="settings-group-title">Yetenekler</p>
        <div class="skill-grid" style="padding:0 2px 12px">
          ${user.skills.map((s,i) => `<span class="skill-chip" onclick="removeSkill(${i})" title="Kaldır">${s} ✕</span>`).join("")}
          <span class="skill-chip" style="border-style:dashed;opacity:.7" onclick="addSkill()">+ Ekle</span>
        </div>
      </div>
      <div style="padding:16px 18px 32px;display:flex;gap:12px">
        <button class="btn btn-ghost" style="flex:1" onclick="go('settings')">Vazgeç</button>
        <button class="btn btn-primary" style="flex:2" onclick="saveProfile()">Kaydet</button>
      </div>
    </div>`);
}

function renderSettingsVerify() {
  return screen(`
    ${topbar("Kimlik Doğrulama", "settings")}
    <div class="screen-body" style="text-align:center;padding-top:48px">
      <div style="width:80px;height:80px;border-radius:50%;background:var(--success-dim);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 20px">✓</div>
      <h2 style="font-size:22px;font-weight:800;margin-bottom:8px">Kimliğin Doğrulandı</h2>
      <p class="body-sm" style="max-width:260px;margin:0 auto 32px;color:var(--text-2)">Kimlik doğrulaman tamamlandı. İşverenler profilinde doğrulama rozetini görebilir.</p>
      <div class="settings-group" style="text-align:left">
        <div class="settings-row"><div class="settings-row-icon" style="background:var(--success-dim);color:var(--success)">✓</div><div class="settings-row-body"><h3>TC Kimlik</h3><p>Doğrulandı · ${new Date().toLocaleDateString('tr-TR')}</p></div></div>
        <div class="settings-row"><div class="settings-row-icon" style="background:var(--success-dim);color:var(--success)">✓</div><div class="settings-row-body"><h3>E-posta</h3><p>selin@demo.com · Doğrulandı</p></div></div>
        <div class="settings-row"><div class="settings-row-icon" style="background:var(--surface-3);color:var(--text-3)">◎</div><div class="settings-row-body"><h3>Telefon</h3><p>Henüz doğrulanmadı</p></div><span class="settings-row-right" style="color:var(--primary);font-size:12px">Doğrula</span></div>
      </div>
    </div>`);
}

function renderSettingsNotifs() {
  const prefs = state.notifPrefs;
  const row = (key, title, sub) => `
    <div class="settings-row" onclick="toggleNotifPref('${key}')">
      <div class="settings-row-body"><h3>${title}</h3><p>${sub}</p></div>
      <div class="toggle${prefs[key]?" on":""}"><div class="toggle-knob"></div></div>
    </div>`;
  return screen(`
    ${topbar("Bildirimler", "settings")}
    <div class="screen-body">
      <div class="settings-group">
        <p class="settings-group-title">Push Bildirimleri</p>
        ${row("match",   "Yeni Eşleşme",          "Biri seni beğendiğinde")}
        ${row("message", "Mesajlar",               "Yeni mesaj geldiğinde")}
        ${row("interview","Görüşme Hatırlatması",  "Görüşme öncesi uyarı")}
      </div>
      <div class="settings-group">
        <p class="settings-group-title">E-posta</p>
        ${row("email",   "Haftalık Özet",          "İş ve eşleşme özeti")}
        ${row("promo",   "Kampanyalar",            "Fırsatlar ve yenilikler")}
      </div>
    </div>`);
}

function renderSettingsPrefs() {
  const types = ["Tam zamanlı","Yarı zamanlı","Serbest","Staj"];
  const radii = ["1 km","3 km","5 km","10 km"];
  return screen(`
    ${topbar("İş Tercihleri", "settings")}
    <div class="screen-body">
      <div class="settings-group">
        <p class="settings-group-title">İş Tipi</p>
        <div class="skill-grid" style="padding:8px 2px 12px">
          ${types.map(t => `<span class="skill-chip${state.prefTypes.includes(t)?" selected":""}" onclick="togglePrefType('${t}')" style="${state.prefTypes.includes(t)?"background:var(--primary-dim);color:var(--primary);border-color:var(--primary)":""}">${t}</span>`).join("")}
        </div>
      </div>
      <div class="settings-group">
        <p class="settings-group-title">Mesafe</p>
        <div style="display:flex;gap:8px;padding:8px 2px 12px;flex-wrap:wrap">
          ${radii.map(r => `<span class="skill-chip${state.prefRadius===r?" selected":""}" onclick="setPrefRadius('${r}')" style="${state.prefRadius===r?"background:var(--primary-dim);color:var(--primary);border-color:var(--primary)":""}">${r}</span>`).join("")}
        </div>
      </div>
      <div style="padding:16px 18px 32px">
        <button class="btn btn-primary btn-full" onclick="go('settings')">Kaydet</button>
      </div>
    </div>`);
}

function renderSettingsLocation() {
  const loc = window.MW?.Location.current || { lat: 40.9906, lng: 29.0250 };
  return screen(`
    ${topbar("Konum", "settings")}
    <div class="screen-body">
      <div class="settings-group">
        <p class="settings-group-title">Mevcut Konum</p>
        <div class="settings-row">
          <div class="settings-row-icon" style="background:var(--primary-dim);color:var(--primary)">◉</div>
          <div class="settings-row-body"><h3>${user.location}</h3><p>${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}</p></div>
        </div>
      </div>
      <div style="padding:16px 18px">
        <button class="btn btn-primary btn-full" onclick="refreshLocation()">
          ${icon("ti-map-pin")} GPS ile Güncelle
        </button>
      </div>
      <div class="settings-group">
        <p class="settings-group-title">Arama Yarıçapı</p>
        <div style="display:flex;gap:8px;padding:8px 2px 12px;flex-wrap:wrap">
          ${["1 km","3 km","5 km","10 km"].map(r => `<span class="skill-chip${state.prefRadius===r?" selected":""}" onclick="setPrefRadius('${r}')" style="${state.prefRadius===r?"background:var(--primary-dim);color:var(--primary);border-color:var(--primary)":""}">${r}</span>`).join("")}
        </div>
      </div>
    </div>`);
}

function renderSettingsAbout() {
  return screen(`
    ${topbar("Hakkında", "settings")}
    <div class="screen-body" style="text-align:center;padding-top:40px">
      <div style="width:64px;height:64px;border-radius:18px;background:var(--primary-dim);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px">✦</div>
      <h2 style="font-size:22px;font-weight:900;margin-bottom:4px">Matchwork</h2>
      <p style="color:var(--text-3);font-size:13px;margin-bottom:32px">Versiyon 2.0.0</p>
      <div class="settings-group" style="text-align:left">
        <p class="settings-group-title">Teknoloji</p>
        <div class="settings-row"><div class="settings-row-icon" style="background:var(--success-dim);color:var(--success)">◈</div><div class="settings-row-body"><h3>Supabase</h3><p>Veritabanı & Auth</p></div></div>
        <div class="settings-row"><div class="settings-row-icon" style="background:var(--primary-dim);color:var(--primary)">⌾</div><div class="settings-row-body"><h3>Socket.io</h3><p>Gerçek zamanlı mesajlaşma</p></div></div>
        <div class="settings-row"><div class="settings-row-icon" style="background:var(--warning-dim);color:var(--warning)">◉</div><div class="settings-row-body"><h3>Leaflet.js</h3><p>İnteraktif harita</p></div></div>
      </div>
      <div class="settings-group" style="text-align:left">
        <p class="settings-group-title">Bağlantılar</p>
        <div class="settings-row"><div class="settings-row-body"><h3>GitHub</h3><p>github.com/kadiryar571-eng/WinderApk</p></div><span class="settings-row-right">↗</span></div>
        <div class="settings-row"><div class="settings-row-body"><h3>Gizlilik Politikası</h3><p>Verileriniz güvende</p></div><span class="settings-row-right">→</span></div>
      </div>
    </div>`);
}

/* INTERVIEW */
function renderInterview() {
  const iv = state.activeInterview || matchItems[2][0] || {};
  const co = iv.name || "Şirket";
  const coInit = iv.initials || co.slice(0,2).toUpperCase();
  const role = iv.role || "Pozisyon";
  const d = new Date(); d.setDate(d.getDate() + 3);
  const dateDay = iv.date || d.getDate();
  const dateMon = iv.month || d.toLocaleDateString("tr-TR",{month:"long",year:"numeric"});
  const time = iv.time || "14:00";
  return screen(`
    ${topbar("Görüşme Detayı", "matches")}
    <div class="screen-body">
      <div class="interview-card">
        <div class="interview-header">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div class="match-avatar" style="width:44px;height:44px">${coInit}</div>
            <div>
              <h3 style="font-weight:800">${co}</h3>
              <p style="font-size:13px;color:var(--text-2)">${role}</p>
            </div>
            <span class="badge badge-warning" style="margin-left:auto">Beklemede</span>
          </div>
        </div>
        <div class="interview-time-block">
          <div>
            <div class="interview-date-big">${dateDay}</div>
            <div class="interview-date-month">${dateMon}</div>
          </div>
          <div>
            <p style="font-size:18px;font-weight:800">${time}</p>
            <p style="font-size:12px;color:var(--text-2)">Görüntülü Görüşme</p>
          </div>
        </div>
        <div style="padding:14px 18px;border-bottom:.5px solid var(--border)">
          <p class="body-sm">Görüşme bağlantısı e-posta ile paylaşılacak. Görüntülü aramaya hazır ol.</p>
        </div>
        <div class="interview-actions">
          <button class="btn btn-danger" style="flex:1" onclick="go('matches')">Reddet</button>
          <button class="btn btn-success" style="flex:2" onclick="go('result')">Onayla</button>
        </div>
      </div>
    </div>`, bottomNav(""));
}

/* NAVIGATION */
function renderNavigation() {
  const job = jobs.find(j => String(j.id) === String(state.detailJobId)) || jobs[0];
  const t = job.travel || { walk:15, bus:6, car:4 };
  const modes = [
    { key:"walk", icon:"♟", label:"Yürüyerek", time:`${t.walk} dk` },
    { key:"bus",  icon:"▣", label:"Otobüs",    time:`${t.bus} dk`  },
    { key:"car",  icon:"◈", label:"Araba",     time:`${t.car} dk`  },
  ];
  return screen(`
    ${topbar("Yol Tarifi", "job-detail")}
    <div class="directions-map">
      <div class="dir-grid"></div>
      <div class="route-visual">
        <div class="route-dots">
          <div class="route-start"></div>
          <div class="route-line-v"></div>
          <div class="route-end"></div>
        </div>
      </div>
      <div class="map-user" style="left:50%;top:60%">
        <div class="user-ring"></div>
        <div class="user-dot"></div>
      </div>
      <div class="map-pin pin-high" style="left:48%;top:30%">
        <div class="pin-bubble">${job.initials}</div>
        <div class="pin-tail"></div>
      </div>
    </div>
    <div class="directions-panel">
      <div>
        <h3 style="font-size:15px;font-weight:700">${job.company}</h3>
        <p class="body-sm">${job.location || "Kadıköy, İstanbul"}</p>
      </div>
      <div class="directions-options">
        ${modes.map(m => `
          <div class="dir-option${state.dirMode===m.key?" active":""}" onclick="setDirMode('${m.key}')">
            <span class="dicon">${m.icon}</span>
            <span class="dtime">${m.time}</span>
            <span class="dlabel">${m.label}</span>
          </div>`).join("")}
      </div>
    </div>`);
}

/* RESULT */
function renderResult() {
  const options = ["İşe Alındım 🎉","Reddedildim","Teklif Bekliyorum","İptal Edildi"];
  return screen(`
    ${topbar("Görüşme Sonucu", "interview")}
    <div class="screen-body" style="padding-top:20px">
      <p style="padding:0 18px 14px;font-size:14px;color:var(--text-2)">${(state.activeInterview?.name || matchItems[2]?.[0]?.name || "Görüşme")} görüşmesi nasıl geçti?</p>
      <div class="result-options">
        ${options.map(o => `
          <button class="result-option${state.selectedResult===o?" selected":""}" onclick="selectResult('${o}')">
            ${o}
          </button>`).join("")}
      </div>
      <div class="stars">
        ${[1,2,3,4,5].map(n => `
          <button class="star-btn${state.rating>=n?" on":""}" onclick="setRating(${n})">★</button>`).join("")}
      </div>
      <div style="padding:20px 18px">
        <button class="btn btn-primary btn-full" onclick="go('matches')">Kaydet</button>
      </div>
    </div>`, bottomNav(""));
}

/* ─── REGISTRATION ───────────────────────────────────────────────── */

const REG_ROLES = [
  { section:"Yiyecek & İçecek",  chips:["Barista","Garson","Aşçı Yardımcısı","Kasa Görevlisi","Şef"] },
  { section:"Satış & Perakende", chips:["Satış Danışmanı","Mağaza Görevlisi","Stokçu"] },
  { section:"Lojistik",          chips:["Kurye","Depo Görevlisi","Dağıtım"] },
  { section:"Güzellik & Bakım",  chips:["Kuaför","Estetisyen","Spa Görevlisi"] },
  { section:"Teknik",            chips:["IT Destek","Teknik Servis","Elektrikçi"] },
  { section:"Temizlik",          chips:["Temizlik Görevlisi","Ev Temizliği"] },
];

const REG_CITIES = ["İstanbul","Ankara","İzmir","Bursa","Antalya"];
const REG_DISTRICTS = {
  "İstanbul":["Kadıköy","Beşiktaş","Şişli","Üsküdar","Fatih","Beyoğlu","Bakırköy","Maltepe"],
  "Ankara":  ["Çankaya","Keçiören","Mamak","Etimesgut","Yenimahalle"],
  "İzmir":   ["Konak","Bornova","Karşıyaka","Buca","Çiğli"],
  "Bursa":   ["Osmangazi","Nilüfer","Yıldırım","Gemlik"],
  "Antalya": ["Muratpaşa","Kepez","Konyaaltı","Döşemealtı"],
};

function getRegInitials() {
  const f = state.register.firstname;
  const l = state.register.lastname;
  if (!f) return user.initials || "SK";
  return ((f[0] || "") + (l?.[0] || "")).toUpperCase();
}

function renderRegisterOTP() {
  const phone = state.register.phone
    ? state.register.phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")
    : "5XX XXX XX XX";
  return `<div class="reg-screen">
    ${obProgress(1, 5)}
    <button class="reg-back" onclick="go('auth')">←</button>
    <div class="reg-copy" style="align-items:center;text-align:center;padding-top:24px">
      <div class="reg-otp-icon">📱</div>
      <h2 class="reg-h1" style="text-align:center">Kodu gir</h2>
      <p class="reg-sub" style="text-align:center">+90 ${phone} numarana<br>4 haneli kod gönderdik.</p>
    </div>
    <div class="ob-otp-inputs">
      <input class="ob-otp-box" id="rotp0" type="tel" inputmode="numeric" maxlength="1"
        oninput="onRegOtpInput(this,0)" onkeydown="onRegOtpKey(event,0)">
      <input class="ob-otp-box" id="rotp1" type="tel" inputmode="numeric" maxlength="1"
        oninput="onRegOtpInput(this,1)" onkeydown="onRegOtpKey(event,1)">
      <input class="ob-otp-box" id="rotp2" type="tel" inputmode="numeric" maxlength="1"
        oninput="onRegOtpInput(this,2)" onkeydown="onRegOtpKey(event,2)">
      <input class="ob-otp-box" id="rotp3" type="tel" inputmode="numeric" maxlength="1"
        oninput="onRegOtpInput(this,3)" onkeydown="onRegOtpKey(event,3)">
    </div>
    <div id="reg-otp-feedback" class="ob-otp-feedback"></div>
    <div class="ob-sticky-bottom" style="border-top:none;padding-top:4px">
      <button class="ob-resend-btn" id="reg-resend" disabled>
        Kodu almadım → <span id="reg-resend-timer">60s</span> sonra tekrar gönder
      </button>
      <button class="reg-minor-btn" onclick="go('auth')">Numarayı değiştir</button>
    </div>
  </div>`;
}

function renderRegisterName() {
  const hasName = state.register.firstname.trim().length >= 2;
  return `<div class="reg-screen">
    ${obProgress(2, 5)}
    <button class="reg-back" onclick="go('register-otp')">←</button>
    <div class="reg-avatar-area">
      <div class="reg-avatar" id="reg-avatar-circle">${getRegInitials()}</div>
      <button class="reg-avatar-change" onclick="cycleAvatarColor()">Rengi değiştir</button>
    </div>
    <div class="reg-copy">
      <h2 class="reg-h1">Adın ne?</h2>
      <p class="reg-sub">Profil kartında görünecek.</p>
    </div>
    <div class="reg-form">
      <div class="input-group">
        <label class="input-label">Ad</label>
        <input class="input-field" id="reg-firstname" type="text"
          autocapitalize="words" autocomplete="given-name"
          placeholder="Ad" value="${state.register.firstname}"
          oninput="onRegNameInput(this)">
      </div>
      <div class="input-group">
        <label class="input-label" style="color:var(--text-3)">Soyad (opsiyonel)</label>
        <input class="input-field" id="reg-lastname" type="text"
          autocapitalize="words" autocomplete="family-name"
          placeholder="Soyad" value="${state.register.lastname}"
          oninput="state.register.lastname=this.value;updateRegAvatar()">
      </div>
      <p class="ob-legal">İsmini daha sonra değiştirebilirsin.</p>
    </div>
    <div class="ob-sticky-bottom" style="border-top:none">
      <button class="btn btn-primary btn-full ob-btn${hasName ? "" : " disabled"}"
        id="reg-name-btn" ${hasName ? "" : "disabled"} onclick="go('register-role')">
        Devam Et →
      </button>
    </div>
  </div>`;
}

function renderRegisterRole() {
  const sel = state.register.skills;
  return `<div class="reg-screen">
    ${obProgress(3, 5)}
    <button class="reg-back" onclick="go('register-name')">←</button>
    <div class="reg-mini-profile">
      <div class="reg-mini-avatar">${getRegInitials()}</div>
      <span class="reg-mini-name">${state.register.firstname || "Sen"}</span>
    </div>
    <div class="reg-copy" style="padding-top:10px">
      <h2 class="reg-h1">Ne işler yapıyorsun?</h2>
      <p class="reg-sub">İşverenler seni bu alanlarda arar.</p>
    </div>
    <div class="reg-roles-body">
      ${REG_ROLES.map(g => `
        <div class="reg-role-section">
          <p class="reg-role-label">${g.section}</p>
          <div class="reg-role-chips">
            ${g.chips.map(c => `
              <span class="ob-chip${sel.includes(c) ? " active" : ""}" onclick="toggleRegSkill('${c}')">
                ${sel.includes(c) ? "✓ " : ""}${c}
              </span>`).join("")}
          </div>
        </div>`).join("")}
    </div>
    <div class="ob-sticky-bottom">
      <div class="ob-count">${sel.length > 0 ? `${sel.length} beceri seçildi` : "En az 1 seç"}</div>
      <button class="btn btn-primary btn-full ob-btn${sel.length === 0 ? " disabled" : ""}"
        ${sel.length === 0 ? "disabled" : ""} onclick="goToRegisterLocation()">
        Profilimi Oluştur →
      </button>
      <button class="reg-skip-btn" onclick="goToRegisterLocation()">Şimdi değil, sonra eklerim</button>
    </div>
  </div>`;
}

function renderRegisterLocation() {
  const city = state.register.city;
  const district = state.register.district;
  const districts = REG_DISTRICTS[city] || [];
  return `<div class="reg-screen">
    ${obProgress(4, 5)}
    <button class="reg-back" onclick="go('register-role')">←</button>
    <div class="reg-copy" style="align-items:center;text-align:center;padding-top:16px">
      <div class="reg-loc-icon">📍</div>
      <h2 class="reg-h1" style="text-align:center">Çalışmak istediğin<br>bölge hangisi?</h2>
      <p class="reg-sub" style="text-align:center">Yakınındaki fırsatları sana göstereceğiz.</p>
    </div>
    <div class="reg-loc-body">
      <p class="reg-role-label">Şehir</p>
      <div class="reg-city-grid">
        ${REG_CITIES.map(c => `
          <div class="reg-city-card${city === c ? " selected" : ""}" onclick="selectRegCity('${c}')">
            ${c}${city === c ? '<span class="reg-city-check">✓</span>' : ""}
          </div>`).join("")}
      </div>
      ${districts.length ? `
        <p class="reg-role-label" style="margin-top:18px">İlçe</p>
        <div class="reg-role-chips" id="reg-district-chips">
          ${districts.map(d => `
            <span class="ob-chip${district === d ? " active" : ""}" onclick="selectRegDistrict('${d}')">${d}</span>`).join("")}
        </div>` : ""}
    </div>
    <div class="ob-sticky-bottom" style="border-top:none">
      <button class="btn btn-primary btn-full ob-btn" onclick="finishRegistration()">Hazırım →</button>
    </div>
  </div>`;
}

function renderRegisterSuccess() {
  const fullName = [state.register.firstname, state.register.lastname].filter(Boolean).join(" ");
  const loc = state.register.district || state.register.city || "Kadıköy";
  setTimeout(() => {
    const el = document.getElementById("reg-count-num");
    if (!el) return;
    let n = 0; const target = jobs.length;
    const t = setInterval(() => { n = Math.min(n+1, target); el.textContent = n; if (n >= target) clearInterval(t); }, 55);
  }, 400);
  return `<div class="reg-screen reg-success anim-fade-in">
    <div class="ob-confetti">${_generateConfetti()}</div>
    <div class="reg-success-hero">
      <div class="reg-success-avatar">${getRegInitials()}</div>
      <div style="text-align:center">
        <div class="ob-count-num" id="reg-count-num">0</div>
        <div class="ob-count-label">fırsat seni bekliyor</div>
        <p class="ob-count-sub" style="margin-top:6px">${state.register.firstname || user.short}, ${loc}'ye hoş geldin.</p>
      </div>
    </div>
    <div class="reg-profile-card">
      <div class="reg-card-avatar">${getRegInitials()}</div>
      <div class="reg-card-info">
        <h3>${fullName || user.name}</h3>
        <p>${state.register.skills.slice(0,2).join(" · ") || user.role}</p>
        <p class="reg-card-loc">📍 ${loc} · ✓ Doğrulandı</p>
      </div>
      <button class="reg-card-edit" onclick="go('settings-profile')">Düzenle →</button>
    </div>
    <div class="ob-sticky-bottom ob-success-actions" style="border-top:none">
      <button class="btn btn-primary btn-full ob-btn ob-btn-pulse" onclick="completeRegistration()">
        Keşfetmeye Başla →
      </button>
    </div>
  </div>`;
}

/* ─── REGISTRATION HELPERS ──────────────────────────────────────── */

function formatAuthPhone(input) {
  let raw = input.value.replace(/\D/g, "");
  if (raw.length > 10) raw = raw.slice(0, 10);
  let fmt = raw;
  if (raw.length > 3) fmt = raw.slice(0,3) + " " + raw.slice(3);
  if (raw.length > 6) fmt = raw.slice(0,3) + " " + raw.slice(3,6) + " " + raw.slice(6);
  if (raw.length > 8) fmt = raw.slice(0,3) + " " + raw.slice(3,6) + " " + raw.slice(6,8) + " " + raw.slice(8);
  input.value = fmt;
  state.register.phone = raw;
  const btn = document.getElementById("auth-phone-btn");
  if (btn) btn.disabled = raw.length < 10;
}

function submitAuthPhone() {
  if (state.register.phone.length < 10) return;
  go("register-otp");
}

let _regOtpTimer = null;
function startRegOtpTimer() {
  let secs = 60;
  const timerEl = document.getElementById("reg-resend-timer");
  const btn = document.getElementById("reg-resend");
  if (_regOtpTimer) clearInterval(_regOtpTimer);
  _regOtpTimer = setInterval(() => {
    secs--;
    if (timerEl) timerEl.textContent = `${secs}s`;
    if (secs <= 0) {
      clearInterval(_regOtpTimer);
      if (btn) { btn.disabled = false; btn.innerHTML = `Kodu almadım → <u>Yeniden gönder</u>`; }
    }
  }, 1000);
}

function onRegOtpInput(el, idx) {
  el.value = el.value.replace(/\D/g, "");
  if (el.value && idx < 3) document.getElementById(`rotp${idx+1}`)?.focus();
  const code = [0,1,2,3].map(i => document.getElementById(`rotp${i}`)?.value || "").join("");
  if (code.length === 4) {
    [0,1,2,3].forEach(i => {
      const b = document.getElementById(`rotp${i}`);
      if (b) { b.style.borderColor = "var(--success)"; b.style.background = "var(--success-dim)"; }
    });
    const fb = document.getElementById("reg-otp-feedback");
    if (fb) { fb.textContent = "✓ Doğrulandı"; fb.className = "ob-otp-feedback ob-otp-success"; }
    state.register.otpVerified = true;
    setTimeout(() => go("register-name"), 700);
  }
}

function onRegOtpKey(e, idx) {
  if (e.key === "Backspace" && !e.target.value && idx > 0) {
    document.getElementById(`rotp${idx-1}`)?.focus();
  }
}

function onRegNameInput(input) {
  state.register.firstname = input.value;
  updateRegAvatar();
  const btn = document.getElementById("reg-name-btn");
  if (btn) {
    const ok = input.value.trim().length >= 2;
    btn.disabled = !ok;
    btn.classList.toggle("disabled", !ok);
  }
}

function updateRegAvatar() {
  const el = document.getElementById("reg-avatar-circle");
  if (el) el.textContent = getRegInitials() || "?";
}

const _avatarColors = ["var(--primary)","var(--success)","#8B5CFF","#F59E0B","#06B6D4","#EC4899","#10B981","#EF4444"];
let _avatarColorIdx = 0;
function cycleAvatarColor() {
  _avatarColorIdx = (_avatarColorIdx + 1) % _avatarColors.length;
  const el = document.getElementById("reg-avatar-circle");
  if (el) el.style.background = _avatarColors[_avatarColorIdx];
}

function toggleRegSkill(skill) {
  const skills = state.register.skills;
  const idx = skills.indexOf(skill);
  if (idx >= 0) skills.splice(idx, 1);
  else if (skills.length < 5) skills.push(skill);
  document.querySelectorAll(".reg-role-chips .ob-chip").forEach(chip => {
    const raw = chip.textContent.replace(/^✓\s*/, "").trim();
    if (raw !== skill) return;
    const active = skills.includes(skill);
    chip.classList.toggle("active", active);
    chip.textContent = (active ? "✓ " : "") + skill;
  });
  const countEl = document.querySelector(".ob-count");
  if (countEl) countEl.textContent = skills.length > 0 ? `${skills.length} beceri seçildi` : "En az 1 seç";
  const btn = document.querySelector(".ob-sticky-bottom .ob-btn");
  if (btn) { btn.disabled = skills.length === 0; btn.classList.toggle("disabled", skills.length === 0); }
}

function goToRegisterLocation() {
  if (window.MW?.Location?.current) {
    finishRegistration();
  } else {
    go("register-location");
  }
}

function selectRegCity(city) {
  state.register.city = city;
  state.register.district = "";
  render();
}

function selectRegDistrict(district) {
  state.register.district = district;
  document.querySelectorAll("#reg-district-chips .ob-chip").forEach(c => {
    c.classList.toggle("active", c.textContent.trim() === district);
  });
}

function finishRegistration() {
  if (state.register.firstname) {
    user.name = [state.register.firstname, state.register.lastname].filter(Boolean).join(" ");
    user.short = state.register.firstname;
    user.initials = getRegInitials();
  }
  if (state.register.skills.length) {
    user.skills = [...state.register.skills, ...user.skills.filter(s => !state.register.skills.includes(s))];
    user.role = state.register.skills.slice(0, 2).join(" · ");
  }
  if (state.register.district || state.register.city) {
    user.location = [state.register.district, state.register.city].filter(Boolean).join(", ");
  }
  go("register-success");
}

function completeRegistration() {
  localStorage.setItem("mw_onboarding_done", "1");
  go("home");
}

/* ─── ONBOARDING ────────────────────────────────────────────────── */

function obProgress(step, total = 5) {
  return `<div class="ob-progress">${Array.from({length: total}, (_,i) =>
    `<div class="ob-dot${i < step ? " done" : i === step ? " active" : ""}"></div>`
  ).join("")}</div>`;
}

function renderOnboardingSplash() {
  setTimeout(() => {
    if (currentRoute() === "onboarding-splash") go("onboarding-welcome");
  }, 2200);
  return `<div class="ob-screen ob-splash anim-fade-in">
    <div class="ob-splash-content">
      <div class="ob-splash-logo-wrap">
        <div class="ob-splash-radar ob-splash-radar-1"></div>
        <div class="ob-splash-radar ob-splash-radar-2"></div>
        <div class="ob-splash-mark">✦</div>
      </div>
      <h1 class="ob-splash-title">Matchwork</h1>
    </div>
  </div>`;
}

function _cityPreviewCards() {
  return [
    {title:"Cafe Lumiere", score:92, dist:"1.2 km", delay:"0s"},
    {title:"ModaPlus", score:88, dist:"0.8 km", delay:".3s"},
    {title:"NetCall", score:82, dist:"2.1 km", delay:".6s"},
  ].map(c => `
    <div class="city-preview-card" style="animation-delay:${c.delay}">
      <span class="city-card-score ${c.score>=85?"score-green":"score-blue"}">${c.score}%</span>
      <span class="city-card-title">${c.title}</span>
      <span class="city-card-dist">📍 ${c.dist}</span>
    </div>`).join("");
}

function renderOnboardingWelcome() {
  return `<div class="ob-screen ob-welcome">
    <div class="ob-city-anim">
      <div class="city-grid-lines">
        <div class="cgl cgl-h" style="top:30%"></div>
        <div class="cgl cgl-h" style="top:58%"></div>
        <div class="cgl cgl-h" style="top:80%"></div>
        <div class="cgl cgl-v" style="left:25%"></div>
        <div class="cgl cgl-v" style="left:62%"></div>
        <div class="cgl cgl-v" style="left:85%"></div>
        <div class="city-user-pin"></div>
      </div>
      <div class="city-cards-preview">${_cityPreviewCards()}</div>
    </div>
    <div class="ob-welcome-copy">
      <h1 class="ob-headline">Çevrende iş var.<br>Henüz haberdar değilsin.</h1>
      <p class="ob-subline">Matchwork yakınındaki fırsatları bulur,<br>seni doğru işe saniyeler içinde eşleştirir.</p>
      <div class="ob-actions">
        <button class="btn btn-primary btn-full ob-btn" onclick="go('onboarding-location')">Başlayalım →</button>
        <button class="btn btn-ghost btn-full ob-btn-sec" onclick="go('auth')">Zaten hesabım var</button>
      </div>
    </div>
  </div>`;
}

function renderOnboardingLocation() {
  const pins = [
    {label:"1.2 km",x:"70%",y:"25%",d:".1s"},
    {label:"0.8 km",x:"18%",y:"33%",d:".4s"},
    {label:"2.1 km",x:"74%",y:"70%",d:".7s"},
    {label:"1.7 km",x:"14%",y:"68%",d:"1s"},
  ];
  return `<div class="ob-screen">
    ${obProgress(0)}
    <div class="ob-hero ob-loc-hero">
      <div class="ob-loc-anim">
        <div class="ob-loc-ring ob-loc-ring-1"></div>
        <div class="ob-loc-ring ob-loc-ring-2"></div>
        <div class="ob-loc-ring ob-loc-ring-3"></div>
        <div class="ob-loc-center">📍</div>
        ${pins.map(p=>`<div class="ob-loc-pin" style="left:${p.x};top:${p.y};animation-delay:${p.d}">${p.label}</div>`).join("")}
      </div>
    </div>
    <div class="ob-copy">
      <h2 class="ob-h2">Sana yakın fırsatlar için<br>konumunu paylaş</h2>
      <p class="ob-body">🔒 Yalnızca uygulama açıkken kullanılır.<br>Konumun hiçbir işveren ile paylaşılmaz.</p>
      <div class="ob-actions">
        <button class="btn btn-primary btn-full ob-btn" onclick="requestLocationPermission()">Konumuma İzin Ver</button>
        <button class="btn btn-ghost btn-full ob-btn-sec" onclick="go('onboarding-type')">Şimdi değil</button>
      </div>
    </div>
  </div>`;
}

function renderOnboardingType() {
  const t = state.onboarding.userType;
  return `<div class="ob-screen">
    ${obProgress(1)}
    <div class="ob-copy ob-type-copy">
      <h2 class="ob-h2">Sen kimsin?</h2>
      <p class="ob-body">Deneyimini buna göre kişiselleştireceğiz.</p>
    </div>
    <div class="ob-type-cards">
      <div class="ob-type-card${t==="seeker"?" selected":""}" onclick="selectUserType('seeker')">
        <div class="ob-type-icon">👤</div>
        <h3>Fırsat Arıyorum</h3>
        <p>Yakınımdaki işleri keşfet, hızla eşleş, başla.</p>
        ${t==="seeker"?'<div class="ob-type-check">✓</div>':""}
      </div>
      <div class="ob-type-card${t==="business"?" selected":""}" onclick="selectUserType('business')">
        <div class="ob-type-icon">🏢</div>
        <h3>Eleman Arıyorum</h3>
        <p>Doğru kişiyi bul, davet et, bugün çalıştır.</p>
        ${t==="business"?'<div class="ob-type-check">✓</div>':""}
      </div>
    </div>
  </div>`;
}

const OB_CATEGORIES = [
  {icon:"☕",label:"Kafe & Restoran"},
  {icon:"🛍️",label:"Perakende & Satış"},
  {icon:"🍳",label:"Mutfak & Aşçılık"},
  {icon:"📦",label:"Lojistik & Depo"},
  {icon:"💆",label:"Güzellik & Spa"},
  {icon:"🎨",label:"Yaratıcı & Tasarım"},
  {icon:"🔧",label:"Teknik & Tamir"},
  {icon:"👶",label:"Bakım & Eğitim"},
  {icon:"🏋️",label:"Sağlık & Spor"},
  {icon:"🧹",label:"Temizlik & Bakım"},
  {icon:"🎪",label:"Etkinlik & Org."},
  {icon:"➕",label:"Diğer"},
];

function renderOnboardingCategories() {
  const sel = state.onboarding.categories;
  return `<div class="ob-screen">
    ${obProgress(2)}
    <div class="ob-copy" style="padding-bottom:0">
      <h2 class="ob-h2">Ne tür işler seni<br>heyecanlandırır?</h2>
      <p class="ob-body" style="margin-bottom:0">En az 1 kategori seç. İstediğin kadar ekleyebilirsin.</p>
    </div>
    <div class="ob-cat-grid">
      ${OB_CATEGORIES.map(c => `
        <div class="ob-cat-item${sel.includes(c.label)?" selected":""}" onclick="toggleCategory('${c.label}')">
          <span class="ob-cat-icon">${c.icon}</span>
          <span class="ob-cat-label">${c.label}</span>
          ${sel.includes(c.label)?'<div class="ob-cat-check">✓</div>':""}
        </div>`).join("")}
    </div>
    <div class="ob-sticky-bottom">
      <div class="ob-count">${sel.length > 0 ? `${sel.length} kategori seçildi` : "Kategori seç"}</div>
      <button class="btn btn-primary btn-full ob-btn${sel.length===0?" disabled":""}"
        ${sel.length===0?"disabled":""} onclick="go('onboarding-prefs')">Devam Et →</button>
    </div>
  </div>`;
}

function renderOnboardingPrefs() {
  const ob = state.onboarding;
  const workOpts = ["Tam zamanlı", "Yarı zamanlı", "Günlük / Gig"];
  return `<div class="ob-screen">
    ${obProgress(3)}
    <div class="ob-copy" style="padding-bottom:0">
      <h2 class="ob-h2">Nasıl çalışmak istersin?</h2>
      <p class="ob-body" style="margin-bottom:0">Bunları istediğin zaman değiştirebilirsin.</p>
    </div>
    <div class="ob-prefs-body">
      <div class="ob-pref-section">
        <p class="ob-pref-label">Ne kadar uzağa gidebilirsin?</p>
        <div class="ob-slider-wrap">
          <input type="range" class="ob-slider" id="ob-dist-slider" min="1" max="15" value="${ob.distance}"
            oninput="updateObDistance(this.value)">
          <div class="ob-slider-val" id="ob-dist-val">${ob.distance} km</div>
        </div>
        <div class="ob-quick-chips">
          ${[1,3,5,10].map(v=>`<span class="ob-chip${ob.distance==v?" active":""}" onclick="updateObDistance(${v})">${v} km</span>`).join("")}
          <span class="ob-chip${ob.distance>10?" active":""}">10+ km</span>
        </div>
      </div>
      <div class="ob-pref-section">
        <p class="ob-pref-label">Çalışma şekli</p>
        <div class="ob-quick-chips" id="ob-work-chips">
          ${workOpts.map(w=>`<span class="ob-chip${ob.workTypes.includes(w)?" active":""}" onclick="toggleObWorkType('${w}')">${w}</span>`).join("")}
        </div>
      </div>
      <div class="ob-pref-section">
        <p class="ob-pref-label">Günlük minimum kaç ₺ bekliyorsun?</p>
        <div class="ob-slider-wrap">
          <input type="range" class="ob-slider" id="ob-sal-slider" min="300" max="2000" step="50" value="${ob.minSalary}"
            oninput="updateObSalary(this.value)">
          <div class="ob-slider-val" id="ob-sal-val">₺${ob.minSalary} ve üzeri</div>
        </div>
      </div>
    </div>
    <div class="ob-sticky-bottom" style="border-top:none">
      <button class="btn btn-primary btn-full ob-btn" onclick="go('onboarding-account')">Fırsatları Göster →</button>
    </div>
  </div>`;
}

function renderOnboardingAccount() {
  return `<div class="ob-screen">
    ${obProgress(4)}
    <div class="ob-copy">
      <h2 class="ob-h2">Neredeyse hazırsın.</h2>
      <p class="ob-body">Hesabını oluştur, fırsatlara eriş.</p>
    </div>
    <div class="ob-form">
      <div class="input-group">
        <label class="input-label">Ad Soyad</label>
        <input class="input-field ob-input" id="ob-name" type="text" placeholder="Ad Soyad"
          value="${state.onboarding.name}"
          oninput="state.onboarding.name=this.value;updateObAccountBtn()">
      </div>
      <div class="input-group">
        <label class="input-label">Telefon</label>
        <div class="ob-phone-wrap">
          <span class="ob-phone-prefix">🇹🇷 +90</span>
          <input class="input-field ob-phone-input" id="ob-phone" type="tel"
            placeholder="5XX XXX XX XX" maxlength="14"
            value="${state.onboarding.phone}"
            oninput="state.onboarding.phone=this.value;updateObAccountBtn()">
        </div>
      </div>
      <div class="input-group">
        <label class="input-label" style="color:var(--text-3)">E-posta (opsiyonel)</label>
        <input class="input-field ob-input" type="email" placeholder="E-posta" style="opacity:.6">
      </div>
      <p class="ob-legal">Devam ederek <u>Kullanım Koşulları</u> ve <u>Gizlilik Politikası</u>'nı kabul ediyorsun.</p>
    </div>
    <div class="ob-sticky-bottom" style="border-top:none">
      <button class="btn btn-primary btn-full ob-btn" id="ob-account-btn"
        onclick="go('onboarding-otp')" disabled>Doğrulama Kodu Gönder</button>
    </div>
  </div>`;
}

function renderOnboardingOTP() {
  const phone = state.onboarding.phone || "5XX XXX XX XX";
  return `<div class="ob-screen">
    ${obProgress(4)}
    <div class="ob-copy" style="align-items:center;text-align:center">
      <div class="ob-otp-icon">📱</div>
      <h2 class="ob-h2" style="text-align:center">Kodu gir</h2>
      <p class="ob-body" style="text-align:center">+90 ${phone} numarana<br>4 haneli kod gönderdik</p>
    </div>
    <div class="ob-otp-inputs">
      <input class="ob-otp-box" id="otp0" type="tel" maxlength="1"
        oninput="onOtpInput(this,0)" onkeydown="onOtpKey(event,0)">
      <input class="ob-otp-box" id="otp1" type="tel" maxlength="1"
        oninput="onOtpInput(this,1)" onkeydown="onOtpKey(event,1)">
      <input class="ob-otp-box" id="otp2" type="tel" maxlength="1"
        oninput="onOtpInput(this,2)" onkeydown="onOtpKey(event,2)">
      <input class="ob-otp-box" id="otp3" type="tel" maxlength="1"
        oninput="onOtpInput(this,3)" onkeydown="onOtpKey(event,3)">
    </div>
    <div id="ob-otp-feedback" class="ob-otp-feedback"></div>
    <div class="ob-sticky-bottom" style="border-top:none;padding-top:8px">
      <button class="ob-resend-btn" id="ob-resend" disabled>
        Kodu almadım → <span id="ob-resend-timer">60s</span> sonra tekrar gönder
      </button>
    </div>
  </div>`;
}

function _generateConfetti() {
  const colors = ["var(--primary)","var(--success)","var(--warning)","#ff6b9d","#4ecdc4"];
  return Array.from({length:28}, () => {
    const x = (Math.random()*100).toFixed(1);
    const delay = (Math.random()*1.4).toFixed(2);
    const dur = (1.4 + Math.random()*.8).toFixed(2);
    const size = 4 + Math.floor(Math.random()*6);
    const color = colors[Math.floor(Math.random()*colors.length)];
    return `<div class="confetti-piece" style="left:${x}%;animation-delay:${delay}s;animation-duration:${dur}s;width:${size}px;height:${size}px;background:${color}"></div>`;
  }).join("");
}

function renderOnboardingSuccess() {
  setTimeout(() => {
    const el = document.getElementById("ob-count-num");
    if (!el) return;
    let n = 0;
    const target = jobs.length;
    const t = setInterval(() => {
      n = Math.min(n+1, target);
      el.textContent = n;
      if (n >= target) clearInterval(t);
    }, 55);
  }, 350);

  return `<div class="ob-screen ob-success anim-fade-in">
    <div class="ob-confetti">${_generateConfetti()}</div>
    <div class="ob-success-hero">
      <div class="ob-count-display">
        <span class="ob-count-num" id="ob-count-num">0</span>
        <span class="ob-count-label">fırsat seni bekliyor</span>
      </div>
      <p class="ob-count-sub">Kadıköy ve çevresinde</p>
    </div>
    <div class="ob-preview-cards">
      ${jobs.slice(0,3).map(j => `
        <div class="ob-preview-card" onclick="finishOnboarding();openJob(${j.id},'home')">
          <span class="ob-prev-score ${j.matchScore>=85?"score-green":"score-blue"}">${j.matchScore}%</span>
          <span class="ob-prev-init">${j.initials}</span>
          <span class="ob-prev-title">${j.company}</span>
          <span class="ob-prev-dist">📍 ${j.distance} km</span>
        </div>`).join("")}
    </div>
    <div class="ob-sticky-bottom ob-success-actions" style="border-top:none">
      <button class="btn btn-primary btn-full ob-btn ob-btn-pulse" onclick="finishOnboarding()">
        Fırsatları Keşfet →
      </button>
    </div>
  </div>`;
}

/* ─── ONBOARDING HELPERS ────────────────────────────────────────── */

function requestLocationPermission() {
  if (!navigator.geolocation) { go("onboarding-type"); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      if (window.MW?.Location) {
        window.MW.Location.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
      go("onboarding-type");
    },
    () => go("onboarding-type"),
    { timeout: 8000 }
  );
}

function selectUserType(type) {
  state.onboarding.userType = type;
  render();
  setTimeout(() => go("onboarding-categories"), 350);
}

function toggleCategory(label) {
  const cats = state.onboarding.categories;
  const idx = cats.indexOf(label);
  if (idx >= 0) cats.splice(idx, 1);
  else cats.push(label);
  const items = document.querySelectorAll(".ob-cat-item");
  items.forEach(item => {
    const lbl = item.querySelector(".ob-cat-label")?.textContent;
    if (lbl !== label) return;
    const active = cats.includes(label);
    item.classList.toggle("selected", active);
    const existing = item.querySelector(".ob-cat-check");
    if (active && !existing) {
      const d = document.createElement("div");
      d.className = "ob-cat-check"; d.textContent = "✓";
      item.appendChild(d);
    } else if (!active && existing) {
      existing.remove();
    }
  });
  const countEl = document.querySelector(".ob-count");
  if (countEl) countEl.textContent = cats.length > 0 ? `${cats.length} kategori seçildi` : "Kategori seç";
  const btn = document.querySelector(".ob-sticky-bottom .ob-btn");
  if (btn) { btn.disabled = cats.length === 0; btn.classList.toggle("disabled", cats.length === 0); }
}

function updateObDistance(val) {
  state.onboarding.distance = +val;
  const slider = document.getElementById("ob-dist-slider");
  const valEl = document.getElementById("ob-dist-val");
  if (slider) slider.value = val;
  if (valEl) valEl.textContent = `${val} km`;
  const chips = document.querySelectorAll("#ob-dist-slider ~ .ob-quick-chips .ob-chip, .ob-quick-chips .ob-chip");
  // simpler: re-evaluate all chips in first pref section
  document.querySelectorAll(".ob-pref-section:first-child .ob-chip").forEach((c,i) => {
    const v = [1,3,5,10][i];
    if (v !== undefined) c.classList.toggle("active", v == val);
  });
}

function toggleObWorkType(type) {
  const wt = state.onboarding.workTypes;
  const idx = wt.indexOf(type);
  if (idx >= 0 && wt.length > 1) wt.splice(idx, 1);
  else if (idx < 0) wt.push(type);
  document.querySelectorAll("#ob-work-chips .ob-chip").forEach(c => {
    c.classList.toggle("active", wt.includes(c.textContent.trim()));
  });
}

function updateObSalary(val) {
  state.onboarding.minSalary = +val;
  const valEl = document.getElementById("ob-sal-val");
  if (valEl) valEl.textContent = `₺${val} ve üzeri`;
}

function updateObAccountBtn() {
  const btn = document.getElementById("ob-account-btn");
  if (!btn) return;
  const hasName = state.onboarding.name.trim().length > 1;
  const hasPhone = state.onboarding.phone.replace(/\D/g,"").length >= 10;
  btn.disabled = !(hasName && hasPhone);
}

let _otpResendTimer = null;
function startOtpTimer() {
  let secs = 60;
  const timerEl = document.getElementById("ob-resend-timer");
  const btn = document.getElementById("ob-resend");
  _otpResendTimer = setInterval(() => {
    secs--;
    if (timerEl) timerEl.textContent = `${secs}s`;
    if (secs <= 0) {
      clearInterval(_otpResendTimer);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `Kodu almadım → <u>Yeniden gönder</u>`;
      }
    }
  }, 1000);
}

function onOtpInput(el, idx) {
  el.value = el.value.replace(/\D/g,"");
  if (el.value && idx < 3) document.getElementById(`otp${idx+1}`)?.focus();
  // check complete
  const code = [0,1,2,3].map(i => document.getElementById(`otp${i}`)?.value || "").join("");
  if (code.length === 4) {
    const fb = document.getElementById("ob-otp-feedback");
    if (fb) { fb.textContent = "✓ Doğrulandı"; fb.className = "ob-otp-feedback ob-otp-success"; }
    setTimeout(() => go("onboarding-success"), 600);
  }
}

function onOtpKey(e, idx) {
  if (e.key === "Backspace" && !e.target.value && idx > 0) {
    document.getElementById(`otp${idx-1}`)?.focus();
  }
}

function finishOnboarding() {
  localStorage.setItem("mw_onboarding_done", "1");
  if (state.onboarding.name.trim()) {
    user.name = state.onboarding.name.trim();
    user.short = user.name.split(" ")[0];
    user.initials = user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  }
  go("home");
}

function resetOnboarding() {
  localStorage.removeItem("mw_onboarding_done");
  state.onboarding = { userType:null, categories:[], distance:5, workTypes:["Yarı zamanlı"], minSalary:550, name:"", phone:"" };
  go("onboarding-splash");
}

/* ─── ROUTER MAP ─────────────────────────────────────────────────── */
const routes = {
  "register-otp":      renderRegisterOTP,
  "register-name":     renderRegisterName,
  "register-role":     renderRegisterRole,
  "register-location": renderRegisterLocation,
  "register-success":  renderRegisterSuccess,
  "onboarding-splash":     renderOnboardingSplash,
  "onboarding-welcome":    renderOnboardingWelcome,
  "onboarding-location":   renderOnboardingLocation,
  "onboarding-type":       renderOnboardingType,
  "onboarding-categories": renderOnboardingCategories,
  "onboarding-prefs":      renderOnboardingPrefs,
  "onboarding-account":    renderOnboardingAccount,
  "onboarding-otp":        renderOnboardingOTP,
  "onboarding-success":    renderOnboardingSuccess,
  auth:          renderAuth,
  home:          renderHome,
  nearby:        renderNearby,
  discover:      renderDiscover,
  "job-detail":  renderJobDetail,
  match:         renderMatch,
  notifications: renderNotifications,
  matches:       renderMatches,
  messages:      renderMessages,
  chat:          renderChat,
  profile:       renderProfile,
  settings:      renderSettings,
  interview:          renderInterview,
  navigation:         renderNavigation,
  result:             renderResult,
  "settings-profile": renderSettingsProfile,
  "settings-verify":  renderSettingsVerify,
  "settings-notifs":  renderSettingsNotifs,
  "settings-prefs":   renderSettingsPrefs,
  "settings-location":renderSettingsLocation,
  "settings-about":   renderSettingsAbout,
};

/* ─── RENDER ─────────────────────────────────────────────────────── */
function render() {
  const route = currentRoute();
  const fn = routes[route] || renderHome;
  document.getElementById("app").innerHTML = fn();
  if (route === "discover") initSwipeListeners();
  if (route === "chat") {
    const list = document.getElementById("messages-list");
    if (list) list.scrollTop = list.scrollHeight;
  }
  if (route === "messages") {
    requestAnimationFrame(() => loadMatchesList());
  }
  if (route === "register-otp") {
    requestAnimationFrame(() => {
      document.getElementById("rotp0")?.focus();
      startRegOtpTimer();
    });
  }
  if (route === "onboarding-otp") {
    requestAnimationFrame(() => {
      document.getElementById("otp0")?.focus();
      startOtpTimer();
    });
  }
  if (route === "nearby") {
    requestAnimationFrame(() => {
      initLeafletMap();
      // Restore sheet state
      const sheet = document.getElementById("map-sheet");
      if (sheet && state.sheetState === "mid") sheet.classList.add("sheet-mid");
      else if (sheet && state.sheetState === "expanded") sheet.classList.add("sheet-expanded");
      // Restore selected pin route if any
      if (state.selectedPin) {
        const job = jobs.find(j => j.id === state.selectedPin);
        if (job) drawMapRoute(job);
      }
    });
  }
  // Rota değişince eski haritayı temizle
  if (route !== "nearby" && _leafletMap) {
    _leafletMap.remove();
    _leafletMap = null;
    _leafletMarkers = {};
  }
}

/* ─── SWIPE ENGINE ───────────────────────────────────────────────── */
const SWIPE_THRESHOLD = 80;
const UP_THRESHOLD    = 90;

function initSwipeListeners() {
  const card = document.getElementById("top-card");
  if (!card) return;
  card.addEventListener("pointerdown", onDragStart, { passive:false });
  document.addEventListener("pointermove", onDragMove, { passive:false });
  document.addEventListener("pointerup",   onDragEnd);
  document.addEventListener("pointercancel", () => snapBack(card));
  card.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") swipeCard("right");
    if (e.key === "ArrowLeft")  swipeCard("left");
    if (e.key === "ArrowUp")    openJob(currentSwipeJob()?.id || 1, "discover");
  });
  card.setAttribute("tabindex","0");
  card.setAttribute("role","article");
}

function onDragStart(e) {
  const sw = state.swipe;
  sw.isDragging = true;
  sw.startX = e.clientX; sw.startY = e.clientY;
  sw.currentDeltaX = 0; sw.currentDeltaY = 0;
  sw.thresholdReached = false; sw.directionLocked = null;
  sw.activeCard = document.getElementById("top-card");
  if (sw.activeCard) sw.activeCard.setPointerCapture(e.pointerId);
  e.preventDefault();
}

function onDragMove(e) {
  const sw = state.swipe;
  if (!sw.isDragging || !sw.activeCard) return;
  const dx = e.clientX - sw.startX;
  const dy = e.clientY - sw.startY;
  sw.currentDeltaX = dx;
  sw.currentDeltaY = dy;
  const absDx = Math.abs(dx), absDy = Math.abs(dy);

  if (!sw.directionLocked) {
    if (absDx > 8 || absDy > 8)
      sw.directionLocked = absDy > absDx * 1.2 ? "y" : "x";
  }

  if (sw.directionLocked === "y" && dy < -40) {
    sw.activeCard.style.transform = `translateY(${dy}px) scale(.97)`;
    const detailOl = document.getElementById("detail-ol");
    if (detailOl) detailOl.style.opacity = Math.min(1, (-dy - 40) / 50).toString();
    const likeOl  = document.getElementById("like-ol");
    const passOl  = document.getElementById("pass-ol");
    if (likeOl) likeOl.style.opacity = "0";
    if (passOl) passOl.style.opacity = "0";
    return;
  }

  if (sw.directionLocked !== "x") return;
  e.preventDefault();
  const rot = (dx / 160) * 16;
  sw.activeCard.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;

  const t = Math.min(1, Math.max(0, (absDx - 30) / 60));
  const likeOl = document.getElementById("like-ol");
  const passOl = document.getElementById("pass-ol");
  if (dx > 0) {
    if (likeOl) likeOl.style.opacity = t.toString();
    if (passOl) passOl.style.opacity = "0";
  } else {
    if (passOl) passOl.style.opacity = t.toString();
    if (likeOl) likeOl.style.opacity = "0";
  }
  if (absDx >= SWIPE_THRESHOLD && !sw.thresholdReached) {
    sw.thresholdReached = true;
    navigator.vibrate?.(12);
  }
}

function onDragEnd() {
  const sw = state.swipe;
  if (!sw.isDragging) return;
  sw.isDragging = false;
  const card = sw.activeCard;
  if (!card) return;
  document.removeEventListener("pointermove", onDragMove);
  document.removeEventListener("pointerup", onDragEnd);

  if (sw.directionLocked === "y" && sw.currentDeltaY < -UP_THRESHOLD) {
    const job = currentSwipeJob();
    if (job) { openJob(job.id, "discover"); return; }
  }
  if (sw.directionLocked === "x" && Math.abs(sw.currentDeltaX) >= SWIPE_THRESHOLD) {
    const dir = sw.currentDeltaX > 0 ? "right" : "left";
    animateCardOut(card, dir, () => commitSwipe(dir));
    return;
  }
  snapBack(card);
  initSwipeListeners();
}

function snapBack(card) {
  if (!card) return;
  card.style.transition = "transform .4s cubic-bezier(.34,1.56,.64,1)";
  card.style.transform = "translateX(0) rotate(0deg) translateY(0) scale(1)";
  const likeOl = document.getElementById("like-ol");
  const passOl = document.getElementById("pass-ol");
  const detOl  = document.getElementById("detail-ol");
  [likeOl, passOl, detOl].forEach(el => { if (el) el.style.opacity = "0"; });
  setTimeout(() => { card.style.transition = "none"; }, 400);
}

function animateCardOut(card, dir, callback) {
  const flyX = dir === "right" ? window.innerWidth + 300 : -(window.innerWidth + 300);
  const rot  = dir === "right" ? 30 : -30;
  card.style.transition = "transform .42s cubic-bezier(.25,.46,.45,.94), opacity .35s";
  card.style.transform  = `translateX(${flyX}px) rotate(${rot}deg)`;
  card.style.opacity    = "0";
  playSwipeSound(dir);
  setTimeout(callback, 400);
}

function commitSwipe(dir) {
  const job = currentSwipeJob();
  if (!job) return;
  state.swipe.lastAction = { direction:dir, job, deckIndex:state.swipe.deckIndex };
  if (window.MW?.Auth.isLoggedIn()) {
    window.MW.JobsAPI.swipe(job.id, dir).catch(() => {});
  }
  if (dir === "right") {
    state.swipe.likedIds.push(job.id);
    navigator.vibrate?.([20, 30, 80]);
    showLikeExplosion();
    state.swipe.deckIndex++;
    // Every 3rd like triggers match screen
    if (state.swipe.likedIds.length % 3 === 1) {
      setTimeout(() => go("match"), 650);
      return;
    }
    showSwipeToast(`♥ ${job.company}'e ilgin iletildi`);
  } else {
    state.swipe.skippedIds.push(job.id);
    navigator.vibrate?.(8);
    state.swipe.deckIndex++;
  }
  const deckEl = document.getElementById("card-deck");
  if (deckEl) { deckEl.innerHTML = renderCardDeck(); initSwipeListeners(); }
  updateDeckInfo();
}

function swipeCard(dir) {
  const card = document.getElementById("top-card");
  if (!card) return;
  animateCardOut(card, dir, () => commitSwipe(dir));
}

function undoSwipe() {
  const last = state.swipe.lastAction;
  if (!last) return;
  if (last.direction === "right") state.swipe.likedIds = state.swipe.likedIds.filter(id => id !== last.job.id);
  else state.swipe.skippedIds = state.swipe.skippedIds.filter(id => id !== last.job.id);
  state.swipe.deckIndex = last.deckIndex;
  state.swipe.lastAction = null;
  const deckEl = document.getElementById("card-deck");
  if (deckEl) { deckEl.innerHTML = renderCardDeck(); initSwipeListeners(); }
  updateDeckInfo();
}

function resetDeck() {
  state.swipe.deckIndex = 0;
  state.swipe.likedIds = [];
  state.swipe.skippedIds = [];
  state.swipe.lastAction = null;
  const deckEl = document.getElementById("card-deck");
  if (deckEl) { deckEl.innerHTML = renderCardDeck(); initSwipeListeners(); }
  updateDeckInfo();
}

function playSwipeSound(dir) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const sf = dir === "right" ? 380 : 260;
    const ef = dir === "right" ? 580 : 140;
    osc.frequency.setValueAtTime(sf, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(ef, ctx.currentTime + .09);
    gain.gain.setValueAtTime(.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .09);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + .09);
  } catch(_) {}
}

/* ─── INTERACTION HANDLERS ───────────────────────────────────────── */
/* ─── MAP INTERACTION ────────────────────────────────────────────── */

function setSheetState(s) {
  state.sheetState = s;
  const sheet = document.getElementById("map-sheet");
  if (!sheet) return;
  sheet.className = "map-sheet" +
    (s === "mid" ? " sheet-mid" : s === "expanded" ? " sheet-expanded" : "");
}

function cycleSheetState() {
  const s = state.sheetState || "peek";
  setSheetState(s === "peek" ? "expanded" : "peek");
}

function selectMapPin(jobId) {
  state.selectedPin = jobId;
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;

  // Update selected card HTML
  const cardEl = document.getElementById("sheet-selected-card");
  if (cardEl) cardEl.innerHTML = mapDetailCard(job);

  // Slide sheet to mid
  setSheetState("mid");

  // Update pin visual states
  jobs.forEach(j => {
    const el = document.getElementById(`lpin-${j.id}`);
    if (!el) return;
    el.classList.toggle("lpin-sel", j.id === jobId);
    el.classList.toggle("lpin-dim", j.id !== jobId);
  });

  // Draw route
  drawMapRoute(job);

  // Pan map to center between user and pin
  const marker = _leafletMarkers[jobId];
  if (marker && _leafletMap) {
    const userPt = L.latLng(40.9906, 29.0250);
    const pinPt  = marker.getLatLng();
    const mid    = L.latLng((userPt.lat + pinPt.lat) / 2, (userPt.lng + pinPt.lng) / 2);
    _leafletMap.flyTo(mid, 15, { duration: 0.5 });
  }

  // Show ETA banner
  const eta = document.getElementById("map-eta-banner");
  const etaTxt = document.getElementById("map-eta-text");
  if (eta) eta.style.display = "flex";
  if (etaTxt) etaTxt.textContent = `♟ ${job.travel[state.dirMode || "walk"]} dk`;
}

function deselectMapPin() {
  state.selectedPin = null;

  // Clear route
  if (_mapRouteLayer && _leafletMap) {
    _leafletMap.removeLayer(_mapRouteLayer);
    _mapRouteLayer = null;
  }

  // Restore pin styles
  jobs.forEach(j => {
    const el = document.getElementById(`lpin-${j.id}`);
    if (el) { el.classList.remove("lpin-sel", "lpin-dim"); }
  });

  // Reset sheet
  const cardEl = document.getElementById("sheet-selected-card");
  if (cardEl) cardEl.innerHTML = mapBrowseCard();
  setSheetState("peek");

  // Hide ETA banner
  const eta = document.getElementById("map-eta-banner");
  if (eta) eta.style.display = "none";
}

function drawMapRoute(job) {
  if (!_leafletMap || !window.L) return;
  if (_mapRouteLayer) { _leafletMap.removeLayer(_mapRouteLayer); }
  const modeColors = { walk:"#6C4EFF", bus:"#22C55E", car:"#F59E0B" };
  const color = modeColors[state.dirMode || "walk"];
  const lat = job.pin?.lat || (40.9906 + (job.pin?.y - 50) * 0.002);
  const lng = job.pin?.lng || (29.0250 + (job.pin?.x - 50) * 0.003);
  _mapRouteLayer = L.polyline([[40.9906, 29.0250],[lat, lng]],
    { color, weight:3, opacity:.85, dashArray:"8 6" }).addTo(_leafletMap);
}

function setMapRouteMode(mode) {
  state.dirMode = mode;
  document.querySelectorAll(".travel-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.mode === mode));
  if (state.selectedPin) {
    const job = jobs.find(j => j.id === state.selectedPin);
    if (job) {
      drawMapRoute(job);
      const etaTxt = document.getElementById("map-eta-text");
      const icons = { walk:"♟", bus:"▣", car:"◈" };
      if (etaTxt) etaTxt.textContent = `${icons[mode]} ${job.travel[mode]} dk`;
    }
  }
}

function selectPin(jobId) { selectMapPin(jobId); }
function toggleSheet() { cycleSheetState(); }
function filterMapJobs(q) { filterMapSearch(q); }
function filterMapType(btn, type) { setMapTypeFilter(btn, type); }

function setMatchesTab(i) {
  state.matchesTab = i;
  render();
}

function setDirMode(m) {
  state.dirMode = m;
  render();
}

function selectResult(r) {
  state.selectedResult = r;
  document.querySelectorAll(".result-option").forEach(el => {
    el.classList.toggle("selected", el.textContent.trim() === r);
  });
}

function setRating(n) {
  state.rating = n;
  document.querySelectorAll(".star-btn").forEach((el, i) => {
    el.classList.toggle("on", i < n);
  });
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  if (!input || !input.value.trim()) return;
  const content = input.value.trim();
  input.value = "";

  if (state.chatMatchId && window.MW?.Socket.connected) {
    window.MW.Socket.sendMessage(state.chatMatchId, content);
    const now = new Date().toISOString();
    state.chatMessages.push({ sender_type:"user", content, created_at:now });
    _appendMsg("from-me", content, formatTime(now));
  } else {
    const now = new Date();
    const time = now.getHours() + ":" + String(now.getMinutes()).padStart(2,"0");
    state.messages.push({ from:"me", text:content, time });
    _appendMsg("from-me", content, time);
  }
}

function _appendMsg(cls, text, time) {
  const list = document.getElementById("messages-list");
  if (!list) return;
  const div = document.createElement("div");
  div.className = `msg ${cls}`;
  div.innerHTML = `${text}<div class="msg-time">${time}</div>`;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
}

/* ─── SETTINGS & PROFILE HELPERS ────────────────────────────────── */
function toggleDarkMode() {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("mw_theme", document.body.classList.contains("light-mode") ? "light" : "dark");
  render();
}

function doLogout() {
  window.MW?.AuthAPI.logout();
  window.MW?.Socket.disconnect();
  state.matchesList = [];
  state.chatMessages = [];
  state.chatMatchId = null;
  go("auth");
}

function saveProfile() {
  const name     = document.getElementById("sp-name")?.value.trim();
  const role     = document.getElementById("sp-role")?.value.trim();
  const location = document.getElementById("sp-location")?.value.trim();
  const exp      = document.getElementById("sp-exp")?.value.trim();
  const avail    = document.getElementById("sp-avail")?.value.trim();
  if (name)     { user.name = name; user.short = name.split(" ")[0]; user.initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }
  if (role)     user.role = role;
  if (location) user.location = location;
  if (exp)      user.experience = exp;
  if (avail)    user.availability = avail;
  go("settings");
}

function removeSkill(index) {
  user.skills.splice(index, 1);
  render();
}

function addSkill() {
  const name = prompt("Yeni yetenek:");
  if (name?.trim()) { user.skills.push(name.trim()); render(); }
}

function markAllRead() {
  state.notifications = (state.notifications.length ? state.notifications : _staticNotifs).map(n => ({...n, unread:false}));
  document.querySelectorAll(".notif-item.unread").forEach(el => el.classList.remove("unread"));
}

function markNotifRead(i) {
  if (state.notifications[i]) state.notifications[i].unread = false;
  else if (_staticNotifs[i])  _staticNotifs[i].unread = false;
}

function toggleNotifPref(key) {
  state.notifPrefs[key] = !state.notifPrefs[key];
  render();
}

function togglePrefType(type) {
  const idx = state.prefTypes.indexOf(type);
  if (idx >= 0) state.prefTypes.splice(idx, 1);
  else state.prefTypes.push(type);
  render();
}

function setPrefRadius(r) {
  state.prefRadius = r;
  render();
}

function filterSwipeDeck(btn, tag) {
  state.swipe.deckFilter = tag;
  state.swipe.deckIndex  = 0;
  document.querySelectorAll("#dc-filter-chips .chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  const deckEl = document.getElementById("card-deck");
  if (deckEl) { deckEl.innerHTML = renderCardDeck(); initSwipeListeners(); }
  updateDeckInfo();
}

function openInterview(name, initials, role) {
  state.activeInterview = { name, initials, role };
  go("interview");
}

async function refreshLocation() {
  const btn = document.querySelector(".btn-primary");
  if (btn) { btn.disabled = true; btn.textContent = "Konum alınıyor..."; }
  const loc = await window.MW?.Location.get() || { lat:40.9906, lng:29.0250 };
  user.location = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
  if (btn) { btn.disabled = false; btn.textContent = `${icon("ti-map-pin")} GPS ile Güncelle`; }
  render();
}

/* ─── CHAT HELPERS ───────────────────────────────────────────────── */
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.getHours() + ":" + String(d.getMinutes()).padStart(2,"0");
}

let _typingTimer = null;
function onChatTyping() {
  if (!state.chatMatchId || !window.MW?.Socket.connected) return;
  window.MW.Socket.typingStart(state.chatMatchId);
  clearTimeout(_typingTimer);
  _typingTimer = setTimeout(() => window.MW.Socket.typingStop(state.chatMatchId), 2000);
}

async function openChat(matchId, companyName, companyInitials) {
  state.chatMatchId = matchId;
  state.chatMatch   = { company: companyName, initials: companyInitials };
  state.chatMessages = [];
  state.chatTyping   = false;

  if (window.MW?.Socket.connected) {
    window.MW.Socket.joinMatch(matchId);
  }

  try {
    const msgs = await window.MW.MessagesAPI.list(matchId);
    if (Array.isArray(msgs)) state.chatMessages = msgs;
  } catch(e) {}

  go('chat');
}

async function loadMatchesList() {
  if (!window.MW?.Auth.isLoggedIn()) return;
  try {
    const data = await window.MW.MatchesAPI.list();
    if (Array.isArray(data)) {
      state.matchesList = data;
      if (location.hash === "#messages") render();
    }
  } catch(e) {}
}

function initSocketListeners() {
  if (!window.MW?.Socket.connected) return;

  window.MW.Socket.onMessage(msg => {
    if (msg.match_id !== state.chatMatchId) return;
    if (msg.sender_type === "user") return; // kendi mesajımız, zaten ekledik
    state.chatMessages.push(msg);
    if (location.hash === "#chat") {
      _appendMsg("from-other", msg.content, formatTime(msg.created_at));
    }
  });

  window.MW.Socket.onTypingStart(() => {
    state.chatTyping = true;
    const el = document.getElementById("chat-status");
    if (el) el.textContent = "● Yazıyor...";
  });

  window.MW.Socket.onTypingStop(() => {
    state.chatTyping = false;
    const el = document.getElementById("chat-status");
    if (el) el.textContent = "● Çevrimiçi";
  });
}

/* ─── API ENTEGRASYONU ───────────────────────────────────────────── */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function mapFullApiJob(j, index, userLat, userLng) {
  const distKm = (userLat != null && j.lat != null)
    ? haversineKm(userLat, userLng, j.lat, j.lng)
    : 1.5;
  const walkMin = Math.max(1, Math.round(distKm * 1000 / 80));
  const hues = ["108,78,255","34,197,94","245,158,11","239,68,68","139,92,255","20,184,166","251,113,133","96,165,250"];
  const score = Math.min(95, Math.max(60, 72 + Math.round((j.salary_max - 520) / 5)));
  const tier = score >= 85 ? "high" : score >= 70 ? "mid" : "low";
  const co = j.companies || {};
  return {
    id: j.id,
    title: j.title,
    company: co.name || "?",
    initials: co.initials || "??",
    sal: { min: j.salary_min, max: j.salary_max, cur: j.currency || "₺", per: j.period || "gün" },
    distance: +distKm.toFixed(1),
    travel: { walk: walkMin, bus: Math.round(walkMin * 0.4), car: Math.round(walkMin * 0.27) },
    matchScore: score,
    type: j.type,
    pin: { x: 20 + (index * 11) % 60, y: 30 + (index * 13) % 50, tier },
    desc: j.description || "",
    req: j.requirements || [],
    benefits: j.benefits || [],
    schedule: j.schedule || "",
    tags: j.tags || [],
    hue: hues[index % hues.length],
  };
}

async function loadJobsFromAPI() {
  if (!window.MW?.Auth.isLoggedIn()) return;
  try {
    const loc = await window.MW.Location.get();
    const data = await window.MW.JobsAPI.list();
    if (Array.isArray(data) && data.length > 0) {
      jobs = data
        .map((j, i) => mapFullApiJob(j, i, loc.lat, loc.lng))
        .sort((a, b) => a.distance - b.distance);
      _apiJobsLoaded = true;
    }
  } catch(e) {
    console.warn("API yüklenemedi, demo verisi kullanılıyor:", e);
  }
}

async function doLogin() {
  const emailEl = document.querySelector('.auth-screen input[type="email"]');
  const passEl  = document.querySelector('.auth-screen input[type="password"]');
  if (!emailEl || !passEl) return;
  const btn = document.querySelector('.auth-screen .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = "Giriş yapılıyor..."; }
  const res = await window.MW.AuthAPI.login(emailEl.value.trim(), passEl.value);
  if (!res.ok) {
    if (btn) { btn.disabled = false; btn.textContent = "Giriş Yap"; }
    alert(res.error || "Giriş başarısız");
    return;
  }
  await loadJobsFromAPI();
  window.MW.Socket.connect();
  setTimeout(initSocketListeners, 1000);
  go('home');
}

function demoLogin() {
  go('home');
}

/* ─── BOOT ───────────────────────────────────────────────────────── */
window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem("mw_theme") === "light") document.body.classList.add("light-mode");
  const onboardingDone = localStorage.getItem("mw_onboarding_done");
  if (window.MW?.Auth.isLoggedIn()) {
    await loadJobsFromAPI();
    if (!location.hash || location.hash === "#auth") location.hash = "home";
  } else if (!onboardingDone) {
    location.hash = "onboarding-splash";
  } else {
    if (!location.hash || location.hash === "#onboarding-splash") location.hash = "auth";
  }
  render();
  if ("serviceWorker" in navigator)
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
});

/* expose to inline onclick */
Object.assign(window, {
  go, render, openJob, swipeCard, undoSwipe, resetDeck,
  selectPin, toggleSheet, setMatchesTab, setDirMode,
  selectResult, setRating, sendMessage,
  selectMapPin, deselectMapPin, setSheetState, cycleSheetState,
  setMapRouteMode, setMapTypeFilter, filterMapSearch, applyMapFilters,
  setSortMode, filterMapJobs, filterMapType, centerMapOnUser,
  doLogin, demoLogin, openChat, onChatTyping,
  toggleDarkMode, doLogout, saveProfile, removeSkill, addSkill,
  markAllRead, markNotifRead, toggleNotifPref,
  togglePrefType, setPrefRadius, filterSwipeDeck,
  toggleSpeedMode, showLikeExplosion, showSwipeToast, updateDeckInfo,
  openInterview, refreshLocation,
  formatAuthPhone, submitAuthPhone, onRegOtpInput, onRegOtpKey,
  onRegNameInput, updateRegAvatar, cycleAvatarColor,
  toggleRegSkill, goToRegisterLocation, selectRegCity, selectRegDistrict,
  finishRegistration, completeRegistration,
  requestLocationPermission, selectUserType, toggleCategory,
  updateObDistance, toggleObWorkType, updateObSalary,
  updateObAccountBtn, onOtpInput, onOtpKey,
  finishOnboarding, resetOnboarding,
});
