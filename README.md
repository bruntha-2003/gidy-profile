# 🚀 Gidy Profile Page — Full-Stack Technical Challenge

A full-stack profile page application built as part of the Gidy Associate Software Developer assessment. Features a polished UI, RESTful API, SQLite database, and two innovative features: **Skill Endorsements** and an **AI Bio Generator**.

---

## ✨ Features

### Core Requirements
- 📱 **Responsive UI** — Works beautifully on desktop and mobile
- 🔄 **Edit Mode** — Click "Edit Profile" to update all profile data including name, bio, social links, skills, and experience
- 🔗 **RESTful API** — Express.js backend with clean endpoints
- 🗄️ **Persistent Database** — SQLite via `better-sqlite3` stores all profile data
- 🌐 **Live Data** — Frontend fetches from backend on every load

### Innovation Features
1. **🏆 Skill Endorsement System** — Any visitor can endorse your skills with their name. Hover a skill badge and click the 👍 icon. Endorsements persist in the database and update in real time.
2. **🤖 AI Bio Generator** — While editing your profile, click "Generate with AI" in the Bio field. The backend calls Claude (Anthropic API) to write a personalized, non-clichéd bio based on your name, title, location, and skills. Falls back gracefully if no API key is set.

### Bonus
- 🌙 **Dark/Light Theme Toggle** — Preference persists via localStorage
- 📊 **Interactive Work Timeline** — Visual career history with current role highlighted
- 🗂️ **Tabbed Layout** — Overview, Experience, and Projects sections

---

## 🛠 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | React 18, Axios, CSS3 | Fast, component-based UI with no heavy dependencies |
| **Backend** | Node.js, Express.js | Lightweight, fast REST API |
| **Database** | SQLite (better-sqlite3) | Zero-config, file-based, perfect for this scale |
| **AI** | Anthropic Claude API (haiku-4-5) | Fast, affordable bio generation |
| **Fonts** | Syne + DM Sans (Google) | Professional, distinctive pairing |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/gidy-profile.git
cd gidy-profile
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create a `.env` file (optional, for AI bio generation):
```env
PORT=5000
ANTHROPIC_API_KEY=your_api_key_here   # optional
```

Start the backend:
```bash
npm run dev        # development (with nodemon)
# or
npm start          # production
```

The API will be available at `http://localhost:5000`

### 3. Set up the Frontend
```bash
cd ../frontend
npm install
```

Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profile/1` | Get full profile (with skills, timeline, projects) |
| `PUT` | `/api/profile/1` | Update profile data |
| `POST` | `/api/profile/1/avatar` | Upload profile picture |
| `POST` | `/api/profile/1/generate-bio` | AI-generated bio |
| `POST` | `/api/skills/:id/endorse` | Endorse a skill |
| `GET` | `/api/skills/:id/endorsers` | List skill endorsers |

---

## 💡 Innovation Explanation

### Why Skill Endorsements?
On a platform like Gidy where career development is central, **social proof matters**. LinkedIn's endorsement system is powerful because it transforms a static list of skills into a community-validated credential. I added a lightweight, frictionless version of this — no account required, just a name — to demonstrate the concept without over-engineering it. Each endorsement is timestamped and persisted, enabling future features like "top endorsers" or email notifications.

### Why AI Bio Generator?
Writing a compelling professional bio is genuinely hard. People either undersell themselves or default to clichés. The AI bio generator addresses a **real pain point** at exactly the right moment (profile editing) by taking structured data the user has already provided (name, title, location, skills) and turning it into polished prose. The Claude API is ideal for this — it produces natural, non-generic text even with a minimal prompt. The feature degrades gracefully: if no API key is configured, a sensible template is returned instead.

---

## 📁 Project Structure

```
gidy-profile/
├── backend/
│   ├── server.js          # Express API + SQLite logic
│   ├── package.json
│   └── uploads/           # Avatar images (gitignored)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main app + all components
│   │   ├── App.css        # All styles with CSS variables
│   │   └── index.js       # React entry
│   └── package.json
└── README.md
```

---

## 🌐 Deployment

- **Frontend**: Deploy `frontend/` to Vercel — set `REACT_APP_API_URL` to your backend URL
- **Backend**: Deploy `backend/` to Railway or Render — set `ANTHROPIC_API_KEY` env var
- **Database**: SQLite file is created automatically on first run

---

## 📬 Submission

Submitted by: [Your Name]  
Email: [your@email.com]  
GitHub: [repo URL]  
Live Demo: [deployment URL]
