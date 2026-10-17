# Shiv Suman Rahi Portfolio

This repository keeps the portfolio UI and API in separate deployable projects:

- [`frontend/`](./frontend) is the React and Vite application.
- [`backend/`](./backend) is the Express API, including its Vercel serverless
  function entry points.

## Local development

Install and run each project independently from the repository root:

```powershell
npm --prefix backend install
npm --prefix frontend install
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
npm --prefix backend run dev
npm --prefix frontend run dev
```

Only copy each environment template if the corresponding `.env` file does not
already exist. Fill in the required values in `backend\.env`, and keep
`VITE_API_URL` in `frontend\.env` set to `http://localhost:5000`. The frontend
is served at `http://localhost:5173`.

## Separate Vercel deployments

Create two Vercel projects connected to this repository. Set the Root Directory
of one project to `frontend` and the other to `backend`. Configure the required
environment variables in each project. See
[`BACKEND-SETUP.md`](./BACKEND-SETUP.md) for deployment, environment, and API
details.
