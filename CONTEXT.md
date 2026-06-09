# Bazaar IT Help Desk — Project Context

## Overview
A Jira Service Desk-style IT ticketing system built for Bazaar Technologies (بازار). Three separate apps share one FastAPI backend:

| App | Port | Purpose |
|-----|------|---------|
| `backend/` | 8001 | FastAPI REST API — single source of truth |
| `frontend/` | 5174 | Admin portal — IT agents & managers manage tickets |
| `public-portal/` | 5175 | Public portal — colleagues raise requests with no login |

## Repository
**GitHub:** https://github.com/bazaartechnologies/it-helpdesk

## Local Dev — Start All Three
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --port 8001 --reload

# Terminal 2: Admin frontend
cd frontend
npm run dev -- --port 5174

# Terminal 3: Public portal
cd public-portal
npm run dev
```

## Demo Accounts
| Role | Email | Password |
|------|-------|---------|
| Manager | manager@bazaartech.com | manager123 |
| Agent | agent@bazaartech.com | agent123 |
| Customer | ibrahim.jamal@bazaartech.com | user123 |

## Ticket Types (9 total)
| Key | Label |
|-----|-------|
| `onboarding` | Colleague Onboarding |
| `offboarding` | Colleague Offboarding |
| `access_google` | Google Workspace Request |
| `access_commando` | Commando Access Request |
| `access_nucleus` | Nucleus Access Request |
| `access_superset` | SuperSet Access Request |
| `access_platform` | Platform Scopes Add/Remove |
| `access_lending` | Lending Portal |
| `system_problem` | Report a System Problem |

## Roles & Access
| Role | Can do |
|------|--------|
| `customer` | Raise tickets (login required), view/reply to own tickets |
| `agent` | View all queues, manage tickets, add internal notes |
| `manager` | Everything agents can + edit workflows, manage users |
| *(public)* | Raise tickets via public portal (no account needed) |

## Workflows
Each ticket type has a configurable state-machine workflow stored in the database.

**Onboarding / Offboarding:**
`WAITING FOR SUPPORT → ACKNOWLEDGE → IN PROGRESS → CREATE CREDENTIALS → RESOLVED / NOT APPROVED / HOLD`

**Access Requests / System Problem:**
`AWAITING APPROVAL → WAITING FOR SUPPORT → IN PROGRESS → ACKNOWLEDGE / HOLD → RESOLVED / REJECTED`

Workflows are editable by managers in the admin portal under **Settings → Workflows**.
