# TANSEED TNAA — AI-Powered Grant Eligibility Platform

An intelligent application platform for Tamil Nadu's **TANSEED** (Tamil Nadu Startup Seed Grant Fund) — the state's flagship seed fund initiative for early-stage startups. Built with FastAPI, ChromaDB RAG, and a premium Apple-inspired React frontend.

## Screenshots

| Landing Page | Step 1: Entity & Eligibility |
|:---:|:---:|
| ![Landing](screenshots/01-landing-page.png) | ![Step 1](screenshots/02-step1-entity-eligibility.png) |

| Step 2: Financials & Impact | Step 3: Document Upload |
|:---:|:---:|
| ![Step 2](screenshots/03-step2-financials.png) | ![Step 3](screenshots/04-step3-document-upload.png) |

| Eligibility Results | Application Draft |
|:---:|:---:|
| ![Results](screenshots/05-eligibility-results.png) | ![Draft](screenshots/06-application-draft.png) |

## Architecture

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + Vite — Apple-inspired glassmorphism UI with full accessibility
- **Backend:** FastAPI with ChromaDB vector store for RAG-grounded eligibility checking
- **RAG Pipeline:** LangChain-powered retrieval over official TANSEED guidelines documents

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Features

- **Multi-step application flow** — Guided intake from entity details through document upload
- **AI-powered eligibility check** — RAG-grounded evaluation against official TANSEED criteria
- **Fallback engine** — Works offline with rule-based checking when the RAG pipeline is unavailable
- **Application draft generation** — AI-assisted draft with executive summary, market opportunity, use of funds, and impact statement
- **Apple-inspired design** — Glassmorphism surfaces, rich animations, responsive layout
- **Keyboard accessible** — WCAG-aware form controls with clear state indicators

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Liveness probe |
| `/eligibility` | POST | Check TANSEED eligibility |
| `/draft` | POST | Generate application draft |
| `/ingest` | POST | Re-ingest guidelines into vector store |

See [backend README](backend/README.md) for full API documentation.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite 8, Lucide Icons |
| Backend | Python 3.12+, FastAPI, ChromaDB, LangChain |
| Testing | Vitest (frontend), pytest (backend) |
| Design | Apple HIG-inspired, glassmorphism, 8px grid |
