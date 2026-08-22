-- Initial schema for Dynamic Forms

create table users (
  id uuid primary key default gen_random_uuid(),
  username varchar not null unique,
  password varchar not null
);

create table forms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id),
  title varchar not null,
  public_slug varchar unique,
  is_active boolean not null default false,
  draft_version_id uuid,
  published_version_id uuid,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table form_versions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  version_number integer not null,
  status varchar not null check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null,
  published_at timestamptz,
  schema jsonb not null default '{}',
  unique (form_id, version_number)
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  version_id uuid not null references form_versions(id),
  submitted_at timestamptz not null,
  answers jsonb not null default '{}'
);

-- The schema declares draft_version_id / published_version_id as plain uuid
-- columns; back them with FKs now that both tables exist.
alter table forms
  add constraint forms_draft_version_fk
  foreign key (draft_version_id) references form_versions(id);

alter table forms
  add constraint forms_published_version_fk
  foreign key (published_version_id) references form_versions(id);

create index forms_owner_idx on forms(owner_id);

create index submissions_form_date_idx
  on submissions(form_id, submitted_at desc);