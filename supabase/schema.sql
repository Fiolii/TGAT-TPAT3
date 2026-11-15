-- SIXENT: ระบบเพื่อน (เพิ่มเพื่อน + ดูตัวละครเพื่อน)
-- วิธีใช้: Supabase Dashboard → SQL Editor → วางไฟล์นี้ทั้งหมด → Run
-- ก่อนหน้านั้นต้องเปิด Authentication → Sign In / Providers → "Allow anonymous sign-ins"
--
-- หลักความปลอดภัย: เปิด RLS ทั้งสองตารางและ "ไม่สร้าง policy" = เบราว์เซอร์อ่าน/เขียนตารางตรง ๆ ไม่ได้เลย
-- ทุกอย่างผ่านฟังก์ชันด้านล่าง (security definer) ซึ่งตรวจสิทธิ์และจำกัดขนาดข้อมูลเอง
-- ข้อมูลที่เก็บมีแค่: ชื่อเล่น, มหาวิทยาลัยที่เลือก, ลุคตัวละคร, แต้มรวม, ชั้นปี — ไม่มีชื่อจริง/อีเมล/ผลสอบ

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  code text unique not null,
  nick text not null default 'น้องวิศวะ',
  uni text not null default 'sixent',
  avatar jsonb not null default '{}'::jsonb,
  xp int not null default 0,
  title text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.friendships (
  a uuid not null references public.profiles(id) on delete cascade,
  b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (a, b),
  check (a <> b)
);

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;

-- โค้ดเพื่อน 6 ตัว (ตัดตัวที่สับสนง่าย เช่น 0/O 1/I)
create or replace function public.gen_code() returns text
language plpgsql set search_path = public, extensions as $$
declare alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text; i int;
begin
  loop
    c := '';
    for i in 1..6 loop
      c := c || substr(alphabet, 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1);
    end loop;
    exit when not exists (select 1 from public.profiles where code = c);
  end loop;
  return c;
end $$;

-- สร้าง/อัปเดตโปรไฟล์ของตัวเอง (เรียกซ้ำได้) คืนแถวของตัวเองรวมโค้ดเพื่อน
create or replace function public.upsert_profile(p_nick text, p_uni text, p_avatar jsonb, p_xp int, p_title text)
returns public.profiles
language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid := auth.uid(); r public.profiles;
begin
  if uid is null then raise exception 'ยังไม่ได้เข้าสู่ระบบ'; end if;
  if p_avatar is null or jsonb_typeof(p_avatar) <> 'object' or pg_column_size(p_avatar) > 2000 then
    raise exception 'ข้อมูลตัวละครไม่ถูกต้อง';
  end if;
  insert into public.profiles (id, code, nick, uni, avatar, xp, title)
  values (uid, public.gen_code(),
          left(coalesce(nullif(trim(p_nick), ''), 'น้องวิศวะ'), 12),
          left(coalesce(p_uni, 'sixent'), 12),
          p_avatar, greatest(0, least(coalesce(p_xp, 0), 1000000)), left(coalesce(p_title, ''), 30))
  on conflict (id) do update set
    nick = excluded.nick, uni = excluded.uni, avatar = excluded.avatar,
    xp = excluded.xp, title = excluded.title, updated_at = now()
  returning * into r;
  return r;
end $$;

