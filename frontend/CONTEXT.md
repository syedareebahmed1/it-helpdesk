# IT Help Desk — Admin Frontend Context

## Overview
React 19 + Vite + Tailwind CSS v4 SPA. The admin portal for IT agents and managers. Login required — role determines what is visible.

## Tech Stack
- **React 19** with hooks
- **Vite** (dev server on port 5174)
- **Tailwind CSS v4** (via `@tailwindcss/vite` — no `tailwind.config.js`)
- **React Router v7** (browser router)
- **Zustand** (auth state via `authStore.js`)
- **No UI component library** — all components hand-written with Tailwind

## File Structure
```
frontend/src/
├── main.jsx                     # React root
├── App.jsx                      # Router setup + RequireAuth guard
├── index.css                    # Tailwind import + scrollbar styles
├── api/
│   ├── client.js                # Base fetch wrapper with JWT header
│   ├── auth.js                  # login, register, me
│   ├── tickets.js               # list, get, create, update, delete, addComment
│   ├── workflows.js             # list, get, update
│   ├── dashboard.js             # stats, formFields, ticketTypes
│   └── users.js                 # list, create, update, delete
├── store/
│   └── authStore.js             # Zustand: { user, token, login, register, logout, fetchMe }
├── components/
│   ├── Sidebar.jsx              # Dark blue nav sidebar with queue counts + user footer
│   ├── StatusBadge.jsx          # Colour-coded status pill
│   ├── PriorityBadge.jsx        # P1–P4 badge
│   ├── WorkflowDiagram.jsx      # SVG workflow visualiser
│   └── Modal.jsx                # Generic modal shell (overlay + close button)
└── pages/
    ├── Login.jsx                # Login form with demo account hints
    ├── Register.jsx             # Self-registration (creates customer role)
    ├── portal/
    │   ├── PortalHome.jsx       # Category picker (customer view)
    │   ├── NewTicket.jsx        # Dynamic ticket form (customer)
    │   ├── MyTickets.jsx        # My submitted tickets table (customer)
    │   └── PortalTicketDetail.jsx # Ticket detail + reply (customer)
    └── admin/
        ├── Dashboard.jsx        # Stats cards + by-type/priority charts + queue summary
        ├── Queue.jsx            # Filterable ticket table (search, status, priority, pagination)
        ├── TicketDetail.jsx     # Full ticket view — status transitions, comments, history, right panel
        ├── Workflows.jsx        # Workflow cards + expand + edit modal (manager only)
        └── Users.jsx            # User CRUD table (manager only)
```

## Routing (App.jsx)
```
/login               → Login (public)
/register            → Register (public)

/portal              → PortalHome        ┐
/portal/new/:type    → NewTicket         │  RequireAuth role=customer
/portal/my-tickets   → MyTickets         │
/portal/tickets/:id  → PortalTicketDetail┘

/admin               → Dashboard         ┐
/admin/queues/:queue → Queue             │  RequireAuth role=agent|manager
/admin/tickets/:id   → TicketDetail      │
/admin/workflows     → Workflows         │
/admin/users         → Users            ┘  (manager only)

/                    → RootRedirect (→ /portal if customer, → /admin if agent/manager, else /login)
```

## Queue Keys (/admin/queues/:queue)
| Key | Ticket types included |
|-----|----------------------|
| `service_requests` | All access_* + system_problem |
| `onboarding` | onboarding only |
| `offboarding` | offboarding only |
| `all` | All ticket types |

## API Client (api/client.js)
```js
api.get(path)
api.post(path, body)
api.patch(path, body)
api.put(path, body)
api.delete(path)
// - Reads token from localStorage key "hd_token"
// - Sets Authorization: Bearer <token> header
// - Returns null on 204, throws Error with detail message on non-2xx
```
Base URL from `VITE_API_URL` env var (defaults to `""` — proxied via Vite to `http://localhost:8001`).

## Auth Store (store/authStore.js)
```js
{ user, token, loading }
login(email, password)    // calls /api/auth/login, stores token in localStorage
register(payload)         // calls /api/auth/register
logout()                  // clears localStorage + state
fetchMe()                 // called on app init to restore session from token
```
Token stored in `localStorage` under key `"hd_token"`.

## Sidebar (components/Sidebar.jsx)
- Fetches queue counts from `/api/dashboard/stats` on mount
- Shows counts as blue bubbles next to each queue link
- Shows user name + role in footer, sign-out button
- `Users` nav item only rendered for `role === "manager"`

## TicketDetail Page
Key interactions:
- **Status transition** — `allowedTransitions()` deduplicates targets from current workflow transitions (including `"*"` wildcards), renders as clickable buttons
- **Assignee / Priority** — dropdowns that PATCH immediately on change
- **Comments** — toggle between "Reply to customer" and "Internal note" (yellow background)
- **View Workflow** — opens `Modal` containing `WorkflowDiagram` SVG + current status

## WorkflowDiagram (components/WorkflowDiagram.jsx)
SVG-based diagram. Positions:
- `initial` state at top-left (x=10, y=90)
- `middle` states in a grid (x = 130 + col×150, y = 90 + row×80)
- `terminal` states at bottom row (x = 10 + i×180, y = 260)
- Transitions listed as text tags below the SVG (not drawn as arrows on SVG)

## Design System
| Token | Value |
|-------|-------|
| Sidebar bg | `#0747a6` (dark blue) |
| Content bg | `#f4f5f7` |
| Primary | `#0052cc` (buttons, links) |
| Text dark | `#172b4d` |
| Border | `#e2e8f0` |
| Card bg | `#ffffff` |

Status badge colours defined in `StatusBadge.jsx` per status string.
Priority badge colours: P1=red, P2=orange, P3=yellow, P4=gray.

## Local Development
```bash
cd frontend
npm install
npm run dev -- --port 5174
# Proxies /api/* to http://localhost:8001
```

## Adding a New Page (Admin)
1. Create `src/pages/admin/NewPage.jsx`
2. Add route in `App.jsx` under `RequireAuth allowedRoles={["agent","manager"]}`
3. Add `NavItem` in `Sidebar.jsx`
