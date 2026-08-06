# PRINCE ADS • Enterprise Advertisement Engine & Management Platform

A standalone, full-stack advertisement management platform with a Node.js + Express REST API backend and a React + Vite + Tailwind CSS frontend (Black + Blue Theme).

---

## 🚀 Key Features

- **Secure JWT Admin Authentication**: Full admin login with password hashing and session tokens.
- **Multi-Format Ad Support**: Create and serve **Image Ads**, **Video Stream Ads**, and **Interactive HTML Code Ads**.
- **Campaign Manager**: Set Priority weights (1-10), Target Pages (`/cinema`, `/vip`), Placements (`preshow`, `intermission`, `banner`, `popup`, `sidebar`), and Start/End dates.
- **Analytics Dashboard**: Real-time impression tracking, click conversion logging, and Click-Through Rate (CTR) reports.
- **API Key Management**: Issue and revoke API Keys for external apps (e.g. Prince Studios Cinema).
- **Interactive REST API Sandbox**: Test endpoints live directly from the dashboard.
- **MongoDB + Automatic Memory Fallback**: Connects to MongoDB database if present, or operates seamlessly in fast memory DB fallback mode.

---

## 📡 Provided REST API Endpoints

| Method | Endpoint Path | Description |
| --- | --- | --- |
| `GET` | `/api/ads` | List all active ad campaigns |
| `GET` | `/api/ads/banner` | Fetch weighted priority banner ad |
| `GET` | `/api/ads/video` | Fetch weighted priority video pre-roll ad |
| `GET` | `/api/ads/placement/:placement` | Fetch ad by placement (`preshow`, `intermission`, `banner`, `popup`) |
| `POST` | `/api/ads` | Create new ad campaign (Auth protected) |
| `PUT` | `/api/ads/:id` | Update existing ad campaign |
| `DELETE` | `/api/ads/:id` | Delete ad campaign |
| `POST` | `/api/ads/impression/:id` | Record ad view counter |
| `POST` | `/api/ads/click/:id` | Record CTA click counter |
| `POST` | `/api/auth/login` | Admin JWT login |
| `GET` | `/api/keys` | List active integration API keys |

---

## 💻 How to Run

### Option 1: Run Full-Stack (Server + Client Together)
```bash
# Inside c:\Users\princ\OneDrive\Desktop\prince-ads
npm run dev
```

### Option 2: Run Server and Client Separately
```bash
# Start Express Backend API (Port 5000)
cd server
npm start

# Start React Frontend Admin (Port 3000)
cd client
npm run dev
```

---

## 🔑 Demo Credentials
- **Admin Username**: `admin`
- **Admin Password**: `adminpassword123`
- **Sample API Key**: `pa_live_prince_cinema_98f24a12`
