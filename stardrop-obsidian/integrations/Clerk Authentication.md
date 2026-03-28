# Clerk Authentication

Authentication provider for web and mobile apps.

## Platforms

| Platform | Package | Version |
|----------|---------|---------|
| Web (Next.js) | `@clerk/nextjs` | 7.0.7 |
| Mobile (Expo) | `@clerk/clerk-expo` | 2.5.0 |

## Features

- Email/password authentication
- OAuth providers (Google, GitHub, Apple)
- Session management
- Token-based API authentication
- Biometric unlock (mobile, via SecureStore)

## Clerk v7 API

Available exports in v7:
```
ClerkProvider, ClerkLoaded, ClerkLoading, ClerkDegraded, ClerkFailed
SignIn, SignUp, SignInButton, SignUpButton, SignOutButton
RedirectToSignIn, RedirectToSignUp
useAuth, useClerk, useSignIn, useSignUp
AuthenticateWithRedirectCallback
```

Note: `SignedIn`/`SignedOut` were removed in v7.

## User Flow

```
User signs up/in via Clerk
  → Clerk issues session token
  → Frontend sends clerk_id to backend
  → Backend auto-creates user in DynamoDB
  → User linked to Twitter handle
  → Dashboard loads personalized data
```

## Related
- [[Frontend (Next.js)]]
- [[Mobile App (Expo)]]
- [[Backend (FastAPI)]]
