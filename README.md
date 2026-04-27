# CrisisControl 🚨

CrisisControl is a modern, real-time emergency response and crisis management system. It provides an intuitive interface for emergency responders and guests to report, prioritize, and track emergency incidents dynamically on an interactive map.

## 🌟 Key Features

* **Real-time Emergency Tracking:** Interactive maps using Leaflet to view live emergency incidents for both responders and guests.
* **AI Emergency Prioritization:** Intelligent sorting and prioritization of emergency alerts using AI-based classification to address critical situations first.
* **Offline-First Demo Mode:** Fully autonomous frontend capable of running via GitHub Pages, with local storage-based data management and an internal event bus for seamless demonstration.
* **Live Updates:** WebSocket integration for real-time status updates and new emergency alerts.
* **Authentication:** Secure login and signup flows with role-based routing (Responder / Guest dashboards).
* **Responsive Design:** Beautiful, dynamic UI built with Tailwind CSS and Framer Motion for smooth animations and an optimal experience across devices.

## 🛠️ Technology Stack

**Frontend:**
* React 18
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* Leaflet & React-Leaflet
* Lucide React

**Backend:**
* Go 1.22
* Gorilla WebSocket
* Docker

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* Go (1.22 or higher)
* Docker (optional, for containerized deployment)

### Local Development

#### 1. Setup the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will start a local development server at `http://localhost:5173`.

#### 2. Setup the Backend
```bash
# From the root directory
go mod tidy
go run ./cmd/api
```
The Go backend will handle API endpoints and WebSocket connections.

## ☁️ Deployment

* **Frontend:** Configured for deployment to GitHub Pages (`npm run deploy`).
* **Backend:** Contains a `Dockerfile` and `cloudbuild.yaml` for seamless deployment to cloud platforms like Railway or Google Cloud Run.



