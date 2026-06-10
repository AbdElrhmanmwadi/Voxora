# React Auth Integration Brief

Build frontend authentication for the React app using the existing FastAPI backend auth API.

## Backend Base URL

Use an environment variable:

```env
VITE_API_BASE_URL=http://localhost:8000
```

All auth endpoints are mounted directly under:

```text
/auth
```

Project/data endpoints are under:

```text
/api/v1
```

## Auth Endpoints

### Register

```http
POST /auth/register
```

Request body:

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

Success response:

```json
{
  "message": "Check your email"
}
```

After register, show a screen telling the user to check their email.

### Verify Email

```http
GET /auth/verify-email?token=TOKEN_FROM_EMAIL
```

Success response:

```json
{
  "message": "Email verified successfully"
}
```

Create a React route:

```text
/auth/verify-email?token=...
```

This page should read `token` from the query string and call the backend verification endpoint.

### Login

```http
POST /auth/login
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

Store:

```text
access_token
refresh_token
```

Prefer localStorage for now unless the app already has a safer auth storage pattern.

If backend returns:

```text
401
```

Show invalid email/password.

If backend returns:

```text
403
```

Show email is not verified.

If backend returns:

```text
403
```

with detail `This account uses Google sign-in`, show a message telling the user to use the Google button.

### Google Login

```http
POST /auth/google
```

Request body:

```json
{
  "id_token": "GOOGLE_ID_TOKEN_FROM_FRONTEND"
}
```

Success response (same as login):

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

Frontend setup:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Use `@react-oauth/google`:

```tsx
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <GoogleLogin
    onSuccess={async (response) => {
      if (response.credential) {
        await authApi.googleLogin(response.credential);
      }
    }}
    onError={() => {
      // show error
    }}
  />
</GoogleOAuthProvider>
```

Error handling:

| Status | Meaning |
|--------|---------|
| 401 | Invalid or expired Google token |
| 403 | Google email not verified |
| 409 | Email linked to a different Google account |
| 503 | Google login not configured on backend |

### Refresh Token

```http
POST /auth/refresh
```

Request body:

```json
{
  "refresh_token": "..."
}
```

Success response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

Use this when API requests fail with `401` because the access token expired.

### Logout

```http
POST /auth/logout
```

Request body:

```json
{
  "refresh_token": "..."
}
```

After success, clear stored tokens and redirect to login.

## Authorization Header

For protected backend requests, send:

```http
Authorization: Bearer ACCESS_TOKEN
```

Example:

```js
headers: {
  Authorization: `Bearer ${accessToken}`
}
```

## Required React Work

Create or update:

```text
src/api/client.ts
src/api/auth.ts
src/context/AuthContext.tsx
src/pages/Login.tsx
src/pages/Register.tsx
src/pages/VerifyEmail.tsx
src/components/ProtectedRoute.tsx
```

Adapt paths if the React project already has different folders.

## API Client Behavior

Implement a single API client, preferably Axios if already used.

Requirements:

- Automatically attach `Authorization: Bearer <access_token>` to protected requests.
- On `401`, call `/auth/refresh` once using the stored refresh token.
- Retry the original request with the new access token.
- If refresh fails, clear auth state and redirect to `/login`.
- Avoid infinite refresh loops.

## Auth Context

The auth context should expose:

```ts
type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};
```

## Protected Routes

Any dashboard, projects, upload, processing, search, chat, voice, or translation page should require auth.

If user is not authenticated, redirect to:

```text
/login
```

## Projects Behavior

The frontend must treat projects as user-owned.

When calling project/data APIs, always include the access token:

```http
Authorization: Bearer ACCESS_TOKEN
```

Do not show global projects from other users.

Once the backend has project ownership fully enforced, project listing and project actions should only return or modify projects belonging to the authenticated user.

## UX Requirements

Login page:

- Email input
- Password input
- Submit button
- Google Sign-In button
- Link to register
- Show backend errors cleanly

Register page:

- Email input
- Username input
- Password input
- Submit button
- On success, show "Check your email"

Verify email page:

- Read `token` from URL
- Show loading state
- Show success or error
- Link to login after success

Logout:

- Call backend `/auth/logout` with refresh token
- Clear tokens even if backend logout fails
- Redirect to login

## Example Fetch Flow

```ts
await api.post("/auth/login", {
  email,
  password,
});
```

```ts
await api.get("/api/v1/data/files/123", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

## Important Notes

- Do not use Firebase, Auth0, Clerk, or Supabase Auth. The backend owns authentication and token issuance.
- Google Sign-In is supported via `POST /auth/google`; the frontend only sends the Google ID token.
- Resend email verification is already handled by the backend.
- Frontend only calls the verification endpoint when the user opens the verification URL.
- Keep implementation consistent with the existing React app architecture and styling.
