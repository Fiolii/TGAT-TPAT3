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
