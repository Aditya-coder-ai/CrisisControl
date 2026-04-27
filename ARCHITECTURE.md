# CrisisControl: Technologies and Methods

This document provides a comprehensive overview of the technologies, tools, and architectural methods used to build the CrisisControl emergency response platform.

## 🛠️ Core Technologies & Tools

### Frontend & User Interface
* **React 18**: The core library used for building the user interface, utilizing functional components and hooks for state management.
* **TypeScript**: Provides strong typing across the entire codebase to catch errors early and ensure reliable data structures (especially for incident payloads and AI classifications).
* **Vite**: The lightning-fast build tool and development server used to bundle the application.
* **Tailwind CSS**: A utility-first CSS framework used for styling the entire application. It powers the dark mode aesthetics, hazard stripes, and responsive layouts.
* **Framer Motion**: Used for fluid, cinematic animations—such as the pulsing glows, slide-in alerts, and smooth page transitions.
* **Lucide React**: Provides the sleek, consistent SVG icons used throughout the dashboard, map, and forms.

### Mapping & Geolocation
* **Leaflet & React-Leaflet**: Used to render the interactive map on the Tactical Ops view. It provides robust, open-source map rendering with custom markers for different incident severities.

### Deployment & Hosting
* **Firebase Hosting**: The platform used to host the production build. A `firebase.json` file handles routing all requests to `index.html`, which is essential for React Router (Single Page Application).

---

## 🧠 Key Methods & Architecture

### 1. Offline-First Autonomous Architecture
To ensure the system can run seamlessly for demonstrations without relying on an external backend server, the application employs a completely **Offline-First** methodology:
* All database interactions (creating incidents, fetching updates, authentication) are intercepted and redirected to the browser's `localStorage` (`frontend/src/lib/api.ts`).
* The system automatically seeds demo data (like active fires and accidents) if the storage is empty, allowing immediate interaction upon first load.

### 2. Event-Driven Real-Time Synchronization
Instead of relying on remote WebSockets (which require a backend server), the application uses an **Internal Event Bus** (`frontend/src/lib/useWebSocket.ts`):
* When a guest submits a new emergency report, the API layer emits an `incident_created` event.
* The Command Center (Staff Dashboard) and Tactical Ops (Responder Map) listen for these events and update their UI instantly, mimicking a live WebSocket connection.

### 3. Role-Based Access Control (RBAC) & Route Protection
The application features strict security protocols to prevent unauthorized access:
* **Custom Protected Routes**: A `ProtectedRoute` component wraps sensitive pages (Command Center and Tactical Ops). 
* **Token Validation**: It checks `localStorage` for a valid `auth_token`.
* **Role Verification**: It ensures the user's role exactly matches the required clearance (`staff` vs `responder`). If a guest or an unauthorized responder tries to access the Command Center, they are immediately redirected.

### 4. AI-Powered Danger Classification
When an emergency is reported, the incident description is passed through an AI Classifier module (`frontend/src/lib/aiClassifier.ts`):
* **Heuristic Analysis**: The system analyzes the text to determine the severity (Critical, High, Moderate, Low).
* **Keyword Extraction**: It automatically identifies threat factors (e.g., "fire", "casualty").
* **Priority Routing**: Based on the AI's danger score, the incident is sorted dynamically in the Command Center queue so that the most life-threatening alerts are addressed first.

### 5. Single Page Application (SPA) Routing
* **React Router DOM**: Used to handle client-side routing. This ensures that users can navigate between the public home page, login screen, guest reporting form, and staff dashboards without the page ever reloading, preserving the real-time state of the application.
