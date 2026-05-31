# SEMO

Smart E-Scooter Fleet Management, Battery Optimization & Data Analytics.

## Project Structure

- `backend/`: Spring Boot REST API, JWT auth, MySQL, seeded sample data.
- `frontend/`: React + Vite client for user and admin flows.
- `uploads/`: avatar and scooter image storage.

## Requirements

- Java 17+
- Node.js 18+
- MySQL database configured for the backend

## Run Backend

1. Set backend environment variables:
	- `DB_PASSWORD`
	- `JWT_SECRET`
	- `JWT_EXPIRATION`
	- `Port`
2. Start the backend from `backend/`.

## Run Frontend

1. Open `frontend/`.
2. Install dependencies if needed.
3. Start the dev server.

The frontend is configured to talk to `http://localhost:8888` by default.

## Default Admin Account

- Email: `admin@semo.com`

## Main Features

- JWT login and role-based routing
- Admin management for users, scooters, rentals, maintenance, and analytics
- Customer profile, wallet deposit, and password change
- Upload support for avatars and scooter images

## API Reference

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for the endpoint list.
