"""
Jira Service Management → constants.py importer
================================================
Pulls EVERY portal, request type, and field from your Jira Service Desk
and generates Python dicts ready to paste (or auto-write) into constants.py.

USAGE
-----
1. Create an Atlassian API token:
   https://id.atlassian.com/manage-profile/security/api-tokens
2. Run:
     export JIRA_BASE="https://bazaar.atlassian.net"
     export JIRA_EMAIL="syed.areeb@bazaartech.com"
     export JIRA_TOKEN="<your-api-token>"
     python jira_import.py            # prints everything
     python jira_import.py --write    # writes jira_generated.py

It maps Jira field types → our form field types:
   text / textarea / select / multiselect / date / email / radio
"""
import os
import sys
import json
import ssl
import base64
import urllib.request
import urllib.error

# ── SSL context (handles macOS missing-certs issue) ──────────────────────────
try:
    import certifi
    _SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    # Fallback: unverified context (only used locally for a trusted host)
    _SSL_CTX = ssl.create_default_context()
    _SSL_CTX.check_hostname = False
    _SSL_CTX.verify_mode = ssl.CERT_NONE

BASE  = os.environ.get("JIRA_BASE",  "https://bazaar.atlassian.net").rstrip("/")
EMAIL = os.environ.get("JIRA_EMAIL", "")
TOKEN = os.environ.get("JIRA_TOKEN", "")


def _auth_header():
    raw = f"{EMAIL}:{TOKEN}".encode()
    return "Basic " + base64.b64encode(raw).decode()


def _get(path, params=None):
    url = f"{BASE}{path}"
    if params:
        from urllib.parse import urlencode
        url += "?" + urlencode(params)
    req = urllib.request.Request(url, headers={
        "Authorization": _auth_header(),
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=30, context=_SSL_CTX) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"  ! HTTP {e.code} on {path}: {e.read().decode()[:200]}", file=sys.stderr)
        return None


def _paged(path, key="values", params=None):
    """Iterate over a paginated Service Desk API endpoint."""
    out, start = [], 0
    while True:
        p = dict(params or {})
        p.update({"start": start, "limit": 50})
        data = _get(path, p)
        if not data:
            break
        out.extend(data.get(key, []))
        if data.get("isLastPage", True):
            break
        start += 50
    return out


# ── Jira field type → our type ────────────────────────────────────────────
def map_field_type(jira_field):
    jt = (jira_field.get("jiraSchema", {}) or {}).get("type", "")
    custom = (jira_field.get("jiraSchema", {}) or {}).get("custom", "") or ""
    name = jira_field.get("name", "").lower()

    if "textarea" in custom or jt == "string" and jira_field.get("required") and "description" in name:
        return "textarea"
    if jt == "date" or jt == "datetime" or "date" in custom:
        return "date"
    if jt == "array":
        return "multiselect"
    if "select" in custom or "radiobuttons" in custom or jira_field.get("validValues"):
        return "radiobuttons" in custom and "radio" or "select"
    if "email" in name:
        return "email"
    if custom.endswith("textarea"):
        return "textarea"
    return "text"


def slugify(label):
    import re
    s = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")
    return s or "field"


def extract():
    print(f"# Connecting to {BASE} as {EMAIL}\n", file=sys.stderr)
    desks = _paged("/rest/servicedeskapi/servicedesk")
    print(f"# Found {len(desks)} service desks\n", file=sys.stderr)

    ticket_types = {}
    form_fields = {}

    for desk in desks:
        sd_id = desk["id"]
        project = desk.get("projectName", desk.get("projectKey", sd_id))
        print(f"# ── Service Desk: {project} (id={sd_id}) ──", file=sys.stderr)

        rtypes = _paged(f"/rest/servicedeskapi/servicedesk/{sd_id}/requesttype")
        for rt in rtypes:
            rt_id   = rt["id"]
            rt_name = rt["name"]
            key     = slugify(rt_name)
            ticket_types[key] = rt_name
            print(f"#   • {rt_name}  (key={key})", file=sys.stderr)

            fdata = _get(f"/rest/servicedeskapi/servicedesk/{sd_id}/requesttype/{rt_id}/field")
            fields = []
            for f in (fdata or {}).get("requestTypeFields", []):
                ftype = map_field_type(f)
                entry = {
                    "key": slugify(f.get("name", f.get("fieldId", ""))),
                    "label": f.get("name", ""),
                    "type": ftype,
                    "required": f.get("required", False),
                }
                vals = [v.get("label") for v in f.get("validValues", []) if v.get("label")]
                if vals:
                    entry["options"] = vals
                desc = f.get("description", "")
                if desc:
                    entry["hint"] = desc
                fields.append(entry)
            form_fields[key] = fields

    return ticket_types, form_fields


def render(ticket_types, form_fields):
    out = ["# AUTO-GENERATED FROM JIRA — review then merge into constants.py\n"]
    out.append("TICKET_TYPES = {")
    for k, v in ticket_types.items():
        out.append(f"    {k!r}: {v!r},")
    out.append("}\n")
    out.append("TICKET_FORM_FIELDS = {")
    for k, fields in form_fields.items():
        out.append(f"    {k!r}: [")
        for f in fields:
            out.append(f"        {f!r},")
        out.append("    ],")
    out.append("}")
    return "\n".join(out)


if __name__ == "__main__":
    if not EMAIL or not TOKEN:
        print("ERROR: set JIRA_EMAIL and JIRA_TOKEN environment variables.", file=sys.stderr)
        sys.exit(1)
    tt, ff = extract()
    text = render(tt, ff)
    if "--write" in sys.argv:
        with open("jira_generated.py", "w") as fh:
            fh.write(text)
        print("\n# Wrote jira_generated.py", file=sys.stderr)
    else:
        print(text)
