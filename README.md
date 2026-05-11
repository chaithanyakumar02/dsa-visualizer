# DSA Visualizer 🧠

An interactive full-stack web application that helps you **visualize Data Structures and Algorithms** step by step. Paste your code, get an AI-powered trace, and watch the execution come to life visually.

🔗 **Live Demo:** [dsa-visualizer-lime-seven.vercel.app](https://dsa-visualizer-lime-seven.vercel.app)

---

## Features

- 📊 **Step-by-step visualizations** for Arrays, Trees, and Linked Lists
- 🤖 **AI-powered code tracing** using Groq API — paste any DSA code and get a dynamic visual execution trace
- 🔐 **User authentication** via Supabase Auth (register, login, logout)
- 📁 **Practice session dashboard** — tracks your activity and stores history per user
- ⚡ **REST API backend** built with Flask
- ☁️ **Deployed on Vercel** with GitHub version control

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| AI / LLM | Groq API |
| Database & Auth | Supabase (PostgreSQL) |
| Frontend | HTML, CSS, JavaScript |
| Deployment | Vercel |

---

## Project Structure

```
dsa-visualizer/
├── app.py               # Flask app — routes, auth, API endpoints
├── groq/              # Groq API integration — code trace parser
├── auth/                # Supabase client setup
├── templates/           # HTML templates (index, tree, linkedlist, dashboard)
├── static/              # CSS and JavaScript files
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables (not committed)
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/chaithanyakumar02/dsa-visualizer.git
cd dsa-visualizer
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
SECRET_KEY=your_flask_secret_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### 4. Run the app

```bash
python app.py
```

Visit `http://localhost:5000` in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/trace` | Submit code + input → get AI-generated step trace |
| POST | `/api/save-session` | Save a practice session to the database |
| GET | `/dashboard` | View personal practice history |

---

## How the AI Trace Works

1. User pastes DSA code and provides a test input
2. The code and input are sent to the **Groq API** with a structured prompt
3. Groq returns a step-by-step execution trace in JSON format
4. The frontend renders each step visually on the canvas

---

## Author

**Chaithanya Kumar Enagathala**
[LinkedIn](https://www.linkedin.com/in/chaithanya-kumar-enagathala-61660834a/) | [GitHub](https://github.com/chaithanyakumar02)
