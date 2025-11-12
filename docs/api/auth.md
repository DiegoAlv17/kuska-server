## Auth API

Base path: `/api/auth`

This document describes the authentication endpoints available in the `auth` module.

---

## Endpoints

### POST /register
- Description: Register a new user.
- Auth: public
- Request body (JSON):
  - email: string (email format)
  - password: string (min 8, max 128, must contain upper, lower and number)
  - completeName: string
  - phone: string (optional) - must start with `+` and country code (e.g., `+51987654321`)

Example request body:
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "completeName": "Juan Perez",
  "phone": "+51987654321"
}
```

Success response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "<jwt_access_token>",
    "refreshToken": "<jwt_refresh_token>",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "completeName": "Juan Perez",
      "avatar": null,
      "phone": "+51987654321",
      "timezone": "UTC",
      "locale": "es",
      "isActive": true,
      "lastLogin": null,
      "createdAt": "2025-11-10T...Z",
      "updatedAt": "2025-11-10T...Z"
    }
  }
}
```

Possible errors:
- 400 Validation error (Zod) — invalid email/password/phone format
- 409 User already exists

---

### POST /login
- Description: Authenticate user and obtain tokens.
- Auth: public
- Request body (JSON):
  - email: string
  - password: string

Example request body:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Success response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt_access_token>",
    "refreshToken": "<jwt_refresh_token>",
    "user": { /* same shape as above */ }
  }
}
```

Possible errors:
- 400 Validation error (invalid payload)
- 401 Invalid credentials

---

### POST /refresh
- Description: Exchange a refresh token for a new access token (and possibly a new refresh token).
- Auth: public
- Request body (JSON):
  - refreshToken: string

Example request body:
```json
{ "refreshToken": "<jwt_refresh_token>" }
```

Success response (200):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "<new_access_token>",
    "refreshToken": "<new_refresh_token>",
    "user": { /* optional user payload depending on implementation */ }
  }
}
```

Possible errors:
- 400 Missing refresh token
- 401 Invalid/expired refresh token

---

### GET /me
- Description: Get the currently authenticated user's profile.
- Auth: protected — requires `Authorization: Bearer <accessToken>` header
- Request: no body

Success response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "completeName": "Juan Perez",
    "avatar": null,
    "phone": "+51987654321",
    "timezone": "UTC",
    "locale": "es",
    "isActive": true,
    "lastLogin": "2025-11-10T...Z",
    "createdAt": "2025-11-10T...Z",
    "updatedAt": "2025-11-10T...Z"
  }
}
```

Possible errors:
- 401 Missing or invalid Authorization header

---

### POST /logout
- Description: Log out the current user. (Currently returns success; token blacklist not implemented.)
- Auth: protected — requires `Authorization: Bearer <accessToken>` header

Success response (200):
```json
{ "success": true, "message": "Logout successful" }
```

---

## DTOs and validation
- RegisterUserSchema (Zod):
  - email: string, email format
  - password: string, min 8, max 128, must include uppercase, lowercase and number
  - completeName: string
  - phone?: string, regex ^\+\d+$

- LoginUserSchema (Zod):
  - email: string, email format
  - password: string

- AuthResponseDto:
  - accessToken: string
  - refreshToken: string
  - user: UserResponseDto

- UserResponseDto fields: id, email, completeName, avatar?, phone?, timezone, locale, isActive, lastLogin?, createdAt, updatedAt

---

## Notes & implementation details
- The controller uses Zod for input validation. Validation errors will be returned via the global error handler — typically as 400 with details.
- Tokens are generated using `JwtTokenService`. Access token expiry defaults are configured in `.env` (`JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`).
- Prisma is used as ORM. Ensure `DATABASE_URL` / `DIRECT_URL` are configured correctly and Prisma client is generated before running the server.

---

## How to generate Scalar-compatible docs
Scalar consumes Markdown files. This `docs/api/auth.md` is ready to be used by Scalar; place it under `docs/api/` and point Scalar to that folder when configuring the docs site. If you want, I can:

- Add front-matter (YAML) to the top of this file with metadata (title, slug, description).
- Split each endpoint to its own Markdown file for a cleaner Scalar site structure.

Tell me if you want front-matter or endpoint-per-file splitting and I will apply it.
