-- SIXENT: บัญชีผู้ใช้ (username + password) และซิงก์ข้อมูลข้ามเครื่อง
-- วิธีใช้: Supabase Dashboard → SQL Editor → วางไฟล์นี้ทั้งหมด → Run (รันซ้ำได้ ไม่ทำให้ข้อมูลหาย)
-- ไม่ต้องเปิด Auth provider เพิ่ม และไม่ใช้อีเมล: ไม่ผูกกับระบบเพื่อน (supabase/schema.sql) แยกกันโดยสิ้นเชิง
--
-- หลักความปลอดภัย
--  * ตารางทั้งหมดเปิด RLS และ "ไม่มี policy" + เพิกถอนสิทธิ์ anon/authenticated = เบราว์เซอร์อ่าน/เขียนตารางตรง ๆ ไม่ได้เลย ทุกอย่างผ่านฟังก์ชัน security definer ด้านล่าง
--  * รหัสผ่านและรหัสกู้คืนเก็บเป็นแฮช bcrypt (pgcrypto crypt/gen_salt('bf')) ไม่เก็บข้อความจริง
--  * token เข้าสู่ระบบสุ่ม 256 บิต เก็บเฉพาะแฮช SHA-256 ในเซิร์ฟเวอร์ ใช้ได้ไม่เกิน 10 เครื่องต่อบัญชี (เครื่องเก่าสุดหลุดก่อน)
--  * ใส่รหัสผ่านผิด 5 ครั้งติด ล็อกบัญชี 15 นาที (รหัสกู้คืน: ผิด 5 ครั้ง ล็อก 30 นาที)
--  * ข้อมูลที่ซิงก์คือสถิติและความคืบหน้าของแอป (jsonb ไม่เกิน ~4 MB) ไม่มีอีเมล เบอร์โทร หรือชื่อจริง
--  * ไม่มีอีเมล จึงกู้รหัสผ่านทางอีเมลไม่ได้ — ผู้ใช้ต้องเก็บ "รหัสกู้คืน" ที่ได้ตอนสมัคร

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  pass_hash text not null,
  recovery_hash text not null,
  fail_count int not null default 0,
  locked_until timestamptz,
  rec_fail int not null default 0,
  rec_locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.acct_sessions (
  token_hash text primary key,
  account_id uuid not null references public.accounts(id) on delete cascade,
  device text not null default '',
  created_at timestamptz not null default now(),
  last_used timestamptz not null default now()
);
create index if not exists acct_sessions_account_idx on public.acct_sessions(account_id);

