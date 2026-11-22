# EcoMind automatic activity tracking

EcoMind now has an optional server-side Google sign-in and Google account storage quota connector. Manual activity entry remains available. Google sign-in requests only `openid`, `email`, and `profile`; storage access is a separate opt-in and requests `drive.metadata.readonly`.

Google does not provide ChatGPT, Gemini, Claude, Copilot, general network transfer, or device CPU/GPU usage through this integration. Those remain manual or require separate provider/device connectors. The dashboard trend uses saved activity records. Forecasts are a simple monthly linear trend estimate and appear only after at least six records span two or more months; the current code does not train or validate a Random Forest model.

## Run locally

1. Create a Google Cloud project and configure an OAuth consent screen.
2. Create an OAuth 2.0 Client ID with application type **Web application**. Add `http://localhost:3001/api/auth/callback` as an authorized redirect URI. Enable Google Drive API.
3. Copy `.env.example` to `.env`, then set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and the redirect URI. Generate independent secrets with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`; use one for `SESSION_SECRET` and one for `TOKEN_ENCRYPTION_KEY`.
4. Run `npm install`.
5. Start the API with `npm run api` and the Vite frontend with `npm run dev` in separate terminals.

The OAuth callback URL must match exactly in Google Cloud Console and `GOOGLE_REDIRECT_URI`. In production, use HTTPS, set the production redirect URI, set `NODE_ENV=production`, protect the SQLite database directory, and back up the encryption key separately. Never put OAuth secrets in Vite variables or commit `.env`.

## Data and estimates

The API keeps user profiles, encrypted Google tokens, consent records, Drive quota measurements, and submitted activity records in SQLite. Routes derive the user ID from the server session; clients cannot select another user's ID. Sessions use an HTTP-only, same-site cookie. OAuth tokens are encrypted with AES-256-GCM using `TOKEN_ENCRYPTION_KEY`.

Drive's `about.storageQuota.usageInDrive` reports storage used by Drive files. The reported storage limit is shared across Google services and may be pooled for Workspace accounts. A quota snapshot is a measured amount. Its energy and CO₂ are estimates from configurable monthly factors and do not infer file age. AI usage, network transfer, and local compute are not inferred from Google sign-in. The existing manual input experience is retained.

API endpoints: `GET /api/auth/me`, `GET /api/auth/google`, `GET /api/google/drive/connect`, `GET /api/google/drive/status`, `POST /api/google/drive/sync`, `GET /api/google/drive/history`, `POST /api/google/drive/disconnect`, `GET/POST /api/activities`, `DELETE /api/activities`, and `DELETE /api/account`.
