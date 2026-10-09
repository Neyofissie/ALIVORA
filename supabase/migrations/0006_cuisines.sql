-- Alivora V1.0 — cuisine preferences (PRD §9.6). Food traditions only; never used to infer identity.
create table public.cuisines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_id uuid references public.cuisines (id),
  region_code text,
  is_active boolean default true
);

create table public.household_cuisine_preferences (
  household_id uuid not null references public.households (id) on delete cascade,
  cuisine_id uuid not null references public.cuisines (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (household_id, cuisine_id)
);

insert into public.cuisines (slug, name) values
  ('nigerian', 'Nigerian'), ('ghanaian', 'Ghanaian'), ('zimbabwean', 'Zimbabwean'), ('south-african', 'South African'),
  ('ethiopian', 'Ethiopian'), ('kenyan', 'Kenyan'), ('scottish', 'Scottish'), ('english', 'English'), ('welsh', 'Welsh'),
  ('irish', 'Irish'), ('indian', 'Indian'), ('pakistani', 'Pakistani'), ('chinese', 'Chinese'), ('japanese', 'Japanese'),
  ('korean', 'Korean'), ('thai', 'Thai'), ('vietnamese', 'Vietnamese'), ('italian', 'Italian'), ('french', 'French'),
  ('spanish', 'Spanish'), ('greek', 'Greek'), ('caribbean', 'Caribbean'), ('middle-eastern', 'Middle Eastern'), ('other', 'Other');
