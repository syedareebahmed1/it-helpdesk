from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "customer"
    department: Optional[str] = None
    job_title: Optional[str] = None


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "customer"
    department: Optional[str] = None
    job_title: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    password: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    job_title: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserMini(BaseModel):
    id: int
    full_name: str
    email: str
    role: str

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class FieldValueIn(BaseModel):
    field_key: str
    field_value: str


class FieldValueOut(BaseModel):
    field_key: str
    field_value: str

    model_config = {"from_attributes": True}


class TicketCreate(BaseModel):
    ticket_type: str
    title: str
    priority: str = "P3"
    department: Optional[str] = None
    description: Optional[str] = None
    field_values: list[FieldValueIn] = []


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    assignee_id: Optional[int] = None
    priority: Optional[str] = None
    description: Optional[str] = None


class CommentOut(BaseModel):
    id: int
    author: UserMini
    body: str
    is_internal: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryOut(BaseModel):
    id: int
    changed_by: UserMini
    field_name: str
    old_value: Optional[str]
    new_value: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class LinkedTicketMini(BaseModel):
    id: int
    ticket_number: str
    title: str
    status: str
    portal_source: Optional[str] = None

    model_config = {"from_attributes": True}


class TicketOut(BaseModel):
    id: int
    ticket_number: str
    title: str
    ticket_type: str
    status: str
    priority: str
    assignee: Optional[UserMini] = None
    reporter: UserMini
    department: Optional[str] = None
    description: Optional[str] = None
    portal_source: Optional[str] = None
    linked_ticket: Optional[LinkedTicketMini] = None
    created_at: datetime
    updated_at: datetime
    field_values: list[FieldValueOut] = []
    comments: list[CommentOut] = []
    history: list[HistoryOut] = []

    model_config = {"from_attributes": True}


class TicketListOut(BaseModel):
    id: int
    ticket_number: str
    title: str
    ticket_type: str
    status: str
    priority: str
    assignee: Optional[UserMini] = None
    reporter: UserMini
    department: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    body: str
    is_internal: bool = False


class WorkflowStateOut(BaseModel):
    id: int
    name: str
    color: str
    text_color: str
    is_initial: bool
    is_terminal: bool
    order: int

    model_config = {"from_attributes": True}


class WorkflowTransitionOut(BaseModel):
    id: int
    from_state: str
    to_state: str
    label: Optional[str] = None

    model_config = {"from_attributes": True}


class WorkflowOut(BaseModel):
    id: int
    ticket_type: str
    name: str
    states: list[WorkflowStateOut]
    transitions: list[WorkflowTransitionOut]

    model_config = {"from_attributes": True}


class WorkflowStateIn(BaseModel):
    name: str
    color: str = "#e2e8f0"
    text_color: str = "#1e293b"
    is_initial: bool = False
    is_terminal: bool = False
    order: int = 0


class WorkflowTransitionIn(BaseModel):
    from_state: str
    to_state: str
    label: Optional[str] = None


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    states: Optional[list[WorkflowStateIn]] = None
    transitions: Optional[list[WorkflowTransitionIn]] = None


class DashboardStats(BaseModel):
    total: int
    open: int
    resolved: int
    by_type: dict[str, int]
    by_status: dict[str, int]
    by_priority: dict[str, int]
    queue_counts: dict[str, int]


class PaginatedTickets(BaseModel):
    items: list[TicketListOut]
    total: int
    page: int
    limit: int
