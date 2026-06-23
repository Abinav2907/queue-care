alter table patients
  add column if not exists doctor_name text,
  add column if not exists room text,
  add column if not exists appointment_time timestamptz,
  add column if not exists consultation_start_time timestamptz;

update patients
set
  doctor_name = coalesce(doctor_name, doctors.name),
  room = coalesce(patients.room, doctors.room)
from doctors
where patients.doctor_id = doctors.id;

create index if not exists patients_doctor_status_token_idx
  on patients (doctor_id, status, token_number);

create index if not exists patients_appointment_time_idx
  on patients (appointment_time)
  where appointment_time is not null;
