from datetime import datetime
from sqlalchemy import Integer, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default="customer")
    department: Mapped[str | None] = mapped_column(String, nullable=True)
    job_title: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    assigned_tickets: Mapped[list["Ticket"]] = relationship(
        "Ticket", foreign_keys="Ticket.assignee_id", back_populates="assignee"
    )
    reported_tickets: Mapped[list["Ticket"]] = relationship(
        "Ticket", foreign_keys="Ticket.reporter_id", back_populates="reporter"
    )
    comments: Mapped[list["TicketComment"]] = relationship(
        "TicketComment", back_populates="author"
    )


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_number: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    ticket_type: Mapped[str] = mapped_column(String, index=True, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="WAITING FOR SUPPORT")
    priority: Mapped[str] = mapped_column(String, nullable=False, default="P3")
    assignee_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    department: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    portal_source: Mapped[str | None] = mapped_column(String, nullable=True)          # "it" | "people"
    linked_ticket_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("tickets.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    linked_ticket: Mapped["Ticket | None"] = relationship(
        "Ticket", foreign_keys=[linked_ticket_id], remote_side="Ticket.id", uselist=False
    )
    assignee: Mapped["User | None"] = relationship(
        "User", foreign_keys=[assignee_id], back_populates="assigned_tickets"
    )
    reporter: Mapped["User"] = relationship(
        "User", foreign_keys=[reporter_id], back_populates="reported_tickets"
    )
    field_values: Mapped[list["TicketFieldValue"]] = relationship(
        "TicketFieldValue", back_populates="ticket", cascade="all, delete-orphan"
    )
    comments: Mapped[list["TicketComment"]] = relationship(
        "TicketComment", back_populates="ticket", cascade="all, delete-orphan",
        order_by="TicketComment.created_at"
    )
    history: Mapped[list["TicketHistory"]] = relationship(
        "TicketHistory", back_populates="ticket", cascade="all, delete-orphan",
        order_by="TicketHistory.created_at"
    )


class TicketFieldValue(Base):
    __tablename__ = "ticket_field_values"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("tickets.id"), index=True)
    field_key: Mapped[str] = mapped_column(String, nullable=False)
    field_value: Mapped[str] = mapped_column(Text, nullable=False, default="")

    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="field_values")


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("tickets.id"), index=True)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_internal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="comments")
    author: Mapped["User"] = relationship("User", back_populates="comments")


class WorkflowDefinition(Base):
    __tablename__ = "workflow_definitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_type: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)

    states: Mapped[list["WorkflowState"]] = relationship(
        "WorkflowState", back_populates="workflow", cascade="all, delete-orphan",
        order_by="WorkflowState.order"
    )
    transitions: Mapped[list["WorkflowTransition"]] = relationship(
        "WorkflowTransition", back_populates="workflow", cascade="all, delete-orphan"
    )


class WorkflowState(Base):
    __tablename__ = "workflow_states"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    workflow_id: Mapped[int] = mapped_column(Integer, ForeignKey("workflow_definitions.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    color: Mapped[str] = mapped_column(String, nullable=False, default="#e2e8f0")
    text_color: Mapped[str] = mapped_column(String, nullable=False, default="#1e293b")
    is_initial: Mapped[bool] = mapped_column(Boolean, default=False)
    is_terminal: Mapped[bool] = mapped_column(Boolean, default=False)
    order: Mapped[int] = mapped_column(Integer, default=0)

    workflow: Mapped["WorkflowDefinition"] = relationship("WorkflowDefinition", back_populates="states")


class WorkflowTransition(Base):
    __tablename__ = "workflow_transitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    workflow_id: Mapped[int] = mapped_column(Integer, ForeignKey("workflow_definitions.id"))
    from_state: Mapped[str] = mapped_column(String, nullable=False)
    to_state: Mapped[str] = mapped_column(String, nullable=False)
    label: Mapped[str | None] = mapped_column(String, nullable=True)

    workflow: Mapped["WorkflowDefinition"] = relationship("WorkflowDefinition", back_populates="transitions")


class ApproverRule(Base):
    __tablename__ = "approver_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_type: Mapped[str] = mapped_column(String, index=True, nullable=False)
    module_value: Mapped[str] = mapped_column(String, nullable=False)
    approvers: Mapped[str] = mapped_column(Text, nullable=False)  # comma-separated names
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TicketHistory(Base):
    __tablename__ = "ticket_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("tickets.id"), index=True)
    changed_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    field_name: Mapped[str] = mapped_column(String, nullable=False)
    old_value: Mapped[str | None] = mapped_column(String, nullable=True)
    new_value: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="history")
    changed_by: Mapped["User"] = relationship("User")
