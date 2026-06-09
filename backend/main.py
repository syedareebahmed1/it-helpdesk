from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
import auth as auth_utils
from routers import auth, tickets, workflows, users, dashboard, public
from constants import TICKET_TYPES, WORKFLOW_DEFINITIONS, get_workflow_key

app = FastAPI(title="Bazaar IT Help Desk API")

import os
_allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(workflows.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(public.router)


@app.get("/health")
def health():
    return {"status": "ok"}


def seed_database(db: Session):
    if db.query(models.User).count() > 0:
        return

    manager = models.User(
        email="manager@bazaartech.com",
        password_hash=auth_utils.hash_password("manager123"),
        full_name="Uzair Siddiqui",
        role="manager",
        department="IT",
        job_title="IT Manager",
    )
    agent1 = models.User(
        email="agent@bazaartech.com",
        password_hash=auth_utils.hash_password("agent123"),
        full_name="Ghulam Murtaza",
        role="agent",
        department="IT",
        job_title="IT Support Engineer",
    )
    agent2 = models.User(
        email="yawar@bazaartech.com",
        password_hash=auth_utils.hash_password("agent123"),
        full_name="Yawar Khan",
        role="agent",
        department="IT",
        job_title="Senior IT Engineer",
    )
    customer1 = models.User(
        email="ibrahim.jamal@bazaartech.com",
        password_hash=auth_utils.hash_password("user123"),
        full_name="Ibrahim Jamal",
        role="customer",
        department="Engineering",
        job_title="Senior IT Engineer",
    )
    customer2 = models.User(
        email="syed.areeb@bazaartech.com",
        password_hash=auth_utils.hash_password("user123"),
        full_name="Syed Areeb Ahmed",
        role="customer",
        department="Lending",
        job_title="Product Manager",
    )
    db.add_all([manager, agent1, agent2, customer1, customer2])
    db.flush()

    seed_workflows(db)
    seed_tickets(db, manager, agent1, agent2, customer1, customer2)
    db.commit()


def seed_workflows(db: Session):
    for ticket_type in TICKET_TYPES:
        wf_key = get_workflow_key(ticket_type)
        wf_def = WORKFLOW_DEFINITIONS[wf_key]
        wf = models.WorkflowDefinition(
            ticket_type=ticket_type,
            name=wf_def["name"] if ticket_type in ("onboarding", "offboarding") else f"{TICKET_TYPES[ticket_type]} Workflow",
        )
        db.add(wf)
        db.flush()
        for s in wf_def["states"]:
            db.add(models.WorkflowState(
                workflow_id=wf.id,
                name=s["name"], color=s["color"], text_color=s["text_color"],
                is_initial=s["is_initial"], is_terminal=s["is_terminal"], order=s["order"],
            ))
        for t in wf_def["transitions"]:
            db.add(models.WorkflowTransition(
                workflow_id=wf.id,
                from_state=t["from_state"], to_state=t["to_state"],
            ))


def seed_tickets(db, manager, agent1, agent2, customer1, customer2):
    t1 = models.Ticket(
        ticket_number="IT-00001",
        title="Contractual Onboarding - sharjeel.ahmed@bazaartech.com",
        ticket_type="onboarding",
        status="WAITING FOR SUPPORT",
        priority="P3",
        reporter_id=manager.id,
        assignee_id=agent1.id,
        department="Retail - Prime",
    )
    db.add(t1)
    db.flush()
    fields1 = [
        ("full_name", "Muhammad Sharjeel Ahmed Khan"),
        ("preferred_email", "sharjeel.ahmed@bazaartech.com"),
        ("personal_email", "sharjeel.muawin@gmail.com"),
        ("job_title", "Warehouse Incharge"),
        ("date_of_joining", "01 Apr 2026"),
        ("it_essentials", "Laptop,Gmail ID"),
        ("employment_type", "Contractual"),
        ("department", "Retail - Prime"),
        ("line_manager", "Ali Raza"),
        ("mobile_number", "03001234567"),
    ]
    for k, v in fields1:
        db.add(models.TicketFieldValue(ticket_id=t1.id, field_key=k, field_value=v))

    t2 = models.Ticket(
        ticket_number="IT-00002",
        title="Lending Portal Access - Syed Areeb Ahmed",
        ticket_type="access_lending",
        status="AWAITING APPROVAL",
        priority="P3",
        reporter_id=customer2.id,
        department="IT",
    )
    db.add(t2)
    db.flush()
    for k, v in [("lending_module", "Lending Collection Core"), ("mobile_number", "033431"), ("justification", "test")]:
        db.add(models.TicketFieldValue(ticket_id=t2.id, field_key=k, field_value=v))

    t3 = models.Ticket(
        ticket_number="IT-00003",
        title="System Problem - Email not working",
        ticket_type="system_problem",
        status="IN PROGRESS",
        priority="P2",
        reporter_id=customer1.id,
        assignee_id=agent2.id,
        department="Engineering",
    )
    db.add(t3)
    db.flush()
    for k, v in [("affected_system", "Google Workspace Email"), ("problem_description", "Cannot send or receive emails since this morning"), ("impact_level", "High")]:
        db.add(models.TicketFieldValue(ticket_id=t3.id, field_key=k, field_value=v))

    db.add(models.TicketComment(
        ticket_id=t3.id, author_id=agent2.id,
        body="Looking into this now. Can you confirm your email client?", is_internal=False,
    ))
    db.add(models.TicketComment(
        ticket_id=t3.id, author_id=customer1.id,
        body="Using Gmail on Chrome. Getting a '550 error'.", is_internal=False,
    ))

    for i in range(4, 40):
        import random
        types = list(TICKET_TYPES.keys())
        tt = random.choice(types)
        from constants import get_initial_status
        db.add(models.Ticket(
            ticket_number=f"IT-{i:05d}",
            title=f"Sample {TICKET_TYPES[tt]} Request #{i}",
            ticket_type=tt,
            status=get_initial_status(tt),
            priority=random.choice(["P1", "P2", "P3", "P4"]),
            reporter_id=random.choice([customer1.id, customer2.id]),
            assignee_id=random.choice([None, agent1.id, agent2.id]),
            department=random.choice(["Engineering", "Retail", "Lending", "HR", "Finance"]),
        ))


@app.on_event("startup")
def startup_event():
    print("[startup] Creating tables...")
    try:
        models.Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
            print("[startup] Seed complete")
        except Exception as e:
            print(f"[startup] Seed error: {e}")
            db.rollback()
        finally:
            db.close()
    except Exception as e:
        print(f"[startup] Table creation error: {e}")
