# Cricket Scorer Pro (Full Stack)

This project contains the Cricket Scorer Pro application, including:
- A React frontend (in the `frontend/` directory)
- A Node.js/Express backend with SQLite (in the `backend/` directory)

## Prerequisites

- Node.js (v16 or later recommended)
- npm (usually comes with Node.js)

## Setup

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <your-repository-url>
    cd cricket-scorer-pro-monorepo
    ```

2.  **Install dependencies for both frontend and backend:**
    This command will run `npm install` in both the `frontend/` and `backend/` directories.
    ```bash
    npm install
    ```

## Development

To run both the frontend and backend development servers concurrently:

```bash
npm run dev
```

- The React frontend will typically be available at `http://localhost:3000` (or another port specified by its dev server, check your frontend setup or update `frontend/package.json` `dev` script if needed. If using a simple static server for `index.html`, this might be different).
- The Express backend API will be available at `http://localhost:3001`.

The frontend is already configured in `DataContext.tsx` and `AuthContext.tsx` to make API calls to `http://localhost:3001/api`.

## Running the Backend Independently

To start only the backend server (e.g., for API testing or if the frontend is served separately):

```bash
npm run dev --prefix backend
```
or
```bash
npm start --prefix backend
```

## Building for Production (Conceptual)

To simulate a production-like scenario where the backend serves the frontend:

1.  **Build the frontend:**
    ```bash
    npm run build:frontend
    ```
    This command needs to be configured in `frontend/package.json` to output static files (e.g., to a `frontend/dist` directory).

2.  **Start the backend:**
    ```bash
    npm run start:backend
    ```
    The `backend/server.js` would need to be modified to serve static files from the frontend's build directory. An example snippet for `server.js`:
    ```javascript
    // // --- Serve Frontend (Example for production) ---
    // const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist'); // Adjust if your build path is different
    // app.use(express.static(frontendBuildPath));
    //
    // app.get('*', (req, res) => {
    //   res.sendFile(path.join(frontendBuildPath, 'index.html'));
    // });
    ```
    This part is commented out in the current `backend/server.js` but can be enabled and configured.

## Database

The SQLite database file (`cricket_app.db`) will be automatically created in the `backend/` directory when the backend server starts for the first time.
An initial admin user is seeded with:
- Username: `admin`
- Password: `password` (For security, **never use plain text passwords in a real application!** Use hashing like bcrypt.)

