# Google OAuth Production Setup

This React app uses Google Identity Services in ID-token mode:

1. The browser renders `<GoogleLogin />`.
2. Google returns `response.credential`, a Google ID token.
3. The React app sends that token to the backend:

```http
POST {VITE_API_BASE_URL}/auth/google
Content-Type: application/json

{
  "id_token": "GOOGLE_ID_TOKEN"
}
```

There is no frontend Google redirect callback route in this flow.

## Required Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables for Production:

```env
VITE_API_BASE_URL=https://your-backend-production-domain.example.com
VITE_GOOGLE_CLIENT_ID=362543031409-p9e1qmrlo2crq57j9q81v0h7p32q21q6.apps.googleusercontent.com
```

`VITE_API_BASE_URL` must be the deployed backend origin, not `/` and not the Vercel frontend URL unless the backend is also served there.

For local development:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=362543031409-p9e1qmrlo2crq57j9q81v0h7p32q21q6.apps.googleusercontent.com
```

## Google Cloud Console

Use one OAuth 2.0 Client ID of type `Web application`.

Authorized JavaScript origins:

```text
http://localhost:3000
http://localhost:5173
https://voxora-one.vercel.app
```

Authorized redirect URIs:

```text
Not required for the current <GoogleLogin /> ID-token flow.
```

If the backend later switches to a redirect/code flow, add the exact callback URL implemented by the backend, for example:

```text
https://your-backend-production-domain.example.com/auth/google/callback
http://localhost:8000/auth/google/callback
```

Do not add `https://voxora-one.vercel.app/auth/google` unless that is an actual redirect callback route. In this app, `/auth/google` is a backend `POST` endpoint, not a browser redirect URI.

## Backend Requirements

The backend must:

- Expose `POST /auth/google`.
- Accept JSON body `{ "id_token": "..." }`.
- Verify the ID token audience against the same Google client ID.
- Allow CORS from:

```text
http://localhost:3000
http://localhost:5173
https://voxora-one.vercel.app
```

If production returns `405 Method Not Allowed`, confirm the request URL in DevTools Network. It should be:

```text
https://your-backend-production-domain.example.com/auth/google
```

If it is:

```text
https://voxora-one.vercel.app/auth/google
```

then `VITE_API_BASE_URL` is still wrong or missing in Vercel.
