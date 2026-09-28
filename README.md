# Mini CRM with AI Assist ⚡

A clean, full-stack Customer Relationship Management (CRM) web application with built-in AI email assistance. Designed to be lightweight, easy to understand, and straightforward to explain in student/fresher software engineering interviews.

---

## 📌 Project Overview

**Mini CRM with AI Assist** helps sales reps and small business owners manage their customer interactions and deal pipeline in one unified dashboard. It provides secure user authentication, contact organization with search, an interactive drag-and-drop Kanban pipeline, and an AI-driven follow-up email generator that creates customized email drafts based on deal context and contact notes.

---

## ✨ Features

1. **User Authentication (JWT & bcryptjs)**
   - User registration and login with encrypted passwords.
   - Protected API endpoints using Bearer JWT tokens.
   - Strict data isolation: Each user only accesses their own contacts and deals.

2. **Contact Management**
   - Create, read, update, and delete contacts (CRUD).
   - Instant search across name, email, company, and phone.
   - Dedicated contact detail page (`/contacts/:id`) showing associated deals.

3. **Deal Pipeline Management**
   - Track deal value, stage, contact associations, and notes.
   - Filter and view deals in real-time.

4. **Interactive Kanban Board**
   - Visual 5-stage pipeline: `New` ➔ `Contacted` ➔ `Qualified` ➔ `Won` ➔ `Lost`.
   - Native HTML5 drag-and-drop between columns.
   - Automatic background stage synchronization with MongoDB via `PATCH /api/deals/:id/stage`.

5. **AI Follow-up Email Generator**
   - Generates personalized follow-up email drafts based on contact notes, company name, deal stage, and value.
   - One-click "Copy Draft" button.
   - Safe implementation: drafts are generated for review, never sent automatically.
   - Friendly error handling when the AI API key is unconfigured.

6. **Clean, Modern UI**
   - Built with Tailwind CSS and responsive design for mobile and desktop.
   - Concise dashboard showing key KPI metrics: **Total Contacts**, **Total Deals**, and **Won Deals**.

---

## 🛠️ Technologies Used

### Frontend
- **React (JavaScript)**: Functional components with hooks.
- **Vite**: Ultra-fast frontend tooling and development server.
- **React Router (v6)**: Client-side routing with protected route guards.
- **Tailwind CSS**: Utility-first responsive styling.
- **Axios**: HTTP client with request and response interceptors.
- **Lucide React**: Clean, modern iconography.

### Backend
- **Node.js & Express.js**: RESTful API server.
- **MongoDB & Mongoose**: Object Data Modeling (ODM) with schema validation.
- **JSON Web Tokens (JWT)**: Stateless user authentication.
- **bcryptjs**: Secure password hashing.
- **Google Generative AI SDK**: AI assistant for drafting follow-up emails.

---

## 📁 Project Structure

```text
CRM/
├── index.html                  # Frontend HTML entry
├── vite.config.js              # Vite config with API proxy
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── package.json                # Frontend dependencies and scripts
├── .env.example                # Frontend environment template
│
├── src/                        # Frontend source code
│   ├── api/                    # Axios API service modules
│   │   ├── client.js           # Axios instance with JWT interceptor
│   │   ├── auth.js             # Register & login requests
│   │   ├── contacts.js         # Contacts CRUD & search requests
│   │   ├── deals.js            # Deals CRUD & stage patch requests
│   │   └── ai.js               # AI email draft requests
│   ├── components/             # Reusable UI components
│   │   ├── Layout.jsx          # Sidebar + navbar wrapper
│   │   ├── Sidebar.jsx         # Navigation sidebar & user info
│   │   ├── Navbar.jsx          # Mobile header bar
│   │   ├── ContactModal.jsx    # Add/edit contact modal
│   │   ├── DealModal.jsx       # Add/edit deal modal
│   │   └── AIEmailModal.jsx    # AI follow-up generator modal
│   ├── context/
│   │   └── AuthContext.jsx     # Global authentication state
│   ├── pages/                  # Application views
│   │   ├── Login.jsx           # /login
│   │   ├── Register.jsx        # /register
│   │   ├── Dashboard.jsx       # /dashboard (Contacts, Deals, Won Deals)
│   │   ├── Contacts.jsx        # /contacts (Table, search, actions)
│   │   ├── ContactDetail.jsx   # /contacts/:id (Details & deals)
│   │   └── Deals.jsx           # /deals (Kanban drag-and-drop board)
│   ├── App.jsx                 # Route definitions & guards
│   ├── main.jsx                # React root mount
│   └── index.css               # Tailwind CSS directives
│
└── server/                     # Backend API server
    ├── models/
    │   ├── User.js             # User schema (name, email, password)
    │   ├── Contact.js          # Contact schema
    │   └── Deal.js             # Deal schema
    ├── controllers/
    │   ├── authController.js   # Register & login logic
    │   ├── contactController.js# Contacts CRUD logic
    │   ├── dealController.js   # Deals CRUD & stage logic
    │   └── aiController.js     # AI generation endpoint
    ├── middleware/
    │   ├── authMiddleware.js   # JWT protect middleware
    │   └── errorMiddleware.js  # 404 & error handlers
    ├── routes/
    │   ├── authRoutes.js       # /api/auth
    │   ├── contactRoutes.js    # /api/contacts
    │   ├── dealRoutes.js       # /api/deals
    │   └── aiRoutes.js         # /api/ai
    ├── services/
    │   └── aiService.js        # AI integration service
    ├── server.js               # Express app & MongoDB connection
    ├── test-api.js             # Automated API test suite
    ├── package.json            # Backend dependencies
    └── .env.example            # Backend environment template
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB instance (MongoDB Atlas free cluster or local MongoDB)

### Step 1: Clone the repository
```bash
git clone <your-repo-url>
cd CRM
```

### Step 2: Install dependencies
**Backend dependencies:**
```bash
cd server
npm install
cd ..
```

**Frontend dependencies:**
```bash
npm install
```

---

## 🔑 Environment Variables Setup

### 1. Backend (`server/.env`)
Create a `.env` file in the `server` directory by copying `.env.example`:
```bash
cp server/.env.example server/.env
```
Fill in the values:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mini-crm?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-1.5-flash
```

