# 🏨 Hotel Management Web App

A modern, full-featured hotel management system for small hotels, with multi-channel booking sync, real-time room status dashboard, and integrated messaging (Facebook, Gmail) — built with React, Express, MySQL, TypeScript, and Tailwind CSS.

---

## 📖 Project Overview

This project helps small hotels optimize booking operations, staff coordination, and guest communication — all in a single web dashboard.

- **Sync bookings from multiple sources:** Airbnb, Gmail, Facebook Messenger...
- **Real-time room status management:** Available, Occupied, Cleaning, Maintenance.
- **Messaging & notifications:** Facebook/Gmail inbox, recent activity logs.
- **Role-based access:** Owner, staff, manager.

---

## 🧩 Key Features

- **Unified Dashboard:**  
  View room status, recent activities, today's check-ins/check-outs.

- **Booking Management:**  
  Add, edit, delete bookings, check room availability, activity history.

- **Visual Room Map:**  
  See room status by floor, click for details and management.

- **Multi-channel sync:**  
  Integrate Gmail APIs for message and booking sync.

- **Role-based login:**  
  Admin, Receptionist, Cleaner with custom UI and permissions.

- **Analytics & reports:**  
  Revenue stats, occupancy rate, activity logs.

---

## 🛠️ Tech Stack

- **Frontend:**  
  - React + Vite + TypeScript  
  - Tailwind CSS  
  - shadcn/ui component library  
  - Radix UI, Lucide Icons  
  - Axios, React Query

- **Backend:**  
  - Express.js  
  - MySQL2  
  - JWT Auth  
  - Dotenv, CORS, Cookie-session  
  - Google APIs

---

## 📂 Folder Structure

```
HotelApp/
├── backend/
│   ├── routes/         # API: auth, gmail, oauth, cronJobs
│   ├── services/       # DB connection, activity logs
│   ├── server.js       # Backend entry point
│   └── .env            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/      # Dashboard, RoomManagement, Booking, Analytics...
│   │   ├── components/ # UI, layout, bookings
│   │   ├── hooks/      # Custom hooks
│   │   ├── lib/        # Shared utilities
│   ├── public/         # Images, favicon, robots.txt
│   ├── index.html      # FE root file
│   └── README.md       # FE documentation
```

---

## ⚡ Getting Started

### 1. Clone repository
```bash
git clone https://github.com/MaiChi-mc/ALittleHouse.git
cd HotelApp
```

### 2. Setup backend
```bash
cd backend
npm install
# Create .env file and configure DB, PORT, SESSION_SECRET, JWT_SECRET
node server.js
```

### 3. Setup frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Access the app
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8080](http://localhost:8080)

---

## 📝 Author & License

- Personal academic project for learning and reference.
- No public contributions accepted.
- For feedback, contact [MaiChi-mc](https://github.com/MaiChi-mc).

---

## 💡 Notes

- To use Gmail sync features, configure API keys and permissions as required.
- Demo data may be reset periodically via cron jobs.

---

## 🌟 Thank you for visiting!
