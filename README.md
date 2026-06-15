# SEMO

SEMO is a comprehensive, smart e-scooter fleet management platform designed to provide a seamless rental experience for users while empowering administrators with powerful tools to oversee and operate their business. 

The system bridges the gap between customers looking for convenient urban mobility and fleet operators who need real-time data, reliable tracking, and efficient maintenance management. Built with a robust Spring Boot backend and a dynamic React frontend, SEMO integrates interactive map routing via GraphHopper to deliver accurate and responsive geographical services. From processing wallet deposits and tracking live scooter locations, to handling secure authentication and generating business analytics, SEMO offers an end-to-end solution for modern micro-mobility services.

## Project Team

**Course:** Nhập môn Công nghệ phần mềm  
**Instructor:** Nguyễn Quốc Tuấn  

| Name | Student ID | Email |
| :--- | :--- | :--- |
| Nguyễn Phong | 202400066 | phong.n2400066@sis.hust.edu.vn |
| Nguyễn Ngọc Tuấn Anh | 202400029 | anh.nnt2400029@sis.hust.edu.vn |
| Nguyễn Hải Yến Nhi | 202400064 | nhi.nhy2400064@sis.hust.edu.vn |
| Đặng Bảo Quân | 202416319 | quan.db2416319@sis.hust.edu.vn |
| Phạm Đình Minh Đức | 202400038 | duc.pdm2400038@sis.hust.edu.vn |
| Nguyễn Thị Hải Linh | 202416263 | linh.nth2416263@sis.hust.edu.vn |

## Main Features

- JWT login and role-based routing
- Admin management for users, scooters, rentals, maintenance, and analytics
- Customer profile, wallet deposit, and password change
- Map-based scooter creation in the admin area
- Map visualization for scooter locations and analytics results
- Upload support for avatars and scooter images

## Documentation & Tutorials

- 🎥 [Video Tutorial](https://drive.google.com/drive/folders/1Mucl2WwQHXFYH6NkSFJedtME79svJTRD?usp=sharing)
- 👨‍💼 [Admin Guide](docs/admin.md)
- 👤 [Customer Guide](docs/customer.md)
- 📄 [Software Requirements Specification](docs/SEMO-SRS.docx)

## Project Structure

- `backend/`: Spring Boot REST API with JWT authentication, MySQL, and seeded sample data.
- `frontend/`: React + Vite client for user and admin flows.
- `uploads/`: storage for avatar and scooter images.

## Requirements

- Java 21
- Node.js 18+
- npm
- MySQL

## Quick Start

1. Start MySQL.
2. Start the backend.
3. Run `npm install` inside `frontend/`.
4. Start the frontend with `npm run dev`.
5. Log in with the default admin account if you want to access the admin area.

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
- `MAIL_USERNAME` (Your Gmail address for sending emails)
- `MAIL_PASSWORD` (Your Gmail App Password)
- `PORT`

The backend is expected to run on `http://localhost:8888` by default.

## Map Data (GraphHopper) Setup

The backend uses GraphHopper and the A* algorithm for scooter routing, which requires a local map dataset.

1. Navigate to the Geofabrik download server: [https://download.geofabrik.de/asia/vietnam.html](https://download.geofabrik.de/asia/vietnam.html)
2. Download the `.osm.pbf` file (e.g., `vietnam-latest.osm.pbf`).
3. Place the downloaded file inside the `backend/data/` directory. Ensure the file name exactly matches `vietnam-latest.osm.pbf`.
4. Upon starting the backend for the first time, GraphHopper will parse this map file and create a `vietnam-gh` cache folder. *This initial import process may take 1-2 minutes and uses significant RAM.*

> **⚠️ RENDER FREE TIER WARNING:** Building the GraphHopper cache requires >1.5GB RAM. If you deploy to Render's Free/Hobby tier (512MB RAM), the server will crash (Out of Memory) during startup. 
> **Solution:** Build the `vietnam-gh` cache folder locally first, zip it, host the zip file online, and write a custom Build Command on Render to download and extract the cache directly instead of the `.pbf` file.

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

## Testing & Verification

For development and testing purposes, if email sending fails or you want to quickly bypass OTP verification, you can use the **Master OTP Code**: `000000`.

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

## 🚀 Production Deployment Guide (Render + Vercel)

The recommended way to deploy SEMO for production is to use **Render** for the Spring Boot Backend and **Vercel** for the React Frontend.

### Step 1: Deploy Backend to Render.com
1. Create a new **Web Service** on Render and connect your GitHub repository.
2. In the setup form, configure the following:
   - **Root Directory**: `backend`
   - **Environment**: `Docker` (Render will automatically detect the `Dockerfile` inside the `backend` folder).
3. Under the **Advanced** section, add the following Environment Variables:
   - `DB_PASSWORD`: Your Aiven MySQL database password.
   - `JWT_SECRET`: A long random secret string.
   - `JWT_EXPIRATION`: `86400000` (24 hours).
   - `MAIL_USERNAME`: Your Gmail address (e.g., `youremail@gmail.com`).
   - `MAIL_PASSWORD`: Your Gmail **App Password** (16 characters, no spaces).
4. Click **Create Web Service**. Wait for the deployment to finish (it may take 5-10 minutes).
5. Once deployed, copy your backend URL (e.g., `https://semoproject-backend.onrender.com`).

### Step 2: Deploy Frontend to Vercel
1. Log in to [Vercel](https://vercel.com), click **Add New** -> **Project**, and import your GitHub repository.
2. Set the **Root Directory** to `frontend`.
3. In the **Environment Variables** section, add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL from Step 1 (e.g., `https://semoproject-backend.onrender.com` - without a trailing slash).
4. Click **Deploy**. Vercel will automatically build the React app and inject the API URL.
5. Vercel will generate a live URL for your frontend (e.g., `https://semoproject-frontend.vercel.app`).

### Important Note on Frontend Routing
The `frontend` directory contains a `vercel.json` file. This file is required to prevent 404 errors when refreshing pages in a Single Page Application (SPA) on Vercel. It automatically rewrites all requests to `index.html`.
