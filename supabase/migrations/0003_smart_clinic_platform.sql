do $$ begin
  create type priority_level as enum ('normal', 'urgent', 'emergency');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type doctor_availability as enum ('available', 'busy', 'offline', 'paused');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type appointment_status as enum ('booked', 'checked_in', 'cancelled', 'completed');
exception
  when duplicate_object then null;
end $$;

create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null default 'General Medicine',
  availability doctor_availability not null default 'available',
  room text not null default 'A-101',
  created_at timestamptz not null default now()
);

insert into doctors (id, name, specialty, availability, room)
values
  ('00000000-0000-4000-8000-000000000001', 'Dr. Asha Menon', 'General Medicine', 'available', 'A-101'),
  ('00000000-0000-4000-8000-000000000002', 'Dr. Raj Kumar', 'Internal Medicine', 'available', 'A-102'),
  ('00000000-0000-4000-8000-000000000003', 'Dr. Priya Sharma', 'Family Medicine', 'available', 'A-103')
on conflict (id) do nothing;

alter table patients
  add column if not exists doctor_id uuid references doctors(id) default '00000000-0000-4000-8000-000000000001',
  add column if not exists priority priority_level not null default 'normal',
  add column if not exists phone_number text,
  add column if not exists tracking_url text;

create index if not exists patients_doctor_status_idx on patients (doctor_id, status);
create index if not exists patients_priority_idx on patients (priority);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  doctor_id uuid not null references doctors(id),
  scheduled_at timestamptz not null,
  status appointment_status not null default 'booked',
  phone_number text,
  created_at timestamptz not null default now()
);

create index if not exists appointments_doctor_time_idx on appointments (doctor_id, scheduled_at);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on audit_logs (created_at desc);
