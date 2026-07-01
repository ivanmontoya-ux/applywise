# ApplyWise Job Aggregator

ApplyWise is a graduate job-search and application-tracking workspace.

Canonical project directory:

```text
/Users/angelocravario/Documents/GitHub/applywise
```

Use this GitHub folder as the website/app root. The app is split into:

- `client/` - React/Vite frontend.
- `server/` - Express API and SQLite database.
- `ui-prototype/` - static UI prototype reference.

## Run Locally

From the project root:

```bash
npm run dev
```

The frontend runs through Vite and proxies API calls to the backend.

## Production-Style Run

Build the client, then start the server:

```bash
npm run build
npm start
```

After `npm run build`, the server serves the website from `client/dist`, so the app no longer depends on any old Desktop or Codex sandbox directory.

Team members: Jacob, Angelo, Theresa, Ivan, Elisa, Ophelie, Gayathri.
