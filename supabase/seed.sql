-- ═══════════════════════════════════════════════════════════════════
-- MATCHWORK — Seed Data (Demo verisi)
-- schema.sql'den SONRA çalıştır
-- ═══════════════════════════════════════════════════════════════════

-- Demo kullanıcısı auth.users tablosuna Supabase UI'dan eklenecek.
-- Burası sadece companies + jobs seed verisi içeriyor.

-- ─── COMPANIES ────────────────────────────────────────────────────
insert into companies (id, name, initials, description, location, verified) values
  ('11111111-0000-0000-0000-000000000001', 'Cafe Lumiere',   'CL', 'Sahil kenarında modern kafe. Hafta sonu vardiyası.',      'Moda Cad. No:42, Kadıköy', true),
  ('11111111-0000-0000-0000-000000000002', 'Beyaz Masa',     'BM', 'Şehrin kalbinde köklü restoran.',                         'Bahariye Cad. No:12, Kadıköy', true),
  ('11111111-0000-0000-0000-000000000003', 'HızlıGit',       'HG', 'Şehir içi kurye platformu.',                              'Kadıköy Merkez', false),
  ('11111111-0000-0000-0000-000000000004', 'Teknomarket',    'TM', 'Teknoloji perakende zinciri.',                            'Bağdat Cad. No:88, Kadıköy', true),
  ('11111111-0000-0000-0000-000000000005', 'SafeGuard',      'SG', 'Güvenlik hizmetleri.',                                   'Ataşehir, İstanbul', false),
  ('11111111-0000-0000-0000-000000000006', 'ModaPlus',       'MP', 'Kadıköy''ün popüler giyim mağazası.',                    'Bahariye Cad. No:55, Kadıköy', true),
  ('11111111-0000-0000-0000-000000000007', 'Lezzet Durağı',  'LD', 'Aile işletmesi, ev yemeği tarzı restoran.',              'Moda, Kadıköy', false),
  ('11111111-0000-0000-0000-000000000008', 'NetCall',        'NC', 'Modern çağrı merkezi, uzaktan çalışma seçeneği.',        'Kozyatağı, İstanbul', true);

-- ─── JOBS (Kadıköy ve çevresi, gerçek koordinatlar) ───────────────
-- Kadıköy merkez: 40.9906, 29.0250
insert into jobs (id, company_id, title, description, location, lat, lng, salary_min, salary_max, currency, period, type, schedule, tags, requirements, benefits) values

  ('22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   'Barista',
   'Sahil kenarında sakin ve modern bir kafe. Hafta sonu vardiyası, yemek dahil. Deneyimsiz adaylara açık, ekibimiz size her şeyi öğretir.',
   'Moda Cad. No:42, Kadıköy', 40.9875, 29.0290,
   520, 580, '₺', 'gün', 'Yarı zamanlı',
   'Cumartesi–Pazar 10:00–18:00',
   array['Hafta sonu','Yemek dahil','Prim'],
   array['İletişim becerileri','Ekip çalışması','Esnek saat'],
   array['Yemek ikramı','Servis ikramı','Prim sistemi']),

  ('22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000002',
   'Garson',
   'Şehrin kalbinde köklü bir restoran. Tecrübeli bir ekiple çalışma fırsatı.',
   'Bahariye Cad. No:12, Kadıköy', 40.9930, 29.0220,
   480, 560, '₺', 'gün', 'Tam zamanlı',
   'Hafta içi 11:00–20:00',
   array['Tam zamanlı','Ulaşım'],
   array['Güler yüz','Dikkatli','Fiziksel dayanıklılık'],
   array['Yemek ikramı','Ulaşım desteği']),

  ('22222222-0000-0000-0000-000000000003',
   '11111111-0000-0000-0000-000000000003',
   'Kurye',
   'Esnek saatler ve yüksek kazanç. Kendi hızınızda çalışın.',
   'Kadıköy Merkez', 40.9850, 29.0175,
   600, 700, '₺', 'gün', 'Serbest',
   'Esnek — haftanın 7 günü',
   array['Esnek','Yüksek kazanç','Serbest'],
   array['Telefon','Fiziksel form'],
   array['Esnek saat','Yakıt desteği','Hızlı ödeme']),

  ('22222222-0000-0000-0000-000000000004',
   '11111111-0000-0000-0000-000000000004',
   'Kasa Görevlisi',
   'Büyük bir teknoloji perakende zinciri. Kasa ve iade işlemlerine yardım.',
   'Bağdat Cad. No:88, Kadıköy', 40.9810, 29.0330,
   490, 540, '₺', 'gün', 'Yarı zamanlı',
   'Haftaiçi 14:00–20:00',
   array['SGK','İndirim','Hafta içi'],
   array['Kasa deneyimi','Dikkatli sayım','Müşteri odaklılık'],
   array['Çalışan indirimi','SGK','Yemek kartı']),

  ('22222222-0000-0000-0000-000000000005',
   '11111111-0000-0000-0000-000000000005',
   'Güvenlik Görevlisi',
   'AVM güvenlik ekibi. Güvenli ve sakin iş ortamı.',
   'Ataşehir, İstanbul', 40.9960, 29.0480,
   550, 620, '₺', 'gün', 'Tam zamanlı',
   'Gece/Gündüz vardiyalı',
   array['SGK','Vardiyalı','Üniforma'],
   array['Dikkat','Soğukkanlılık'],
   array['SGK','Yemek','Üniforma']),

  ('22222222-0000-0000-0000-000000000006',
   '11111111-0000-0000-0000-000000000006',
   'Satış Temsilcisi',
   'Kadıköy''ün en popüler giyim mağazalarından biri. Prim sistemiyle yüksek kazanç.',
   'Bahariye Cad. No:55, Kadıköy', 40.9892, 29.0195,
   500, 650, '₺', 'gün', 'Yarı zamanlı',
   'Cumartesi–Pazar 11:00–19:00',
   array['Prim','Moda','Hafta sonu'],
   array['Satış yeteneği','Stil bilgisi','Müşteri iletişimi'],
   array['Prim','Çalışan indirimi','Esnek saat']),

  ('22222222-0000-0000-0000-000000000007',
   '11111111-0000-0000-0000-000000000007',
   'Aşçı Yardımcısı',
   'Aile işletmesi, ev yemeği tarzı restoran. Sıcak çalışma ortamı.',
   'Moda, Kadıköy', 40.9863, 29.0310,
   460, 520, '₺', 'gün', 'Tam zamanlı',
   'Hafta içi 08:00–16:00',
   array['Öğle yemeği','Haftaiçi','Tam zamanlı'],
   array['Temel mutfak bilgisi','Hijyen','Fiziksel dayanıklılık'],
   array['Öğle yemeği','Ulaşım desteği']),

  ('22222222-0000-0000-0000-000000000008',
   '11111111-0000-0000-0000-000000000008',
   'Çağrı Merkezi Temsilcisi',
   'Modern ofis ortamında müşteri hizmetleri. Uzaktan çalışma seçeneği de mevcut.',
   'Kozyatağı, İstanbul', 40.9920, 29.0145,
   480, 580, '₺', 'gün', 'Yarı zamanlı',
   'Esnek — 09:00–21:00 arası',
   array['SGK','Uzaktan','Prim'],
   array['İyi iletişim','Bilgisayar kullanımı','Sabır'],
   array['SGK','Uzaktan çalışma','Prim']);
