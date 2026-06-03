# SEMO

SEMO is a smart e-scooter fleet management platform with authentication, scooter tracking, maintenance management, and analytics.

## Project Structure

- `backend/`: Spring Boot REST API with JWT authentication, MySQL, and seeded sample data.
- `frontend/`: React + Vite client for user and admin flows.
- `uploads/`: storage for avatar and scooter images.

## Requirements

- Java 21
- Node.js 18+
- npm
- MySQL

## Backend Setup

Open a terminal in `backend/` and run:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

If you want to skip tests during packaging:

```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```

Before starting the backend, make sure the following environment variables are configured if your setup requires them:

- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `PORT`

The backend is expected to run on `http://localhost:8888` by default.

## Frontend Setup

Open a terminal in `frontend/` and install the dependencies:

```bash
cd frontend
npm install
```

Then start the development server:

```bash
cd frontend
npm run dev
```

To create a production build:

```bash
cd frontend
npm run build
```

The frontend is configured to talk to `http://localhost:8888` by default.

## Default Admin Account

- Email: `admin@semo.com`
- Password: `Admin@123`

## Main Features

- JWT login and role-based routing
- Admin management for users, scooters, rentals, maintenance, and analytics
- Customer profile, wallet deposit, and password change
- Map-based scooter creation in the admin area
- Map visualization for scooter locations and analytics results
- Upload support for avatars and scooter images

## How to Use Swagger UI (API Wrapper)

Swagger UI is a visual interface that allows you to read documentation and test APIs directly in your browser without needing third-party software (like Postman).

### Accessing the Interface
After starting the Spring Boot application, open your web browser and navigate to the following URL. For example, with port *8888*:
**[http://localhost:8888/swagger-ui/index.html](http://localhost:8888/swagger-ui/index.html)**

### Authentication Guide (Attaching JWT Token)
Because the SEMO system is secured, you need to "unlock" it before calling APIs that require login privileges (such as Start Rental, End Rental, View History).

1. Scroll to the top of the Swagger UI page, find and click the **`Authorize`** button (with the padlock icon 🔓).
2. A dialog box will appear. In the **Value** field, paste your **JWT Token** string.
   *(This token is obtained from the `Response Body` after you successfully call the Login API).*
3. Click the green **`Authorize`** button, then click **`Close`**.
4. At this point, the padlock will change to a locked state 🔒. The system will automatically attach the VIP pass (Header: `Authorization: Bearer <token>`) to every API you call afterward.

### How to Test an API (Try it out)
To test any API (e.g., `POST /api/rentals/start`), follow these steps:

1. Click to expand the API you want to test from the list.
2. Click the **`Try it out`** button in the top right corner.
3. If the API requires input data (Request Body or Path Variable), the input fields will unlock for you to fill in the information.
    * *Example of entering a JSON Body to start a rental:*
      ```json
      {
        "scooterId": 1
      }
      ```
4. Click the blue **`Execute`** button to send the Request.
5. Scroll down to the **`Responses`** section to see the result returned from the Server:
    * **Code:** HTTP status code (200 OK, 201 Created, 400 Bad Request, 500 Error...).
    * **Response body:** JSON data or error message from the Backend.

> **Note:** If the Server returns a **401 Unauthorized** or **403 Forbidden** error, double-check if the JWT padlock has been set with the correct token, or if that token has expired.

## Quick Start

1. Start MySQL.
2. Start the backend.
3. Run `npm install` inside `frontend/`.
4. Start the frontend with `npm run dev`.
5. Log in with the default admin account if you want to access the admin area.
