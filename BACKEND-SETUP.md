# Separate Vercel Deployments

The repository contains two independent Vercel projects:

- `frontend/` is the Vite site.
- `backend/` is the Express API and its Vercel serverless functions.

Create two Vercel projects from the same Git repository. Set the **Root Directory** to the matching folder for each project. Deploy the backend first so you can use its URL in the frontend settings.

## Backend project

Set the Vercel Root Directory to `backend`. Use the default install/build settings; the API functions are in `backend/api/`.

Add these backend environment variables in Vercel:

```text
MONGODB_URI=<your MongoDB Atlas connection string>
ADMIN_PASSWORD=<a long, unique password>
CLIENT_ORIGIN=<the deployed frontend origin, without a trailing slash>
```

`CLIENT_ORIGIN` is the frontend's origin (not the backend URL). For the current
frontend deployment, set it to
`https://shiv-suman-rahi-portfolio-djr8.vercel.app`. If you use a custom
domain, include that origin too. Separate multiple origins with commas. The
backend checks the browser's `Origin` header against this allowlist and handles
CORS preflight requests. Localhost origins are allowed automatically when
`CLIENT_ORIGIN` is not set. Optional email and WhatsApp notification variables
are listed in `backend/.env.example`.

After deployment, verify the API at `https://<backend-domain>/api/health`. The
health endpoint and CORS preflight requests do not require MongoDB; contact and
admin API calls do. If they return `503`, check `MONGODB_URI` and confirm
MongoDB Atlas network access permits connections from Vercel.

## Frontend project

Set the Vercel Root Directory to `frontend`. Vercel should detect Vite automatically.

Add this frontend environment variable in Vercel:

```text
VITE_API_URL=https://<backend-domain>
```

Set it to the backend's origin (not the frontend URL), without a trailing slash
or `/api`. This value is embedded during the frontend build, so redeploy the
frontend after changing it. The Vercel rewrite in `frontend/vercel.json` serves
the SPA for client-side routes.

## Local development

Keep backend secrets in `backend/.env`. For a new checkout, copy `backend/.env.example` to `backend/.env` once, then replace its placeholders. Do not overwrite an existing `.env`. Set `MONGODB_URI` and `ADMIN_PASSWORD`; `CLIENT_ORIGIN` must include the frontend's local origin and deployed origin(s). Start the API from the repository root:

```powershell
Copy-Item backend\.env.example backend\.env
npm --prefix backend install
npm --prefix backend run dev
```

In another terminal, copy the frontend environment template and start the UI:

```powershell
Copy-Item frontend\.env.example frontend\.env
npm --prefix frontend install
npm --prefix frontend run dev
```

Keep `VITE_API_URL=http://localhost:5000` in `frontend/.env`. The site runs at `http://localhost:5173`, and the API health check is `http://localhost:5000/api/health`.

## Contact messages

The contact endpoint is `POST /api/contact`. Submitted records are stored in the `portfolio.contactmessages` MongoDB collection. Resume PDFs (up to 10 MB) are stored in MongoDB so they persist across serverless invocations and redeploys.
