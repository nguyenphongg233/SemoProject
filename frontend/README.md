# SEMO Frontend

React + Vite client for the SEMO smart e-scooter management platform.

## Requirements

- Node.js 18+
- Backend running at `http://localhost:8888`

## Setup

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Default Admin Account

- Email: `admin@semo.com`
- Password: `Admin@123`

## Notes

- The app stores the JWT token and user profile in `localStorage`.
- Admin users are routed to the admin area after login.
- If the backend runs on a different port, update `VITE_API_URL` in VS Code workspace settings or your shell environment.
