# Contact Backend Setup

The portfolio contact form uses an Express API and MongoDB Atlas.

## 1. Configure MongoDB

From the project folder, copy the environment template:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace the placeholder values:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/portfolio?retryWrites=true&w=majority
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Keep `.env` private. It is ignored by Git.

## 2. Configure the frontend

Create `.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

## 3. Start the backend

Open a PowerShell terminal:

```powershell
cd "C:\Users\HP\OneDrive\Desktop\Shiv-Suman-Rahi-Portfolio"
npm install
npm run server
```

The API runs at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

## 4. Start the frontend

Open a second PowerShell terminal:

```powershell
cd "C:\Users\HP\OneDrive\Desktop\Shiv-Suman-Rahi-Portfolio"
npm run dev
```

Open:

```text
http://localhost:5173
```

## 5. View submitted messages

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Open your MongoDB project and cluster.
3. Select **Browse Collections**.
4. Open the `portfolio` database.
5. Open the `contactmessages` collection.

Submitted records contain:

- `name`
- `email`
- `message`
- `createdAt`
- `updatedAt`

The contact API endpoint is:

```text
POST http://localhost:5000/api/contact
```

The backend validates all fields before saving them.
