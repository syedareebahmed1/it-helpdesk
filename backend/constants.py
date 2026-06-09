TICKET_TYPES = {
    "onboarding": "Colleague Onboarding",
    "offboarding": "Colleague Offboarding",
    "access_google": "Google Workspace Request",
    "access_commando": "Commando Access Request",
    "access_nucleus": "Nucleus Access Request",
    "access_superset": "SuperSet Access Request",
    "access_platform": "Platform Scopes Add/Remove",
    "access_lending": "Lending Portal",
    "system_problem": "Report a System Problem",
}

TICKET_FORM_FIELDS = {
    "onboarding": [
        {"key": "full_name", "label": "Full Name", "type": "text", "required": True},
        {"key": "date_of_joining", "label": "Date of Joining", "type": "date", "required": True},
        {"key": "employment_type", "label": "Employment Type", "type": "select",
         "options": ["Permanent", "Contractual", "Intern"], "required": True},
        {"key": "previous_employment", "label": "Previous Employment", "type": "text", "required": False},
        {"key": "work_experience", "label": "Work Experience", "type": "text", "required": False},
        {"key": "personal_email", "label": "Personal Email ID", "type": "email", "required": False},
        {"key": "preferred_email", "label": "Preferred Email ID", "type": "email", "required": True},
        {"key": "line_manager", "label": "Line Manager", "type": "text", "required": True},
        {"key": "cnic", "label": "CNIC Number", "type": "text", "required": False},
        {"key": "mobile_number", "label": "Contact Number", "type": "text", "required": False},
        {"key": "job_title", "label": "Job Title", "type": "text", "required": True},
        {"key": "department", "label": "Department", "type": "text", "required": True},
        {"key": "relocation_required", "label": "Relocation Required", "type": "select",
         "options": ["Yes", "No"], "required": False},
        {"key": "city", "label": "City", "type": "text", "required": False},
        {"key": "it_essentials", "label": "IT Essentials", "type": "multiselect",
         "options": ["Laptop", "Gmail ID", "Mobile Device", "VPN Access", "ID Card"], "required": False},
        {"key": "reason_for_hire", "label": "Reason for Hire", "type": "select",
         "options": ["New Position", "Replacement", "Expansion"], "required": False},
        {"key": "comments", "label": "Comments", "type": "textarea", "required": False},
    ],
    "offboarding": [
        {"key": "employee_name", "label": "Employee Name", "type": "text", "required": True},
        {"key": "employee_email", "label": "Employee Email", "type": "email", "required": True},
        {"key": "last_working_date", "label": "Last Working Date", "type": "date", "required": True},
        {"key": "department", "label": "Department", "type": "text", "required": True},
        {"key": "line_manager", "label": "Line Manager", "type": "text", "required": True},
        {"key": "reason_for_leaving", "label": "Reason for Leaving", "type": "select",
         "options": ["Resignation", "Contract End", "Termination", "Retirement"], "required": True},
        {"key": "assets_to_return", "label": "Assets to Return", "type": "multiselect",
         "options": ["Laptop", "Mobile Device", "ID Card", "Access Card", "Keys"], "required": False},
        {"key": "comments", "label": "Comments", "type": "textarea", "required": False},
    ],
    "access_google": [
        {"key": "requested_for", "label": "Requested For (Name/Email)", "type": "text", "required": True},
        {"key": "request_type", "label": "Request Type", "type": "select",
         "options": ["Create New Account", "Delete Account", "Password Reset", "Access Modification", "Group Addition"], "required": True},
        {"key": "mobile_number", "label": "Mobile Number", "type": "text", "required": False},
        {"key": "justification", "label": "Justification (Requirement)", "type": "textarea", "required": True},
    ],
    "access_commando": [
        {"key": "requested_for", "label": "Requested For (Name/Email)", "type": "text", "required": True},
        {"key": "access_type", "label": "Access Type", "type": "select",
         "options": ["Read Only", "Read/Write", "Admin", "Remove Access"], "required": True},
        {"key": "mobile_number", "label": "Mobile Number", "type": "text", "required": False},
        {"key": "justification", "label": "Justification (Requirement)", "type": "textarea", "required": True},
    ],
    "access_nucleus": [
        {"key": "requested_for", "label": "Requested For (Name/Email)", "type": "text", "required": True},
        {"key": "access_type", "label": "Access Type", "type": "select",
         "options": ["Read Only", "Read/Write", "Admin", "Remove Access"], "required": True},
        {"key": "mobile_number", "label": "Mobile Number", "type": "text", "required": False},
        {"key": "justification", "label": "Justification (Requirement)", "type": "textarea", "required": True},
    ],
    "access_superset": [
        {"key": "requested_for", "label": "Requested For (Name/Email)", "type": "text", "required": True},
        {"key": "access_type", "label": "Access Type", "type": "select",
         "options": ["Viewer", "Alpha", "SQL Lab", "Admin"], "required": True},
        {"key": "mobile_number", "label": "Mobile Number", "type": "text", "required": False},
        {"key": "justification", "label": "Justification (Requirement)", "type": "textarea", "required": True},
    ],
    "access_platform": [
        {"key": "requested_for", "label": "Requested For (Name/Email)", "type": "text", "required": True},
        {"key": "scope_action", "label": "Action", "type": "select",
         "options": ["Add", "Remove"], "required": True},
        {"key": "scope_name", "label": "Scope / Permission Name", "type": "text", "required": True},
        {"key": "platform", "label": "Platform", "type": "text", "required": True},
        {"key": "mobile_number", "label": "Mobile Number", "type": "text", "required": False},
        {"key": "justification", "label": "Justification (Requirement)", "type": "textarea", "required": True},
    ],
    "access_lending": [
        {"key": "lending_module", "label": "Lending Portal Module", "type": "multiselect",
         "options": ["Lending Collection Core", "Loan Origination", "Credit Assessment", "Repayment Management"], "required": True},
        {"key": "mobile_number", "label": "Mobile Number", "type": "text", "required": True},
        {"key": "justification", "label": "Justification (Requirement)", "type": "textarea", "required": True},
    ],
    "system_problem": [
        {"key": "affected_system", "label": "Affected System / Application", "type": "text", "required": True},
        {"key": "problem_description", "label": "Problem Description", "type": "textarea", "required": True},
        {"key": "steps_to_reproduce", "label": "Steps to Reproduce", "type": "textarea", "required": False},
        {"key": "impact_level", "label": "Impact Level", "type": "select",
         "options": ["Low", "Medium", "High", "Critical"], "required": True},
    ],
}

