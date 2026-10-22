-- =====================================================================
-- Prénoms Sénégalais — base des suggestions
-- À exécuter une seule fois dans Supabase : SQL Editor → New query →
-- coller tout ce fichier → Run.
--
-- AVANT d'exécuter : remplacer VOTRE_EMAIL@exemple.com (tout en bas)
-- par l'adresse e-mail du compte administrateur.
-- =====================================================================

create table if not exists public.suggestions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  type          text not null check (type in ('definition', 'modification', 'nouveau')),
  prenom        text not null check (char_length(prenom) between 1 and 80),
  prenom_id     text check (char_length(prenom_id) <= 120),
  signification text check (char_length(signification) <= 1000),
  ethnie        text check (char_length(ethnie) <= 10),
  genre         text check (genre in ('f', 'm', 'x')),
  graphie       text check (char_length(graphie) <= 120),
  commentaire   text check (char_length(commentaire) <= 1000),
  auteur        text check (char_length(auteur) <= 80),   -- nom ou initiales, affiché si publié
  email         text check (char_length(email) <= 120),   -- privé, jamais affiché
  statut        text not null default 'en_attente' check (statut in ('en_attente', 'publiee', 'rejetee')),
  publie_le     timestamptz,
  note_admin    text
);

create index if not exists suggestions_statut_idx on public.suggestions (statut, created_at desc);

-- Liste des administrateurs (seuls eux voient et publient les suggestions).
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;  -- aucune règle : illisible depuis le site

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where email = lower(auth.jwt() ->> 'email'));
$$;

-- ---------- Droits ----------
alter table public.suggestions enable row level security;

revoke all on public.suggestions from anon, authenticated;

-- Les visiteurs peuvent envoyer une suggestion (le statut reste forcément « en_attente »)…
grant insert (type, prenom, prenom_id, signification, ethnie, genre, graphie, commentaire, auteur, email)
  on public.suggestions to anon, authenticated;

-- …et lire uniquement les suggestions publiées, sans l'e-mail ni le commentaire privé.
grant select (id, type, prenom, prenom_id, signification, ethnie, genre, graphie, auteur, publie_le)
  on public.suggestions to anon;

-- L'administrateur connecté voit tout et peut publier, rejeter, corriger ou supprimer.
grant select, update, delete on public.suggestions to authenticated;

drop policy if exists "envoyer une suggestion" on public.suggestions;
create policy "envoyer une suggestion" on public.suggestions
  for insert to anon, authenticated
  with check (statut = 'en_attente');

drop policy if exists "lire les suggestions publiees" on public.suggestions;
create policy "lire les suggestions publiees" on public.suggestions
  for select to anon
  using (statut = 'publiee');

drop policy if exists "administration" on public.suggestions;
create policy "administration" on public.suggestions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- Administrateur ----------
insert into public.admins (email) values (lower('VOTRE_EMAIL@exemple.com'))
  on conflict do nothing;