create table if not exists public.acct_data (
  account_id uuid primary key references public.accounts(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  version bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.accounts enable row level security;
alter table public.acct_sessions enable row level security;
alter table public.acct_data enable row level security;
revoke all on public.accounts, public.acct_sessions, public.acct_data from anon, authenticated;

/* ---------- ตัวช่วยภายใน (ห้ามเรียกจากเบราว์เซอร์) ---------- */
create or replace function public.acct_norm_code(p text) returns text
language sql immutable set search_path = public, extensions as $fn$
  select upper(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g'));
$fn$;

create or replace function public.acct_gen_recovery() returns text
language plpgsql set search_path = public, extensions as $fn$
declare alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea := gen_random_bytes(16); c text := ''; i int;
begin
  for i in 0..15 loop
    c := c || substr(alphabet, (get_byte(b, i) % 32) + 1, 1);
    if i in (3, 7, 11) then c := c || '-'; end if;
  end loop;
  return c;
end $fn$;

create or replace function public.acct_new_session(p_acc uuid, p_device text) returns text
language plpgsql security definer set search_path = public, extensions as $fn$
declare tok text := encode(gen_random_bytes(32), 'hex');
begin
  insert into public.acct_sessions(token_hash, account_id, device) values (encode(digest(tok, 'sha256'), 'hex'), p_acc, left(coalesce(p_device, ''), 60));
  delete from public.acct_sessions s where s.account_id = p_acc and s.token_hash not in (
    select token_hash from public.acct_sessions where account_id = p_acc order by last_used desc, created_at desc limit 10);
  return tok;
end $fn$;

create or replace function public.acct_auth(p_token text) returns uuid
language plpgsql security definer set search_path = public, extensions as $fn$
declare acc uuid;
begin
  if p_token is null or length(p_token) <> 64 then return null; end if;
  update public.acct_sessions set last_used = now() where token_hash = encode(digest(p_token, 'sha256'), 'hex') returning account_id into acc;
  return acc;
end $fn$;

revoke execute on function public.acct_norm_code(text), public.acct_gen_recovery(), public.acct_new_session(uuid, text), public.acct_auth(text) from public, anon, authenticated;

/* ---------- สมัคร / เข้าสู่ระบบ / ออก ---------- */
create or replace function public.acct_register(p_username text, p_password text, p_device text default '') returns jsonb
language plpgsql security definer set search_path = public, extensions as $fn$
declare u text := lower(trim(coalesce(p_username, ''))); rc text; acc uuid; tok text;
begin
  if u !~ '^[a-z0-9_]{3,20}$' then return jsonb_build_object('ok', false, 'error', 'invalid_username'); end if;
  if length(coalesce(p_password, '')) < 8 or length(p_password) > 72 then return jsonb_build_object('ok', false, 'error', 'weak_password'); end if;
  if exists (select 1 from public.accounts where username = u) then return jsonb_build_object('ok', false, 'error', 'username_taken'); end if;
  rc := public.acct_gen_recovery();
  begin
    insert into public.accounts(username, pass_hash, recovery_hash)
    values (u, crypt(p_password, gen_salt('bf', 10)), crypt(public.acct_norm_code(rc), gen_salt('bf', 10))) returning id into acc;
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'username_taken');
  end;
  insert into public.acct_data(account_id) values (acc);
  tok := public.acct_new_session(acc, p_device);
  return jsonb_build_object('ok', true, 'token', tok, 'username', u, 'recovery', rc);
end $fn$;

create or replace function public.acct_login(p_username text, p_password text, p_device text default '') returns jsonb
language plpgsql security definer set search_path = public, extensions as $fn$
declare u text := lower(trim(coalesce(p_username, ''))); a public.accounts; tok text;
begin
  select * into a from public.accounts where username = u for update;
  if not found then
    perform crypt(coalesce(p_password, ''), gen_salt('bf', 10));   -- ใช้เวลาใกล้เคียงกัน ไม่บอกว่าชื่อผู้ใช้มีอยู่หรือไม่
    return jsonb_build_object('ok', false, 'error', 'bad_credentials');
  end if;
  if a.locked_until is not null and a.locked_until > now() then
    return jsonb_build_object('ok', false, 'error', 'locked', 'minutes', ceil(extract(epoch from (a.locked_until - now())) / 60)::int);
  end if;
  if a.pass_hash <> crypt(coalesce(p_password, ''), a.pass_hash) then
    update public.accounts set
      fail_count = case when fail_count + 1 >= 5 then 0 else fail_count + 1 end,
      locked_until = case when fail_count + 1 >= 5 then now() + interval '15 minutes' else locked_until end
    where id = a.id;
    return jsonb_build_object('ok', false, 'error', 'bad_credentials');
  end if;
  update public.accounts set fail_count = 0, locked_until = null where id = a.id;
  tok := public.acct_new_session(a.id, p_device);
  return jsonb_build_object('ok', true, 'token', tok, 'username', a.username);
end $fn$;

create or replace function public.acct_logout(p_token text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $fn$
begin
  delete from public.acct_sessions where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
  return jsonb_build_object('ok', true);
end $fn$;

/* ---------- ซิงก์ข้อมูล ---------- */
create or replace function public.acct_pull(p_token text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $fn$
declare acc uuid := public.acct_auth(p_token); d public.acct_data; u text;
begin
  if acc is null then return jsonb_build_object('ok', false, 'error', 'bad_session'); end if;
  select * into d from public.acct_data where account_id = acc;
  select username into u from public.accounts where id = acc;
  return jsonb_build_object('ok', true, 'username', u, 'version', coalesce(d.version, 0), 'data', coalesce(d.data, '{}'::jsonb), 'updated_at', d.updated_at);
end $fn$;

-- เขียนทับได้เมื่อ p_expect ตรงกับเวอร์ชันบนเซิร์ฟเวอร์เท่านั้น (กันสองเครื่องเขียนทับกัน) ถ้าไม่ตรงจะคืนข้อมูลล่าสุดให้ฝั่งเบราว์เซอร์รวมแล้วลองใหม่
create or replace function public.acct_push(p_token text, p_data jsonb, p_expect bigint) returns jsonb
language plpgsql security definer set search_path = public, extensions as $fn$
declare acc uuid := public.acct_auth(p_token); cur public.acct_data;
begin
  if acc is null then return jsonb_build_object('ok', false, 'error', 'bad_session'); end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then return jsonb_build_object('ok', false, 'error', 'bad_data'); end if;
  if octet_length(p_data::text) > 4000000 then return jsonb_build_object('ok', false, 'error', 'too_large'); end if;
  select * into cur from public.acct_data where account_id = acc for update;
  if not found then
    insert into public.acct_data(account_id, data, version) values (acc, p_data, 1);
    return jsonb_build_object('ok', true, 'version', 1);
  end if;
  if p_expect is distinct from cur.version then
    return jsonb_build_object('ok', false, 'error', 'conflict', 'version', cur.version, 'data', cur.data);
  end if;
  update public.acct_data set data = p_data, version = cur.version + 1, updated_at = now() where account_id = acc;
  return jsonb_build_object('ok', true, 'version', cur.version + 1);
end $fn$;

/* ---------- จัดการบัญชี ---------- */
create or replace function public.acct_change_password(p_token text, p_old text, p_new text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $fn$
declare acc uuid := public.acct_auth(p_token); a public.accounts;
begin
  if acc is null then return jsonb_build_object('ok', false, 'error', 'bad_session'); end if;
  if length(coalesce(p_new, '')) < 8 or length(p_new) > 72 then return jsonb_build_object('ok', false, 'error', 'weak_password'); end if;
  select * into a from public.accounts where id = acc for update;
  if a.locked_until is not null and a.locked_until > now() then
    return jsonb_build_object('ok', false, 'error', 'locked', 'minutes', ceil(extract(epoch from (a.locked_until - now())) / 60)::int);
  end if;
  if a.pass_hash <> crypt(coalesce(p_old, ''), a.pass_hash) then
    update public.accounts set
      fail_count = case when fail_count + 1 >= 5 then 0 else fail_count + 1 end,
      locked_until = case when fail_count + 1 >= 5 then now() + interval '15 minutes' else locked_until end
    where id = acc;
    return jsonb_build_object('ok', false, 'error', 'bad_credentials');
  end if;
  update public.accounts set pass_hash = crypt(p_new, gen_salt('bf', 10)), fail_count = 0, locked_until = null where id = acc;
  delete from public.acct_sessions where account_id = acc and token_hash <> encode(digest(p_token, 'sha256'), 'hex');   -- เครื่องอื่นต้องเข้าสู่ระบบใหม่
  return jsonb_build_object('ok', true);
end $fn$;

create or replace function public.acct_recover(p_username text, p_code text, p_new text, p_device text default '') returns jsonb
language plpgsql security definer set search_path = public, extensions as $fn$
declare u text := lower(trim(coalesce(p_username, ''))); a public.accounts; rc text; tok text;
begin
  if length(coalesce(p_new, '')) < 8 or length(p_new) > 72 then return jsonb_build_object('ok', false, 'error', 'weak_password'); end if;
  select * into a from public.accounts where username = u for update;
  if not found then
    perform crypt(coalesce(p_code, ''), gen_salt('bf', 10));
    return jsonb_build_object('ok', false, 'error', 'bad_credentials');
  end if;
  if a.rec_locked_until is not null and a.rec_locked_until > now() then
    return jsonb_build_object('ok', false, 'error', 'locked', 'minutes', ceil(extract(epoch from (a.rec_locked_until - now())) / 60)::int);
  end if;
  if a.recovery_hash <> crypt(public.acct_norm_code(p_code), a.recovery_hash) then
    update public.accounts set
      rec_fail = case when rec_fail + 1 >= 5 then 0 else rec_fail + 1 end,
      rec_locked_until = case when rec_fail + 1 >= 5 then now() + interval '30 minutes' else rec_locked_until end
    where id = a.id;
    return jsonb_build_object('ok', false, 'error', 'bad_credentials');
  end if;
  rc := public.acct_gen_recovery();
  update public.accounts set pass_hash = crypt(p_new, gen_salt('bf', 10)), recovery_hash = crypt(public.acct_norm_code(rc), gen_salt('bf', 10)),
    fail_count = 0, locked_until = null, rec_fail = 0, rec_locked_until = null where id = a.id;
  delete from public.acct_sessions where account_id = a.id;   -- ทุกเครื่องต้องเข้าสู่ระบบใหม่
  tok := public.acct_new_session(a.id, p_device);
  return jsonb_build_object('ok', true, 'token', tok, 'username', a.username, 'recovery', rc);
end $fn$;

create or replace function public.acct_delete(p_token text, p_password text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $fn$
declare acc uuid := public.acct_auth(p_token); a public.accounts;
begin
  if acc is null then return jsonb_build_object('ok', false, 'error', 'bad_session'); end if;
  select * into a from public.accounts where id = acc for update;
  if a.locked_until is not null and a.locked_until > now() then
    return jsonb_build_object('ok', false, 'error', 'locked', 'minutes', ceil(extract(epoch from (a.locked_until - now())) / 60)::int);
  end if;
  if a.pass_hash <> crypt(coalesce(p_password, ''), a.pass_hash) then
    update public.accounts set
      fail_count = case when fail_count + 1 >= 5 then 0 else fail_count + 1 end,
      locked_until = case when fail_count + 1 >= 5 then now() + interval '15 minutes' else locked_until end
    where id = acc;
    return jsonb_build_object('ok', false, 'error', 'bad_credentials');
  end if;
  delete from public.accounts where id = acc;   -- เซสชันและข้อมูลที่ซิงก์ถูกลบตามด้วย (on delete cascade)
  return jsonb_build_object('ok', true);
end $fn$;

grant execute on function
  public.acct_register(text, text, text), public.acct_login(text, text, text), public.acct_logout(text),
  public.acct_pull(text), public.acct_push(text, jsonb, bigint), public.acct_change_password(text, text, text),
  public.acct_recover(text, text, text, text), public.acct_delete(text, text)
to anon, authenticated;
