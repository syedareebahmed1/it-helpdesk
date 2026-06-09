# IT Help Desk — Public Portal Context

## Overview
Minimal React + Vite + Tailwind single-page app. **No login required.** Colleagues enter their name + email, pick a request type, fill the form, and submit. The ticket appears immediately in the admin queue.

## Tech Stack
- **React 19** (no router — pure `useState` screen switching)
- **Vite** (dev server on port 5175)
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **No Zustand, no React Router** — intentionally minimal, single `App.jsx`

## File Structure
```
public-portal/
├── index.html
├── vite.config.js       # Proxies /api/* to http://localhost:8001
├── package.json
└── src/
    ├── main.jsx         # React root
    ├── index.css        # @import "tailwindcss" + body reset
    └── App.jsx          # All screens in one file (Home, RequestForm, Success)
```

## App.jsx — Three Screens
App state: `screen` = `"home"` | `"form"` | `"success"`

### 1. Home
Shows all 9 request categories as a clickable list (same as the Jira portal screenshot). Each category row has an icon, label, and description. Clicking sets `selectedCategory` and navigates to `"form"`.

### 2. RequestForm
- **Your Details** section — `submitter_name` and `submitter_email` (required, no password)
- **Dynamic fields** — fetched from `/api/public/form-fields/{ticket_type}`, rendered with `FieldInput` component
- On submit → `POST /api/public/tickets` → navigates to `"success"`

### 3. Success
Shows the returned `ticket_number` (e.g. `IT-00042`), title, and initial status. "Raise Another Request" resets to `"home"`.

## API Calls (no auth headers)
```js
GET  /api/public/form-fields/{ticket_type}  → field definitions array
POST /api/public/tickets                    → { submitter_name, submitter_email, ticket_type, field_values }
                                            ← { ticket_number, status, title }
```

## Guest User Behaviour (backend)
When a ticket is submitted via the public portal:
1. Backend looks up `submitter_email` in `users` table
2. If found → uses that user as reporter
3. If not found → creates a new `customer` role user with a randomised password (they cannot log in unless they register separately)

## FieldInput Component
Renders one input based on `field.type`:
- `text`, `email`, `date` → `<input>`
- `textarea` → `<textarea rows={3}>`
- `select` → `<select>` with options
- `multiselect` → pill buttons (toggle active with blue fill)

## Design
Matches the admin portal's customer-facing design: white background, `#0747a6` بازار branding, `#0052cc` primary buttons, `#f4f5f7` hero background. **No sidebar.**

## Local Development
```bash
cd public-portal
npm install
npm run dev
# Runs on http://localhost:5175
# Proxies /api/* to http://localhost:8001
```
