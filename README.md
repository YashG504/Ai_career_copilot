<div align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status" />
  <h1> AI Career Copilot</h1>
  <p><strong>An advanced, end-to-end career acceleration platform powered by Generative AI.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white" alt="Gemini AI" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>
</div>

---

##  Overview

**AI Career Copilot** is a full-stack platform designed to automate and optimize the job search process. By leveraging the power of Google's Gemini 2.5 Flash LLM, the platform acts as a personal career advisor—parsing resumes, generating personalized learning paths, simulating technical interviews, and finding skill gaps for targeted job roles.

This project was built with a strong emphasis on **performance, security, and scalable system architecture.**

##  Core Features

- 📄 **Smart Resume Analysis:** Upload PDFs/DOCXs. The AI uses **Prompt Chaining** to accurately extract facts and score your resume against ATS criteria.
- 🎯 **Job Match Analyzer:** Compare your resume against specific job descriptions to uncover missing keywords.
- 🎤 **Interactive Mock Interviews:** Simulates technical or HR interviews based on your domain, grading your answers in real-time.
- 🗺️ **AI Learning Path Generator:** Automatically generates a day-by-day customized learning curriculum to bridge your skill gaps.
- ✉️ **Automated Cover Letters:** Generates highly tailored cover letters matching your resume to the job description perfectly.
- 📊 **Performance Dashboard:** View your ATS scores, interview progress, and AI usage metrics through a beautiful, animated UI.

---

##  Technical Architecture (The "Under the Hood")

This isn't just an API wrapper; it's engineered to scale in a production environment:

* **Stateless Cloud Architecture:** Local disk storage is completely bypassed. Resumes are streamed directly to **Cloudinary**, making the application 100% serverless-deployment ready.
* **Database Optimization:** Dashboard analytics aggregate data using concurrent `Promise.all` fetching and MongoDB **Compound Indexes**, dropping query times by over 80%.
* **In-Memory LRU Caching:** Expensive dashboard analytics are cached via `node-cache` (5-minute TTL) to drastically reduce database load during traffic spikes.
* **Advanced AI Pipelines:** Avoids LLM hallucinations by utilizing the Singleton connection pattern, Exponential Backoff retry logic, and multi-step Prompt Chaining.
* **Zero-Trust Security:** API routes are secured with `helmet` HTTP headers, layered `express-rate-limit` brute-force protection, and strict `Zod` request validation to prevent mass-assignment injection attacks.

---

## Tech Stack

### Frontend
- **Next.js (App Router)** for Server-Side Rendering (SSR) & Routing
- **React 18**
- **Tailwind CSS** + **Shadcn/UI** for a premium, accessible component library
- **Framer Motion** for fluid micro-animations

### Backend
- **Node.js** + **Express.js** (REST API)
- **MongoDB** + **Mongoose** (Data Modeling & Indexing)
- **Zod** (Schema Validation)
- **Cloudinary** (Cloud Object Storage)
- **Google Generative AI** (Gemini 2.5 Flash SDK)

---

##  Getting Started

### Prerequisites
Make sure you have Node.js and MongoDB installed on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/YashG504/Ai_career_copilot.git
cd Ai_career_copilot
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add the following keys (see `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_google_gemini_api_key
CLOUDINARY_URL=your_cloudinary_url
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

<div align="center">
  <p>Built with ❤️ by Yash Ghotekar</p>
</div>
