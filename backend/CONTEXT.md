# IT Help Desk — Backend Context

## Overview
FastAPI + SQLAlchemy backend. SQLite locally, PostgreSQL in production. Serves both the admin frontend (authenticated) and the public portal (unauthenticated `/api/public/*` routes).

## Tech Stack
- **FastAPI** with Pydantic v2 schemas
- **SQLAlchemy 2.0** ORM with `Mapped` / `mapped_column` syntax
- **JWT auth** via `python-jose` (7-day expiry), `passlib[bcrypt]` for passwords
- **SQLite** locally (`helpdesk.db`), **PostgreSQL** in production via `DATABASE_URL` env var

## File Structure
```
backend/
├── main.py          # App factory, CORS, router registration, DB seed, startup event
├── models.py        # All ORM models
├── schemas.py       # All Pydantic request/response schemas
├── database.py      # Engine, SessionLocal, get_db() dependency
├── auth.py          # hash_password, verify_password, create_access_token, decode_token
├── deps.py          # FastAPI dependencies: get_current_user, require_agent, require_manager
├── constants.py     # TICKET_TYPES, TICKET_FORM_FIELDS, WORKFLOW_DEFINITIONS
└── routers/
    ├── auth.py      # POST /api/auth/login, /register, GET /api/auth/me
    ├── tickets.py   # Full ticket CRUD + comments
    ├── workflows.py # GET/PUT workflow definitions
    ├── users.py     # User management (manager only)
    ├── dashboard.py # Stats, queue counts, form field definitions
    └── public.py    # Unauthenticated ticket submission (public portal)
```

## Database Models
| Model | Table | Key Fields |
|-------|-------|-----------|
| `User` | `users` | `id`, `email`, `password_hash`, `full_name`, `role` (`customer`/`agent`/`manager`), `department`, `job_title` |
| `Ticket` | `tickets` | `id`, `ticket_number` (e.g. `IT-00001`), `title`, `ticket_type`, `status`, `priority` (`P1`–`P4`), `assignee_id`, `reporter_id`, `department` |
| `TicketFieldValue` | `ticket_field_values` | `id`, `ticket_id`, `field_key`, `field_value` — stores dynamic form data |
| `TicketComment` | `ticket_comments` | `id`, `ticket_id`, `author_id`, `body`, `is_internal` |
| `WorkflowDefinition` | `workflow_definitions` | `id`, `ticket_type` (unique), `name` |
| `WorkflowState` | `workflow_states` | `id`, `workflow_id`, `name`, `color`, `text_color`, `is_initial`, `is_terminal`, `order` |
| `WorkflowTransition` | `workflow_transitions` | `id`, `workflow_id`, `from_state`, `to_state` — use `"*"` as `from_state` for "any state" transitions |
| `TicketHistory` | `ticket_history` | `id`, `ticket_id`, `changed_by_id`, `field_name`, `old_value`, `new_value`, `created_at` |

## Key Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | ❌ | Returns `{access_token, user}` |
| POST | `/api/auth/register` | ❌ | Creates customer account, returns token |
| GET | `/api/auth/me` | ✅ | Current user profile |

### Tickets
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tickets` | ✅ | Paginated list — customers only see their own |
| POST | `/api/tickets` | ✅ | Create ticket (sets initial status from workflow) |
| GET | `/api/tickets/{id}` | ✅ | Full ticket with field values, comments, history |
| PATCH | `/api/tickets/{id}` | ✅ Agent | Update status/assignee/priority — validates transitions |
| DELETE | `/api/tickets/{id}` | ✅ Agent | Delete ticket |
| POST | `/api/tickets/{id}/comments` | ✅ | Add comment (`is_internal` flag) |

### Workflows
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/workflows` | ✅ Agent | All workflow definitions |
| GET | `/api/workflows/{ticket_type}` | ✅ Agent | Single workflow with states + transitions |
| PUT | `/api/workflows/{ticket_type}` | ✅ Manager | Replace states and transitions |

### Dashboard
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard/stats` | ✅ Agent | Ticket counts by type, status, priority + queue counts |
| GET | `/api/dashboard/form-fields/{ticket_type}` | ✅ Agent | Field definitions for a ticket type |
| GET | `/api/dashboard/ticket-types` | ✅ Agent | All ticket type keys + labels |

### Public (no auth)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/public/ticket-types` | ❌ | All ticket type keys + labels |
| GET | `/api/public/form-fields/{ticket_type}` | ❌ | Form field definitions |
| POST | `/api/public/tickets` | ❌ | Submit ticket by name + email (auto-creates guest user) |

## Ticket Status Transitions
Validated server-side in `PATCH /api/tickets/{id}`. The backend checks `WORKFLOW_DEFINITIONS` in `constants.py` — if the requested status is not reachable from the current status, it returns `400`. Transitions with `from_state: "*"` are always allowed.

## constants.py
Three key exports used across the codebase:
- `TICKET_TYPES` — dict mapping type key → display label
- `TICKET_FORM_FIELDS` — dict mapping type key → list of field defs (`{key, label, type, required, options?}`)
- `WORKFLOW_DEFINITIONS` — default workflow specs (`onboarding`, `offboarding`, `default`) used for seeding

Field types: `text`, `email`, `date`, `textarea`, `select`, `multiselect`

## Auth Dependencies (deps.py)
```python
get_current_user   # Any authenticated user
require_agent      # role in ("agent", "manager")
require_manager    # role == "manager"
```

## Seed Data (main.py)
On first startup (when `users` table is empty):
1. Creates 2 agents, 1 manager, 2 customers
2. Seeds all 9 workflow definitions from `WORKFLOW_DEFINITIONS`
3. Creates 3 detailed seed tickets (IT-00001, IT-00002, IT-00003) + 36 random tickets

## Environment Variables
| Var | Default | Description |
|-----|---------|-------------|
| `DATABASE_URL` | `sqlite:///./helpdesk.db` | DB connection string |
| `SECRET_KEY` | `dev-secret-key-please-change` | JWT signing key — **change in production** |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated CORS allowed origins |

## Local Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
# API docs: http://localhost:8001/docs
```