### 2. Frontend (`.env`)
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
For local development, `VITE_API_URL` can be left blank (Vite's built-in proxy handles `/api`):
```env
VITE_API_URL=
```
*(For production, set this to your deployed backend URL, e.g. `https://your-crm-api.onrender.com/api`)*

---

## 🗄️ MongoDB Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Sandbox** cluster.
3. Under **Security ➔ Database Access**, create a database user with read/write privileges.
4. Under **Security ➔ Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) so Render or local dev can connect.
5. Under **Deployment ➔ Database**, click **Connect ➔ Drivers (Node.js)** and copy your connection string.
6. Paste the connection string into `server/.env` under `MONGODB_URI`, replacing `<username>` and `<password>` with your credentials.

---

## 🤖 AI API Setup (Google Gemini)

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and generate a free API key.
3. Add the key to `server/.env`:
   ```env
   AI_API_KEY=your_gemini_api_key
   AI_MODEL=gemini-1.5-flash
   ```
*Note: If you leave `AI_API_KEY` blank, the application will continue to work normally for contacts and deals, and will simply display a friendly notice inside the AI generator modal explaining that the API key needs to be configured.*

---

## 🚀 Running Locally

### Start Backend
In terminal 1:
```bash
cd server
npm run dev
```
Backend runs at: `http://localhost:5000`

### Start Frontend
In terminal 2 (root directory):
```bash
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🧪 Running Automated Tests

An automated test script is included to verify all API endpoints (Registration, Login, Duplicate handling, Contacts CRUD, Search, Deals CRUD, Kanban stage updates, Data isolation between users, and AI error handling):

```bash
cd server
node test-api.js
```

---

## 🌐 Deployment Guide

### Backend: Render
1. Push your repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com/).
3. Connect your repository.
4. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection string>`
   - `JWT_SECRET`: `<Your JWT secret>`
   - `AI_API_KEY`: `<Your Gemini API key>`
   - `AI_MODEL`: `gemini-1.5-flash`
6. Deploy the web service and copy the provided URL (e.g. `https://crm-api.onrender.com`).

### Frontend: Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New ➔ Project**.
2. Import your GitHub repository.
3. Keep the Root Directory as `./` (Vercel automatically detects Vite).
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://crm-api.onrender.com/api` (your Render backend URL with `/api`)
5. Click **Deploy**.

---

## 💡 How to Explain this Project in an Interview

Here are key design decisions you can highlight during your interview:

1. **Clean Separation of Concerns**: 
   - Express controllers handle HTTP requests/responses, Mongoose models manage schema validation, and services encapsulate third-party AI logic.
2. **Security & Data Isolation**:
   - Sensitive user passwords are never stored in plain text; they are salted and hashed using `bcryptjs`.
   - Every database query strictly filters by `userId: req.user._id`, ensuring complete tenant isolation.
   - The AI API key is kept securely on the server and is never exposed to the frontend.
3. **Native HTML5 Drag and Drop**:
   - Rather than installing large drag-and-drop third-party libraries, the Kanban board leverages native browser `dragstart`, `dragover`, and `drop` events with optimistic UI updates for high performance and low bundle size.
4. **Resilient AI Service**:
   - The AI service prompts the LLM to output strict JSON (`{ "subject", "body" }`) and includes regex fallback parsing to guarantee reliable drafts.
