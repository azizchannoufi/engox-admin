# Engox Fleet Ops — Admin Back-Office

Web command center for Engox Logistics: live tracking, fleet assignment, route planning, and POD audit.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS 4 (tokens ported from the driver app `constants/theme.ts`)
- TanStack Query + Zustand
- Leaflet maps (no API key)
- Mock data by default — API client is wired to the NestJS `Back-End` contracts

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

Mock login: use **Continue as ops lead** (no Firebase required).

## Connect the backend later

1. Copy `.env.example` to `.env`
2. Set `VITE_USE_MOCK=false`
3. Point `VITE_API_BASE_URL` at the NestJS server
4. Replace mock auth with Firebase ID token → `POST /auth/login`
