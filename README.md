# Queue Cure '26

A real-time clinic queue management system built for the Queue Cure '26 Hackathon.

## Problem Statement

Many clinics still rely on paper tokens and manual queue management. Patients often wait without knowing their position in the queue, while receptionists manage appointments manually.

Queue Cure provides a digital solution with live queue updates, appointment management, doctor-wise queues, and estimated waiting times.

---

## Features

### Reception Dashboard

- Add patient appointments
- Doctor-wise appointment queues
- Separate queue management for each doctor
- Patient status tracking
  - Waiting
  - Serving
  - Completed
  - Missed
- Live queue updates
- Automatic token generation
- Average consultation time calculation
- Daily queue reset

### Patient Waiting Room

- View current serving token
- View tokens ahead
- Estimated waiting time
- Real-time updates without refresh

### Appointment Management

- Book appointments
- Select doctor
- Select priority level
- Appointment history
- Doctor-specific appointment lists

### Real-Time Communication

- Socket.IO based live synchronization
- Instant updates across all connected screens

---

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- Socket.IO

### Database

- Supabase PostgreSQL

### Deployment

- Vercel (Frontend)
- Render (Backend)
- Supabase (Database)

---

## System Architecture

Reception Dashboard
↓
Express API
↓
Supabase Database
↓
Socket.IO Events
↓
Patient Waiting Room

---

## Database Tables

### Patients

- id
- token_number
- patient_name
- doctor_id
- status
- priority
- created_at

### Doctors

- id
- name
- specialization
- availability

### Appointments

- id
- patient_name
- doctor_id
- appointment_time
- priority
- status

### Settings

- average_consultation_time

### Audit Logs

- queue activity logs

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Abinav2907/queue-care.git
cd queue-care
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment Variables

Create `.env.local`

```env
NEXT_PUBLIC_API_URL=your_backend_url
NEXT_PUBLIC_SOCKET_URL=your_backend_url

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Run Application

Frontend

```bash
pnpm --filter @queue-cure/web dev
```

Backend

```bash
pnpm --filter @queue-cure/api dev
```

---

## Hackathon Requirements Covered

### Reception Screen

✅ Add Patient

✅ Call Next Token

✅ Set Average Consultation Time

### Patient Waiting Room

✅ Current Serving Token

✅ Tokens Ahead

✅ Estimated Waiting Time

### Live Synchronization

✅ Real-time updates using Socket.IO

### Additional Features

✅ Doctor-wise queues

✅ Appointment booking

✅ Queue filtering

✅ Daily queue reset

✅ Status tracking

---

## Future Enhancements

- SMS notifications
- QR-based token system
- Doctor mobile dashboard
- AI wait-time prediction
- Multi-branch clinic support

---

## Team

### Abinav M

B.E Computer Science and Engineering

Chennai Institute of Technology

---

## Live Demo

Add your deployed URL here.

```text
https://your-vercel-app.vercel.app
```

---

## Demo Video

Add your YouTube demo link here.

```text
https://youtube.com/your-demo-video
```

---

## GitHub Repository

https://github.com/Abinav2907/queue-care
