create extension if not exists "pgcrypto";

do $$ begin
  create type patient_status as enum ('waiting', 'serving', 'completed');
exception
  when duplicate_object then null;
end $$;

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  token_number integer not null unique,
  patient_name text not null check (char_length(patient_name) between 2 and 80),
  status patient_status not null default 'waiting',
  created_at timestamptz not null default now()
);

create index if not exists patients_status_idx on patients (status);
create index if not exists patients_token_number_idx on patients (token_number);
create index if not exists patients_created_at_idx on patients (created_at);