-- เพิ่มเพื่อนด้วยโค้ด (เป็นเพื่อนกันทั้งสองฝั่งทันที) คืนข้อมูลสาธารณะของเพื่อน
create or replace function public.add_friend(p_code text)
returns table (id uuid, nick text, uni text, avatar jsonb, xp int, title text, updated_at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid := auth.uid(); f public.profiles;
begin
  if uid is null then raise exception 'ยังไม่ได้เข้าสู่ระบบ'; end if;
  if not exists (select 1 from public.profiles where profiles.id = uid) then raise exception 'ยังไม่ได้เปิดใช้งานเพื่อน'; end if;
  select * into f from public.profiles where code = upper(trim(coalesce(p_code, '')));
  if f.id is null then raise exception 'ไม่พบโค้ดนี้ ลองตรวจตัวอักษรอีกครั้ง'; end if;
  if f.id = uid then raise exception 'นี่คือโค้ดของคุณเอง'; end if;
  if (select count(*) from public.friendships where a = uid) >= 100 then raise exception 'มีเพื่อนครบ 100 คนแล้ว'; end if;
  insert into public.friendships (a, b) values (uid, f.id), (f.id, uid) on conflict do nothing;
  return query select f.id, f.nick, f.uni, f.avatar, f.xp, f.title, f.updated_at;
end $$;

-- รายชื่อเพื่อนของฉัน (เฉพาะข้อมูลสาธารณะ ไม่รวมโค้ด)
create or replace function public.my_friends()
returns table (id uuid, nick text, uni text, avatar jsonb, xp int, title text, updated_at timestamptz)
language sql security definer stable set search_path = public as $$
  select p.id, p.nick, p.uni, p.avatar, p.xp, p.title, p.updated_at
  from public.friendships fr join public.profiles p on p.id = fr.b
  where fr.a = auth.uid()
  order by p.updated_at desc
  limit 100;
$$;

create or replace function public.remove_friend(p_id uuid) returns void
language sql security definer set search_path = public as $$
  delete from public.friendships
  where (a = auth.uid() and b = p_id) or (b = auth.uid() and a = p_id);
$$;

-- สร้างโค้ดใหม่ (กันคนที่ได้โค้ดเก่าไปแล้วมาเพิ่มอีก) — เพื่อนเดิมยังอยู่
create or replace function public.rotate_code() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare c text;
begin
  if auth.uid() is null then raise exception 'ยังไม่ได้เข้าสู่ระบบ'; end if;
  c := public.gen_code();
  update public.profiles set code = c where id = auth.uid();
  return c;
end $$;

-- ลบข้อมูลออนไลน์ของฉันทั้งหมด (โปรไฟล์ + ความเป็นเพื่อน)
create or replace function public.delete_me() returns void
language sql security definer set search_path = public as $$
  delete from public.profiles where id = auth.uid();
$$;

-- สิทธิ์: เฉพาะผู้ใช้ที่ล็อกอิน (รวมแบบไม่ระบุตัวตน) เรียกฟังก์ชันได้
revoke all on function public.gen_code() from public, anon, authenticated;
revoke all on function public.upsert_profile(text, text, jsonb, int, text) from public, anon;
revoke all on function public.add_friend(text) from public, anon;
revoke all on function public.my_friends() from public, anon;
revoke all on function public.remove_friend(uuid) from public, anon;
revoke all on function public.rotate_code() from public, anon;
revoke all on function public.delete_me() from public, anon;
grant execute on function public.upsert_profile(text, text, jsonb, int, text) to authenticated;
grant execute on function public.add_friend(text) to authenticated;
grant execute on function public.my_friends() to authenticated;
grant execute on function public.remove_friend(uuid) to authenticated;
grant execute on function public.rotate_code() to authenticated;
grant execute on function public.delete_me() to authenticated;

-- ============================================================
-- เพิ่มเติม (รอบ 2): สถานะเพื่อน "กำลังทำอะไรอยู่" (จับเวลา / อ่านบทเรียน / ทำข้อสอบ)
-- รันส่วนนี้ซ้ำได้ ไม่ทำลายข้อมูลเดิม ข้อมูลที่เพิ่ม: ประเภทกิจกรรม + ชื่อบทเรียน/วิชา + เวลาที่ทำมาแล้ว + เวลาที่เห็นล่าสุด
-- ============================================================
alter table public.profiles add column if not exists act text not null default 'idle';
alter table public.profiles add column if not exists act_label text not null default '';
alter table public.profiles add column if not exists act_since timestamptz;
alter table public.profiles add column if not exists seen_at timestamptz;

-- ตั้งสถานะของฉัน (เรียกถี่ ๆ ได้) act: idle | timer | break | read | exam | dress | shop | stats | uni | off (off = ไม่แสดงสถานะให้เพื่อน)
create or replace function public.set_presence(p_act text, p_label text, p_secs int)
returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'ยังไม่ได้เข้าสู่ระบบ'; end if;
  if p_act is null or p_act not in ('idle', 'timer', 'break', 'read', 'exam', 'dress', 'shop', 'stats', 'uni', 'off') then raise exception 'สถานะไม่ถูกต้อง'; end if;
  update public.profiles set
    act = p_act,
    act_label = left(coalesce(p_label, ''), 40),
    act_since = now() - make_interval(secs => greatest(0, least(coalesce(p_secs, 0), 86400))),
    seen_at = case when p_act = 'off' then null else now() end
  where id = uid;
end $$;

-- สถานะเพื่อนทั้งหมด (เบา เรียกซ้ำได้) เวลาคำนวณฝั่งเซิร์ฟเวอร์ ไม่พึ่งนาฬิกาเครื่อง
create or replace function public.friend_status()
returns table (id uuid, act text, act_label text, act_secs int, seen_secs int)
language sql security definer stable set search_path = public as $$
  select p.id,
         case when p.seen_at is null then 'off' else p.act end,
         case when p.seen_at is null then '' else p.act_label end,
         case when p.act_since is null then 0 else greatest(0, extract(epoch from now() - p.act_since))::int end,
         case when p.seen_at is null then null else greatest(0, extract(epoch from now() - p.seen_at))::int end
  from public.friendships fr join public.profiles p on p.id = fr.b
  where fr.a = auth.uid()
  limit 100;
$$;

revoke all on function public.set_presence(text, text, int) from public, anon;
revoke all on function public.friend_status() from public, anon;
grant execute on function public.set_presence(text, text, int) to authenticated;
grant execute on function public.friend_status() to authenticated;

-- ============================================================
-- เพิ่มเติม (รอบ 3): เวลาอ่านสะสม (วัน/สัปดาห์/เดือน) สำหรับอันดับ + กลุ่มอ่านหนังสือ — รันซ้ำได้
-- ข้อมูลที่เพิ่ม: เวลาอ่านรวมต่อวัน/สัปดาห์/เดือน (วินาที) ส่งพร้อมสถานะ เมื่อเปิดสถานะไว้เท่านั้น ; ชื่อกลุ่มและสมาชิก
-- หมายเหตุ: ตัวเลขเวลามาจากเครื่องผู้ใช้ จึงปลอมได้ — เหมาะกับการแข่งกันเล่น ๆ ในกลุ่มเพื่อน ไม่ใช่การจัดอันดับจริงจัง
-- ============================================================
alter table public.profiles add column if not exists st_day date;
alter table public.profiles add column if not exists st_today int not null default 0;
alter table public.profiles add column if not exists st_week int not null default 0;
alter table public.profiles add column if not exists st_month int not null default 0;

-- ตั้งสถานะ + เวลาอ่านสะสม (พารามิเตอร์ชุดหลังเป็นตัวเลือก: เครื่องรุ่นเก่าที่ส่งแค่ 3 ตัวยังใช้ได้)
drop function if exists public.set_presence(text, text, int);
create or replace function public.set_presence(p_act text, p_label text, p_secs int, p_day date default null, p_today int default null, p_week int default null, p_month int default null)
returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'ยังไม่ได้เข้าสู่ระบบ'; end if;
  if p_act is null or p_act not in ('idle', 'timer', 'break', 'read', 'exam', 'dress', 'shop', 'stats', 'uni', 'off') then raise exception 'สถานะไม่ถูกต้อง'; end if;
  update public.profiles set
    act = p_act,
    act_label = left(coalesce(p_label, ''), 40),
    act_since = now() - make_interval(secs => greatest(0, least(coalesce(p_secs, 0), 86400))),
    seen_at = case when p_act = 'off' then null else now() end,
    st_day = case when p_day is null then st_day else least(p_day, (now() at time zone 'Asia/Bangkok')::date + 1) end,
    st_today = case when p_day is null then st_today else greatest(0, least(coalesce(p_today, 0), 86400)) end,
    st_week = case when p_day is null then st_week else greatest(0, least(coalesce(p_week, 0), 7 * 86400)) end,
    st_month = case when p_day is null then st_month else greatest(0, least(coalesce(p_month, 0), 31 * 86400)) end
  where id = uid;
end $$;

-- สถานะเพื่อน + เวลาอ่าน (ตัดเวลาที่หมดอายุเป็น 0 ตามวัน/สัปดาห์/เดือนของไทย ; คนที่ปิดสถานะจะได้ null)
drop function if exists public.friend_status();
create or replace function public.friend_status()
returns table (id uuid, act text, act_label text, act_secs int, seen_secs int, st_today int, st_week int, st_month int)
language sql security definer stable set search_path = public as $$
  select p.id,
         case when p.seen_at is null then 'off' else p.act end,
         case when p.seen_at is null then '' else p.act_label end,
         case when p.act_since is null then 0 else greatest(0, extract(epoch from now() - p.act_since))::int end,
         case when p.seen_at is null then null else greatest(0, extract(epoch from now() - p.seen_at))::int end,
         case when p.seen_at is null then null when p.st_day = d.t then p.st_today else 0 end,
         case when p.seen_at is null then null when p.st_day >= date_trunc('week', d.t)::date then p.st_week else 0 end,
         case when p.seen_at is null then null when p.st_day >= date_trunc('month', d.t)::date then p.st_month else 0 end
  from public.friendships fr join public.profiles p on p.id = fr.b
  cross join (select (now() at time zone 'Asia/Bangkok')::date as t) d
  where fr.a = auth.uid()
  limit 100;
$$;

-- ---------- กลุ่มอ่านหนังสือ ----------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  owner uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create or replace function public.gen_gcode() returns text
language plpgsql set search_path = public, extensions as $$
declare alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text; i int;
begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(alphabet, 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1); end loop;
    exit when not exists (select 1 from public.groups where code = c);
  end loop;
  return c;
end $$;

create or replace function public.create_group(p_name text)
returns table (id uuid, code text, name text)
language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid := auth.uid(); g public.groups;
begin
  if uid is null then raise exception 'ยังไม่ได้เข้าสู่ระบบ'; end if;
  if not exists (select 1 from public.profiles where profiles.id = uid) then raise exception 'ยังไม่ได้เปิดใช้งานเพื่อน'; end if;
  if length(trim(coalesce(p_name, ''))) < 1 then raise exception 'ตั้งชื่อกลุ่มก่อน'; end if;
  if (select count(*) from public.group_members where user_id = uid) >= 8 then raise exception 'อยู่ในกลุ่มครบ 8 กลุ่มแล้ว'; end if;
  insert into public.groups (code, name, owner) values (public.gen_gcode(), left(trim(p_name), 24), uid) returning * into g;
  insert into public.group_members (group_id, user_id) values (g.id, uid);
  return query select g.id, g.code, g.name;
end $$;

create or replace function public.join_group(p_code text)
returns table (id uuid, code text, name text)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); g public.groups;
begin
  if uid is null then raise exception 'ยังไม่ได้เข้าสู่ระบบ'; end if;
  if not exists (select 1 from public.profiles where profiles.id = uid) then raise exception 'ยังไม่ได้เปิดใช้งานเพื่อน'; end if;
  select * into g from public.groups where groups.code = upper(trim(coalesce(p_code, '')));
  if g.id is null then raise exception 'ไม่พบกลุ่มนี้ ลองตรวจตัวอักษรอีกครั้ง'; end if;
  if not exists (select 1 from public.group_members gm where gm.group_id = g.id and gm.user_id = uid) then
    if (select count(*) from public.group_members gm where gm.group_id = g.id) >= 30 then raise exception 'กลุ่มนี้เต็มแล้ว (30 คน)'; end if;
    if (select count(*) from public.group_members gm where gm.user_id = uid) >= 8 then raise exception 'อยู่ในกลุ่มครบ 8 กลุ่มแล้ว'; end if;
    insert into public.group_members (group_id, user_id) values (g.id, uid);
  end if;
  return query select g.id, g.code, g.name;
