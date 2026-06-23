alter table patients
  add column if not exists consultation_end_time timestamptz;

create index if not exists patients_consultation_end_time_idx
  on patients (consultation_end_time)
  where consultation_end_time is not null;