WORKFLOW_DEFINITIONS = {
    "onboarding": {
        "name": "IT Onboarding Workflow",
        "states": [
            {"name": "WAITING FOR SUPPORT", "color": "#dbeafe", "text_color": "#1e40af", "is_initial": True,  "is_terminal": False, "order": 0},
            {"name": "ACKNOWLEDGE",         "color": "#bfdbfe", "text_color": "#1d4ed8", "is_initial": False, "is_terminal": False, "order": 1},
            {"name": "IN PROGRESS",         "color": "#3b82f6", "text_color": "#ffffff", "is_initial": False, "is_terminal": False, "order": 2},
            {"name": "HOLD",                "color": "#fed7aa", "text_color": "#9a3412", "is_initial": False, "is_terminal": False, "order": 3},
            {"name": "NOT JOINING",         "color": "#fecaca", "text_color": "#7f1d1d", "is_initial": False, "is_terminal": True,  "order": 4},
            {"name": "RESOLVED",            "color": "#bbf7d0", "text_color": "#14532d", "is_initial": False, "is_terminal": True,  "order": 5},
        ],
        "transitions": [
            {"from_state": "WAITING FOR SUPPORT", "to_state": "ACKNOWLEDGE",  "label": "Acknowledged"},
            {"from_state": "ACKNOWLEDGE",         "to_state": "IN PROGRESS",  "label": "In Progress"},
            {"from_state": "IN PROGRESS",         "to_state": "HOLD",         "label": "Hold"},
            {"from_state": "HOLD",                "to_state": "IN PROGRESS",  "label": "Back in Progress"},
            {"from_state": "IN PROGRESS",         "to_state": "NOT JOINING",  "label": "Not Joined"},
            {"from_state": "IN PROGRESS",         "to_state": "RESOLVED",     "label": "Resolved"},
        ],
    },
    "offboarding": {
        "name": "IT Offboarding Workflow",
        "states": [
            {"name": "WAITING FOR SUPPORT", "color": "#dbeafe", "text_color": "#1e40af", "is_initial": True,  "is_terminal": False, "order": 0},
            {"name": "ACKNOWLEDGE",         "color": "#bfdbfe", "text_color": "#1d4ed8", "is_initial": False, "is_terminal": False, "order": 1},
            {"name": "IN PROGRESS",         "color": "#3b82f6", "text_color": "#ffffff", "is_initial": False, "is_terminal": False, "order": 2},
            {"name": "HOLD",                "color": "#fed7aa", "text_color": "#9a3412", "is_initial": False, "is_terminal": False, "order": 3},
            {"name": "NOT APPROVED",        "color": "#fecaca", "text_color": "#7f1d1d", "is_initial": False, "is_terminal": True,  "order": 4},
            {"name": "CLOSE CREDENTIALS",   "color": "#e0e7ff", "text_color": "#4338ca", "is_initial": False, "is_terminal": False, "order": 5},
            {"name": "WAITING FOR LAPTOP",  "color": "#dbeafe", "text_color": "#1e40af", "is_initial": False, "is_terminal": False, "order": 6},
            {"name": "RESOLVED",            "color": "#bbf7d0", "text_color": "#14532d", "is_initial": False, "is_terminal": True,  "order": 7},
        ],
        "transitions": [
            {"from_state": "WAITING FOR SUPPORT", "to_state": "ACKNOWLEDGE",       "label": "Acknowledged"},
            {"from_state": "ACKNOWLEDGE",         "to_state": "IN PROGRESS",       "label": "In Progress"},
            {"from_state": "IN PROGRESS",         "to_state": "HOLD",              "label": "Hold"},
            {"from_state": "HOLD",                "to_state": "IN PROGRESS",       "label": "Back in Progress"},
            {"from_state": "IN PROGRESS",         "to_state": "NOT APPROVED",      "label": "Canceled"},
            {"from_state": "IN PROGRESS",         "to_state": "CLOSE CREDENTIALS", "label": "Deactivate User"},
            {"from_state": "HOLD",                "to_state": "CLOSE CREDENTIALS", "label": "Deactivate User"},
            {"from_state": "CLOSE CREDENTIALS",   "to_state": "WAITING FOR LAPTOP","label": "The Laptop"},
            {"from_state": "WAITING FOR LAPTOP",  "to_state": "RESOLVED",          "label": "Resolved"},
        ],
    },
    "default": {
        "name": "Standard Request Workflow",
        "states": [
            {"name": "AWAITING APPROVAL", "color": "#f1f5f9", "text_color": "#475569", "is_initial": True, "is_terminal": False, "order": 0},
            {"name": "WAITING FOR SUPPORT", "color": "#dbeafe", "text_color": "#1e40af", "is_initial": False, "is_terminal": False, "order": 1},
            {"name": "IN PROGRESS", "color": "#3b82f6", "text_color": "#ffffff", "is_initial": False, "is_terminal": False, "order": 2},
            {"name": "ACKNOWLEDGE", "color": "#bfdbfe", "text_color": "#1d4ed8", "is_initial": False, "is_terminal": False, "order": 3},
            {"name": "HOLD", "color": "#fed7aa", "text_color": "#9a3412", "is_initial": False, "is_terminal": False, "order": 4},
            {"name": "OPEN", "color": "#e0f2fe", "text_color": "#0369a1", "is_initial": False, "is_terminal": False, "order": 5},
            {"name": "RESOLVED", "color": "#bbf7d0", "text_color": "#14532d", "is_initial": False, "is_terminal": True, "order": 6},
            {"name": "REJECTED", "color": "#fecaca", "text_color": "#7f1d1d", "is_initial": False, "is_terminal": True, "order": 7},
        ],
        "transitions": [
            {"from_state": "AWAITING APPROVAL", "to_state": "WAITING FOR SUPPORT"},
            {"from_state": "AWAITING APPROVAL", "to_state": "REJECTED"},
            {"from_state": "WAITING FOR SUPPORT", "to_state": "IN PROGRESS"},
            {"from_state": "WAITING FOR SUPPORT", "to_state": "RESOLVED"},
            {"from_state": "IN PROGRESS", "to_state": "HOLD"},
            {"from_state": "IN PROGRESS", "to_state": "ACKNOWLEDGE"},
            {"from_state": "IN PROGRESS", "to_state": "RESOLVED"},
            {"from_state": "IN PROGRESS", "to_state": "WAITING FOR SUPPORT"},
            {"from_state": "ACKNOWLEDGE", "to_state": "IN PROGRESS"},
            {"from_state": "HOLD", "to_state": "IN PROGRESS"},
        ],
    },
}


def get_workflow_key(ticket_type: str) -> str:
    if ticket_type == "onboarding":
        return "onboarding"
    if ticket_type == "offboarding":
        return "offboarding"
    return "default"


def get_initial_status(ticket_type: str) -> str:
    wf_key = get_workflow_key(ticket_type)
    for state in WORKFLOW_DEFINITIONS[wf_key]["states"]:
        if state["is_initial"]:
            return state["name"]
    return "WAITING FOR SUPPORT"