end $$;

create or replace function public.leave_group(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.group_members where group_id = p_id and user_id = auth.uid();
  delete from public.groups g where g.id = p_id and not exists (select 1 from public.group_members gm where gm.group_id = g.id);
end $$;

create or replace function public.my_groups()
returns table (id uuid, code text, name text, n int)
language sql security definer stable set search_path = public as $$
  select g.id, g.code, g.name, (select count(*)::int from public.group_members x where x.group_id = g.id)
  from public.group_members gm join public.groups g on g.id = gm.group_id
  where gm.user_id = auth.uid()
  order by gm.joined_at;
$$;

-- กระดานของกลุ่ม: สมาชิกเท่านั้นที่ดูได้ (ข้อมูลเดียวกับที่เพื่อนเห็น + เวลาอ่าน)
create or replace function public.group_board(p_id uuid)
returns table (id uuid, nick text, uni text, avatar jsonb, xp int, title text, act text, act_label text, act_secs int, seen_secs int, st_today int, st_week int, st_month int, is_me boolean)
language plpgsql security definer stable set search_path = public as $$
declare uid uuid := auth.uid(); t date := (now() at time zone 'Asia/Bangkok')::date;
begin
  if uid is null then raise exception 'ยังไม่ได้เข้าสู่ระบบ'; end if;
  if not exists (select 1 from public.group_members gm where gm.group_id = p_id and gm.user_id = uid) then raise exception 'คุณไม่ได้อยู่ในกลุ่มนี้'; end if;
  return query
  select p.id, p.nick, p.uni, p.avatar, p.xp, p.title,
         case when p.seen_at is null then 'off' else p.act end,
         case when p.seen_at is null then '' else p.act_label end,
         case when p.act_since is null then 0 else greatest(0, extract(epoch from now() - p.act_since))::int end,
         case when p.seen_at is null then null else greatest(0, extract(epoch from now() - p.seen_at))::int end,
         case when p.seen_at is null then null when p.st_day = t then p.st_today else 0 end,
         case when p.seen_at is null then null when p.st_day >= date_trunc('week', t)::date then p.st_week else 0 end,
         case when p.seen_at is null then null when p.st_day >= date_trunc('month', t)::date then p.st_month else 0 end,
         (p.id = uid)
  from public.group_members gm join public.profiles p on p.id = gm.user_id
  where gm.group_id = p_id
  limit 30;
end $$;

revoke all on function public.gen_gcode() from public, anon, authenticated;
revoke all on function public.set_presence(text, text, int, date, int, int, int) from public, anon;
revoke all on function public.friend_status() from public, anon;
revoke all on function public.create_group(text) from public, anon;
revoke all on function public.join_group(text) from public, anon;
revoke all on function public.leave_group(uuid) from public, anon;
revoke all on function public.my_groups() from public, anon;
revoke all on function public.group_board(uuid) from public, anon;
grant execute on function public.set_presence(text, text, int, date, int, int, int) to authenticated;
grant execute on function public.friend_status() to authenticated;
grant execute on function public.create_group(text) to authenticated;
grant execute on function public.join_group(text) to authenticated;
grant execute on function public.leave_group(uuid) to authenticated;
grant execute on function public.my_groups() to authenticated;
grant execute on function public.group_board(uuid) to authenticated;
