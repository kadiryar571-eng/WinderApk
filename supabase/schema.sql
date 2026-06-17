-- ═══════════════════════════════════════════════════════════════════
-- MATCHWORK — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- PostGIS extension (koordinat sorgular için)
create extension if not exists postgis;

-- ─── ENUM TYPES ───────────────────────────────────────────────────
create type job_type   as enum ('Tam zamanlı','Yarı zamanlı','Serbest','Staj');
create type swipe_dir  as enum ('left','right');
create type match_status as enum ('new','active','interview','hired','rejected');
create type msg_sender as enum ('user','company');
create type notif_type as enum ('match','message','interview','system');

-- ─── COMPANIES ────────────────────────────────────────────────────
create table companies (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users on delete cascade,
  name        text not null,
  initials    text not null,
  description text,
  location    text,
  website     text,
  verified    boolean default false,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- ─── PROFILES (iş arayan) ─────────────────────────────────────────
create table profiles (
  id              uuid primary key references auth.users on delete cascade,
  full_name       text not null,
  short_name      text,
  initials        text,
  role_label      text,                              -- "Barista · Satış Danışmanı"
  location        text,
  lat             float8,
  lng             float8,
  geom            geography(Point, 4326),
  skills          text[]    default '{}',
  certifications  text[]    default '{}',
  experience      text,
  availability    text,
  salary_min      int       default 0,
  salary_max      int       default 0,
  preferred_type  job_type,
  match_score     int       default 0,
  response_rate   numeric   default 0,
  rating          numeric   default 0,
  verified        boolean   default false,
  avatar_url      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- geom sütununu lat/lng'den otomatik doldur
create or replace function sync_profile_geom()
returns trigger language plpgsql as $$
begin
  if new.lat is not null and new.lng is not null then
    new.geom := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_profile_geom
  before insert or update on profiles
  for each row execute function sync_profile_geom();

-- ─── JOBS ─────────────────────────────────────────────────────────
create table jobs (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references companies on delete cascade,
  title        text not null,
  description  text,
  location     text,
  lat          float8,
  lng          float8,
  geom         geography(Point, 4326),
  salary_min   int  not null default 0,
  salary_max   int  not null default 0,
  currency     text default '₺',
  period       text default 'gün',
  type         job_type not null default 'Yarı zamanlı',
  schedule     text,
  tags         text[]   default '{}',
  requirements text[]   default '{}',
  benefits     text[]   default '{}',
  active       boolean  default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create or replace function sync_job_geom()
returns trigger language plpgsql as $$
begin
  if new.lat is not null and new.lng is not null then
    new.geom := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_job_geom
  before insert or update on jobs
  for each row execute function sync_job_geom();

-- Yakındaki ilanlar (mesafeye göre, metre cinsinden)
create or replace function jobs_near(
  user_lat float8,
  user_lng float8,
  radius_m float8 default 5000
)
returns table (
  job_id       uuid,
  title        text,
  company_name text,
  distance_m   float8,
  salary_min   int,
  salary_max   int,
  currency     text,
  period       text,
  type         job_type,
  tags         text[],
  lat          float8,
  lng          float8
) language sql as $$
  select
    j.id,
    j.title,
    c.name,
    ST_Distance(j.geom, ST_MakePoint(user_lng, user_lat)::geography) as distance_m,
    j.salary_min, j.salary_max, j.currency, j.period, j.type, j.tags,
    j.lat, j.lng
  from jobs j
  join companies c on c.id = j.company_id
  where j.active = true
    and ST_DWithin(j.geom, ST_MakePoint(user_lng, user_lat)::geography, radius_m)
  order by distance_m asc;
$$;

-- ─── SWIPES ───────────────────────────────────────────────────────
create table swipes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles on delete cascade,
  job_id     uuid references jobs on delete cascade,
  direction  swipe_dir not null,
  created_at timestamptz default now(),
  unique(user_id, job_id)
);

-- ─── MATCHES ──────────────────────────────────────────────────────
create table matches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles    on delete cascade,
  job_id      uuid references jobs        on delete cascade,
  company_id  uuid references companies   on delete cascade,
  status      match_status default 'new',
  match_score int          default 0,
  created_at  timestamptz  default now(),
  updated_at  timestamptz  default now(),
  unique(user_id, job_id)
);

-- match_score hesapla: profil yetenekleri / iş gereksinimleri örtüşmesi
create or replace function calc_match_score(p_id uuid, j_id uuid)
returns int language plpgsql as $$
declare
  p_skills   text[];
  j_reqs     text[];
  overlap    int;
  total_reqs int;
begin
  select skills        into p_skills from profiles where id = p_id;
  select requirements  into j_reqs   from jobs     where id = j_id;
  total_reqs := coalesce(array_length(j_reqs, 1), 0);
  if total_reqs = 0 then return 70; end if;
  select count(*) into overlap
    from unnest(j_reqs) r
    where r = any(p_skills);
  return 60 + (overlap::numeric / total_reqs * 40)::int;
end;
$$;

-- ─── MESSAGES ─────────────────────────────────────────────────────
create table messages (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid references matches on delete cascade,
  sender_id   uuid not null,
  sender_type msg_sender not null,
  content     text not null,
  read_at     timestamptz,
  created_at  timestamptz default now()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles on delete cascade,
  type       notif_type not null,
  title      text not null,
  body       text,
  data       jsonb default '{}',
  read       boolean default false,
  created_at timestamptz default now()
);

-- ─── INTERVIEWS ───────────────────────────────────────────────────
create table interviews (
  id           uuid primary key default gen_random_uuid(),
  match_id     uuid references matches on delete cascade,
  scheduled_at timestamptz not null,
  type         text default 'video',          -- video / in-person
  location     text,
  meet_url     text,
  status       text default 'pending',         -- pending / confirmed / cancelled
  result       text,                           -- hired / rejected / pending
  rating       int,
  created_at   timestamptz default now()
);

-- ─── INDEXES ──────────────────────────────────────────────────────
create index idx_jobs_geom      on jobs using gist(geom);
create index idx_profiles_geom  on profiles using gist(geom);
create index idx_swipes_user    on swipes(user_id);
create index idx_swipes_job     on swipes(job_id);
create index idx_matches_user   on matches(user_id);
create index idx_matches_status on matches(status);
create index idx_messages_match on messages(match_id, created_at);
create index idx_notifs_user    on notifications(user_id, read, created_at desc);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────
alter table profiles      enable row level security;
alter table companies     enable row level security;
alter table jobs          enable row level security;
alter table swipes        enable row level security;
alter table matches       enable row level security;
alter table messages      enable row level security;
alter table notifications enable row level security;
alter table interviews    enable row level security;

-- Profiles
create policy "Kullanıcı kendi profilini okur/yazar"
  on profiles for all using (auth.uid() = id);
create policy "Herkes profil okuyabilir"
  on profiles for select using (true);

-- Companies
create policy "Şirket sahibi okur/yazar"
  on companies for all using (auth.uid() = owner_id);
create policy "Herkes şirket okuyabilir"
  on companies for select using (true);

-- Jobs
create policy "Herkes aktif ilanları okuyabilir"
  on jobs for select using (active = true);
create policy "Şirket sahibi ilanı yönetir"
  on jobs for all using (
    company_id in (select id from companies where owner_id = auth.uid())
  );

-- Swipes
create policy "Kullanıcı kendi swipe'larını yönetir"
  on swipes for all using (auth.uid() = user_id);

-- Matches
create policy "İlgili taraf eşleşmeyi görür"
  on matches for select using (
    auth.uid() = user_id or
    company_id in (select id from companies where owner_id = auth.uid())
  );
create policy "Kullanıcı eşleşme oluşturabilir"
  on matches for insert with check (auth.uid() = user_id);
create policy "Şirket match_status'u güncelleyebilir"
  on matches for update using (
    company_id in (select id from companies where owner_id = auth.uid())
  );

-- Messages
create policy "Match tarafları mesajları okur"
  on messages for select using (
    match_id in (
      select id from matches
      where user_id = auth.uid()
         or company_id in (select id from companies where owner_id = auth.uid())
    )
  );
create policy "Match tarafları mesaj gönderir"
  on messages for insert with check (
    sender_id = auth.uid() and
    match_id in (
      select id from matches
      where user_id = auth.uid()
         or company_id in (select id from companies where owner_id = auth.uid())
    )
  );

-- Notifications
create policy "Kullanıcı kendi bildirimlerini görür"
  on notifications for all using (auth.uid() = user_id);

-- Interviews
create policy "Match tarafları görüşmeleri görür"
  on interviews for select using (
    match_id in (
      select id from matches
      where user_id = auth.uid()
         or company_id in (select id from companies where owner_id = auth.uid())
    )
  );

-- ─── REALTIME (Supabase Realtime için publish) ────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table matches;
