-- Rádió69 online űrlapok – futtasd le a Supabase SQL Editorban.
-- A nyilvános látogatók csak új üzenetet küldhetnek be; az adatokat nem olvashatják.

create table if not exists public.radio69_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  message_type text not null check (message_type in ('music_request', 'contact')),
  name text not null check (char_length(trim(name)) between 1 and 100),
  email text null check (email is null or char_length(email) <= 254),
  song text null check (song is null or char_length(song) between 1 and 180),
  message text null check (message is null or char_length(message) between 1 and 4000),
  status text not null default 'new' check (status in ('new', 'read', 'answered', 'archived')),
  constraint radio69_message_payload_check check (
    (message_type = 'music_request' and song is not null and message is null and email is null)
    or
    (message_type = 'contact' and email is not null and message is not null and song is null)
  )
);

alter table public.radio69_messages enable row level security;

-- Az anon szerepkörnek kizárólag INSERT joga legyen, lekérdezésre ne kapjon jogot.
revoke all on table public.radio69_messages from anon;
grant insert on table public.radio69_messages to anon;

drop policy if exists "Public can submit new Radio69 messages" on public.radio69_messages;
create policy "Public can submit new Radio69 messages"
  on public.radio69_messages
  for insert
  to anon
  with check (status = 'new');

comment on table public.radio69_messages is
  'Rádió69 weboldal: zenei kívánságok és kapcsolatfelvételi üzenetek';
