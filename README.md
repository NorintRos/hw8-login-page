# HW8 — Express Authentication & State Management

A simple Express.js app demonstrating session-based authentication, protected routes, and signed cookie theme toggling.

## Setup

```bash
npm install
npm start
```

Visit [http://localhost:3000/login](http://localhost:3000/login).

## Test Accounts

| Username      | Password       |
|---------------|----------------|
| `admin`       | `password123`  |
| `student_dev` | `dev_password` |

## Features

- **Login/Logout** — session-based auth via `express-session`
- **Protected Profile** — `/profile` redirects to `/login` if unauthenticated
- **Theme Toggle** — light/dark mode stored in a signed, HttpOnly cookie
