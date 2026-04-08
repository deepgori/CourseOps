# CourseOps Toolkit

CourseOps Toolkit is a full-stack internal operations hub for a university's online education department. It brings together course production tracking, media asset management, reporting, and team visibility in a single dark-mode workflow optimized for instructional design teams.

## Features

- Dashboard with department health metrics, course pipeline visibility, and activity feed
- Course Tracker with Kanban drag-and-drop, list view, filters, and detailed editing
- Asset Library with uploads, previews, metadata, and course linking
- Reports with completion, status, department, and asset trend analytics
- Team directory with workload visibility and quick filtering into assigned courses

## Tech Stack

- Frontend: React 18, Vite, React Router v6, Tailwind CSS, Recharts, Lucide React, `@hello-pangea/dnd`, date-fns
- Backend: Node.js, Express, MongoDB, Mongoose, Multer, cors, dotenv

## Project Structure

```text
courseops-toolkit/
├── client/
├── server/
├── README.md
└── .gitignore
```

## Environment Variables

Create `server/.env` from `server/.env.example`:

```bash
MONGODB_URI=<your-mongodb-atlas-connection-string>
PORT=5000
CLIENT_URL=http://localhost:5173
```

Optionally create `client/.env` from `client/.env.example`:

```bash
VITE_API_URL=http://localhost:5000/api
```

## How To Run

```bash
# Clone and install
git clone <repo>
cd courseops-toolkit

# Backend
cd server
npm install
cp .env.example .env
# Add MONGODB_URI to .env
npm run seed
npm run dev

# Frontend
cd ../client
npm install
npm run dev
```

## Scripts

### Server

- `npm run dev` starts the API on port `5000`
- `npm run start` runs the API in production mode
- `npm run seed` populates MongoDB with realistic demo data

### Client

- `npm run dev` starts the Vite development server on port `5173`
- `npm run build` creates a production build
- `npm run preview` previews the production build locally

## Demo Notes

- No authentication is included by design.
- Uploaded files are stored in `server/uploads`.
- Activity is logged automatically for course changes and asset uploads.

