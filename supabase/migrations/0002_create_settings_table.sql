create table if not exists settings (
  id integer primary key default 1 check (id = 1),
  avg_consultation_time integer not null default 10 check (avg_consultation_time between 1 and 180),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists settings_set_updated_at on settings;
create trigger settings_set_updated_at
before update on settings
for each row
execute function set_updated_at();

insert into settings (id, avg_consultation_time)
values (1, 10)
on conflict (id) do nothing;
