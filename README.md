# CampusConnect (KITCommunity) 🎓

A full-stack campus community and academic networking platform designed for college ecosystems (tailored for KITCOEK). CampusConnect integrates department circulars, Reddit-style discussion feeds, verified faculty notices, a student marketplace, club activities, and academic calendars into a unified web and mobile experience.

---

## 🌟 Key Features

- **🔐 Multi-Role Authentication**: Role-based access control (RBAC) for **Students**, **Faculty**, **Moderators**, and **Admins** with JWT access and refresh token rotation.
- **📢 Official Faculty Notice Board**: Verified institutional notices, official watermarked notice generator, and priority notice badges.
- **💬 Reddit-Style Channels**: Hierarchical community channels categorized by:
  - *Official Announcements & Notices*
  - *Academic Branches (CSE, AIML, Biotech, Civil, ENTC, etc.)*
  - *17 Campus Clubs & Technical Societies*
  - *Careers & Placement Cell (Internships, Job Openings)*
- **🔥 Algorithmic Feed**: Reddit-inspired logarithmic `hotScore` decay, upvote/downvote engine, and user reputation points system.
- **💭 Threaded Nested Comments**: Multi-level replies and discussions.
- **🛒 Campus Marketplace**: Peer-to-peer student marketplace for textbooks, drafting equipment, electronics, and hostel essentials.
- **📅 Interactive Academic Calendar**: Dynamic semester schedules, examination dates, and council-approved circulars.
- **📊 Campus Polls & Community Requests**: Student-led polls and department request boards.

---

## 🏗️ Architecture & Tech Stack

```text
├── client/          # Frontend SPA (React 18 + Vite + Tailwind/CSS + Lucide Icons)
├── server/          # Backend REST API (Node.js + Express + Mongoose + JWT)
└── .gitignore       # Root Git ignore configuration
```

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB (Local or MongoDB Atlas Cloud)
- **Security**: Bcrypt password hashing, HTTP-only / Bearer JWT auth, CORS

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
cd <REPO_NAME>
```

---

### 2. Backend Setup (`/server`)

1. Navigate to the server directory and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `server/.env` and update the values:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
   ```

3. Seed the initial database (channels, initial users, notices, academic calendar):
   ```bash
   npm run seed
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`.

---

### 3. Frontend Setup (`/client`)

1. Open a new terminal, navigate to the client directory, and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`.

---

## 🔑 Demo Login Accounts

After running `npm run seed`, the following test accounts are pre-configured:

| Role | Username | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `Master Admin` | `admin@kit.edu` | `Admin@123` |
| **Faculty** | `Shekhar Jalane` | `shekhar.jalane@kitcoek.edu` | `Faculty@123` |
| **Student** | `Meeral Pinjani` | `meeral.pinjani@kitcoek.in` | `studentpassword123` |

---

## 📱 Mobile / APK Deployment Notes

When building an Android APK via Android Studio (Capacitor/Cordova/WebView):
- Mobile emulators or physical phones cannot reach `localhost:5000`.
- Update API URLs in `client/src/services/api.js` to point to:
  - **Android Emulator**: `http://10.0.2.2:5000/api`
  - **Physical Device**: `http://<YOUR_PC_LOCAL_IP>:5000/api` (ensure phone and PC are on the same Wi-Fi)
  - **Production**: Your deployed server URL (e.g., Render, Railway, Vercel)
