# GavelX — Live Auction Platform

![GavelX](https://img.shields.io/badge/GavelX-Auction%20Platform-f59e0b?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

GavelX is a full-stack, credit-based live auction platform built with React and FastAPI. It features real-time bidding, an AI-powered assistant, live admin-to-bidder chat, automated winner declaration, and a unique Bid Shield system that prevents last-second sniping.

---

## Features

### Bidder Panel
- Secure registration and login with JWT authentication
- Browse live auctions with real-time countdown timers
- Place bids using assigned credits
- Live bid history updates
- Winner announcement popup with confetti
- Personal profile page with stats and win rate
- Bid history export to PDF
- AI assistant bot for help and bidding tips
- Live chat with admin support

### Admin Panel
- Create and manage auction listings with image upload
- Assign and manage credits for each bidder
- Monitor live bids in real time
- Auto auction closing with automatic winner declaration
- Declare winners manually and close auctions
- Broadcast announcements to all bidders
- Live chat with individual bidders
- Bidding reports with charts and leaderboard
- View all registered bidders and their credit balances

### Bid Shield System (Unique Feature)
- **Time Extension** — any bid placed in the last 30 seconds adds 60 seconds to the clock
- **Auto Close** — auctions close automatically when the timer hits zero
- **Credit Insurance** — winner credits deducted, losers get full refund automatically
- Prevents last-second sniping and ensures fair bidding

### Credits System
- Admin assigns a fixed number of credits to each bidder
- Bidders use credits to place bids
- Credits deducted automatically when a bidder wins
- Non-winning bids get credits refunded instantly

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | FastAPI (Python) |
| Database | SQLite + SQLAlchemy |
| Auth | JWT + bcrypt |
| AI Bot | Groq API (Llama 3.1) |
| Real-time Chat | WebSockets |
| Charts | Chart.js |
| PDF Export | jsPDF + AutoTable |
| Image Upload | Pillow + FastAPI Static Files |
| Scheduler | APScheduler |

---

## Project Structure
```
gavelx/
├── frontend/                 # React + Vite
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── AuctionDetail.jsx
│       │   ├── AdminPanel.jsx
│       │   └── Profile.jsx
│       └── components/
│           ├── BotChat.jsx
│           ├── LiveChat.jsx
│           ├── AdminChatPanel.jsx
│           ├── ImageUpload.jsx
│           ├── ExportPDF.jsx
│           ├── WinnerPopup.jsx
│           └── ReportsDashboard.jsx
└── backend/                  # FastAPI + Python
    ├── routers/
    │   ├── auth.py
    │   ├── auctions.py
    │   ├── bids.py
    │   ├── credits.py
    │   ├── bot.py
    │   ├── chat.py
    │   ├── reports.py
    │   └── upload.py
    ├── main.py
    ├── models.py
    ├── database.py
    └── scheduler.py
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Groq API key (free at groq.com)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib bcrypt python-dotenv websockets httpx python-multipart pillow apscheduler
```

Create `.env` file in backend folder:
```
DATABASE_URL=sqlite:///./gavelx.db
SECRET_KEY=gavelx-super-secret-key-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=your_groq_api_key_here
```

Run the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm install axios react-router-dom chart.js jspdf jspdf-autotable
npm run dev
```

---

## Usage

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Landing page |
| http://localhost:5173/register | Register as bidder or admin |
| http://localhost:5173/login | Login |
| http://localhost:5173/dashboard | Bidder dashboard |
| http://localhost:5173/admin | Admin panel |
| http://localhost:8000/docs | API documentation |

### Admin Registration
Use the secret code `GAVELX_ADMIN_2024` during registration to create an admin account.

---

## Screenshots

### Landing Page
Professional dark-themed landing page with features overview and call to action.

### Dashboard
Live auction cards with countdown timers, search filter and bid history.

### Auction Detail
Real-time bidding with Bid Shield timer, live bid history and credit stats.

### Admin Panel
6-tab admin panel — manage auctions, create listings, assign credits, live chat, reports.

### Reports Dashboard
Charts showing bids per auction, credits per bidder, leaderboard and recent activity.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login and get token |
| GET | /auth/me | Get current user |
| GET | /auctions/all | Get all active auctions |
| POST | /auctions/create | Create auction (admin) |
| POST | /auctions/{id}/close | Close auction (admin) |
| POST | /bids/{id}/place | Place a bid |
| GET | /bids/my/history | Get bid history |
| POST | /credits/assign | Assign credits (admin) |
| GET | /credits/balance | Get credit balance |
| POST | /bot/ask | Ask AI assistant |
| WS | /chat/ws/{id}/{token} | WebSocket chat |
| POST | /upload/image | Upload auction image |
| GET | /reports/summary | Get platform stats |

---

## Unique Features

**Bid Shield** is GavelX's signature feature that makes auctions fair and exciting:

1. If a bid is placed in the last 30 seconds, the auction clock extends by 60 seconds
2. This prevents last-second sniping that ruins traditional auctions
3. The auction continues until no one bids in the final 30 seconds
4. The true highest bidder always wins

---

## License

MIT License — feel free to use and modify for your own projects.

---

Built with by a beginner developer in one session using React, FastAPI and a lot of determination.
```

---

**How to upload to GitHub:**

**Step 1 — Create `.gitignore`** in your `gavelx` root folder:
```
backend/venv/
backend/__pycache__/
backend/*.db
backend/uploads/
backend/.env
frontend/node_modules/
frontend/dist/
.env
