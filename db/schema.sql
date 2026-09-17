-- Shelf&Stir schema.
-- Recipes stay the build-time source of truth for static page generation;
-- users/favorites/shelves/ratings/comments are read and written at runtime
-- by the Cloudflare Pages Functions API.

create table if not exists recipes (
  id text primary key,              -- slug, e.g. 'margarita'
  name text not null,
  type text not null,
  summary text not null,
  time_minutes integer not null,
  strength text not null,
  image_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists recipe_tags (
  recipe_id text not null references recipes(id) on delete cascade,
  tag text not null,
  primary key (recipe_id, tag)
);

create table if not exists recipe_ingredients (
  recipe_id text not null references recipes(id) on delete cascade,
  position integer not null,
  display_text text not null,
  primary key (recipe_id, position)
);

create table if not exists recipe_method_steps (
  recipe_id text not null references recipes(id) on delete cascade,
  position integer not null,
  instruction text not null,
  primary key (recipe_id, position)
);

create table if not exists ingredients (
  id text primary key,              -- canonical name, e.g. 'blanco tequila'
  category text not null            -- spirits | liqueurs | produce | mixers | pantry
);

-- false for category-alias ingredients like 'whiskey' that only exist via
-- ingredientEquivalents (picking 'bourbon' or 'rye whiskey' satisfies it)
-- and should never appear as their own checkbox in the pantry picker.
alter table ingredients add column if not exists is_selectable boolean not null default true;

create table if not exists recipe_required_ingredients (
  recipe_id text not null references recipes(id) on delete cascade,
  ingredient_id text not null references ingredients(id) on delete cascade,
  primary key (recipe_id, ingredient_id)
);

create table if not exists users (
  id bigint generated always as identity primary key,
  email text not null unique,
  password_hash text not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  user_id bigint not null references users(id) on delete cascade,
  recipe_id text not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table if not exists shelves (
  user_id bigint not null references users(id) on delete cascade,
  ingredient_id text not null references ingredients(id) on delete cascade,
  primary key (user_id, ingredient_id)
);

create table if not exists ratings (
  id bigint generated always as identity primary key,
  recipe_id text not null references recipes(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  voter_token text not null,        -- random token stored client-side, no login required
  user_id bigint references users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (recipe_id, voter_token)
);

create index if not exists ratings_recipe_id_idx on ratings(recipe_id);

create table if not exists comments (
  id bigint generated always as identity primary key,
  recipe_id text not null references recipes(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_recipe_id_idx on comments(recipe_id);
