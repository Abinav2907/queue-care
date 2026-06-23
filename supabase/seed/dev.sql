insert into settings (id, avg_consultation_time)
values (1, 10)
on conflict (id) do update
set avg_consultation_time = excluded.avg_consultation_time;

insert into patients (token_number, patient_name, status)
values
  (1, 'Anaya Sharma', 'completed'),
  (2, 'Rohan Mehta', 'serving'),
  (3, 'Mira Kapoor', 'waiting'),
  (4, 'Dev Patel', 'waiting')
on conflict (token_number) do nothing;
