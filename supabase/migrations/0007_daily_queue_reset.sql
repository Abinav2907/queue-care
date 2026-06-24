alter type patient_status add value if not exists 'missed' after 'completed';

alter table patients
  drop constraint if exists patients_token_number_key;

create index if not exists patients_token_number_idx on patients (token_number);
create index if not exists patients_token_scope_idx
  on patients (coalesce(appointment_time, created_at), token_number);
