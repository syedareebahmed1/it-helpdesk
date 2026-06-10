import { useState, useEffect } from "react";

const API = "";

/* ─── Portal definitions (4 service desks) ──────────────────────────────── */
const PORTALS = [
  {
    id: "it",
    name: "IT Service Desk",
    description: "Welcome! Please select your team and issue type to initiate a support ticket.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    featured: true,
  },
  {
    id: "people",
    name: "People Helpdesk",
    description: "Welcome! You can raise a request for the People Helpdesk using the options provided.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    featured: false,
  },
  {
    id: "3p_people",
    name: "3P People Help Desk",
    description: "Welcome! You can raise a request for the 3P People Help Desk using the options provided.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    featured: false,
  },
  {
    id: "contractual",
    name: "Contractual People HelpDesk",
    description: "Welcome! You can raise a request for the Contractual People HelpDesk using the options provided.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    featured: false,
  },
];

/* ─── Request types per portal ───────────────────────────────────────────── */
const PORTAL_REQUESTS = {
  it: [
    {
      type: "onboarding", label: "Colleague Onboarding",
      description: "Submit an IT onboarding request for a new joiner.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>,
    },
    {
      type: "offboarding", label: "Colleague Offboarding",
      description: "Submit an IT offboarding request for a departing employee.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/></svg>,
    },
    {
      type: "access_nucleus", label: "Nucleus Access Request",
      description: "Request access to the Nucleus system.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    },
    {
      type: "access_commando", label: "Commando Access Request",
      description: "Request access to the Commando platform.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
    },
    {
      type: "access_superset", label: "SuperSet Access Request",
      description: "Request access to Apache SuperSet analytics.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    },
    {
      type: "access_lending", label: "Lending Portal Access",
      description: "Request access to lending portal modules.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>,
    },
    {
      type: "access_aws", label: "AWS Access",
      description: "Request access to AWS accounts, services, or environments.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>,
    },
    {
      type: "access_platform_role", label: "Create New Platform Role",
      description: "Request creation of a new role or permission set on any platform.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
    },
    {
      type: "incident", label: "Report an Incident",
      description: "Report a system outage or critical issue affecting your work.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>,
    },
    {
      type: "hardware_request", label: "Hardware Request",
      description: "Request a laptop, monitor, or other hardware equipment.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
    },
    {
      type: "it_service_request", label: "IT Service Request",
      description: "Request IT support, configuration, or a software installation.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    },
    {
      type: "system_problem", label: "Report a System Problem",
      description: "Let us know if something isn't working and we'll get it back up quickly.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
    },
  ],
  people: [
    {
      type: "onboarding", label: "Colleague Onboarding",
      description: "Submit an onboarding request for a new joiner.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>,
    },
    {
      type: "offboarding", label: "Colleague Offboarding",
      description: "Submit an offboarding request for a departing employee.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/></svg>,
    },
    {
      type: "bz_internal_transfer", label: "BZ Internal Transfer",
      description: "Request an internal transfer, redesignation, or relocation for a Bazaar colleague.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>,
    },
    {
      type: "it_service_request", label: "Requisition Form",
      description: "For people partner only.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
    },
  ],
  "3p_people": [
    {
      type: "onboarding", label: "3P Colleague Onboarding",
      description: "Submit an onboarding request for a 3rd-party new joiner.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>,
    },
    {
      type: "offboarding", label: "3P Colleague Offboarding",
      description: "Submit an offboarding request for a departing 3rd-party employee.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/></svg>,
    },
    {
      type: "it_service_request", label: "3P Requisition Form",
      description: "For 3P people partner only.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
    },
  ],
  contractual: [
    {
      type: "onboarding", label: "Contractual Onboarding",
      description: "Submit an onboarding request for a contractual employee.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>,
    },
    {
      type: "offboarding", label: "Contractual Offboarding",
      description: "Submit an offboarding request for a departing contractual employee.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/></svg>,
    },
    {
      type: "it_service_request", label: "Contractual Requisition",
      description: "Raise a contractual requisition form.",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
    },
  ],
};

/* ─── Decorative SVG pattern (Jira-style) ────────────────────────────────── */
function HeroBanner({ children }) {
  return (
    <div className="relative bg-[#1a1f2e] overflow-hidden">
      {/* Pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.5" fill="white" />
            <path d="M 0 12 Q 6 6 12 12 Q 18 18 24 12" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
            <rect x="30" y="30" width="8" height="8" rx="1" stroke="white" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <circle cx="40" cy="10" r="4" stroke="white" strokeWidth="0.8" fill="none" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Right decoration */}
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-20">
        <svg viewBox="0 0 400 280" className="w-full h-full" fill="none">
          <circle cx="320" cy="80" r="120" stroke="white" strokeWidth="1" />
          <circle cx="320" cy="80" r="80" stroke="white" strokeWidth="0.8" />
          <circle cx="350" cy="200" r="60" stroke="white" strokeWidth="0.6" />
          <path d="M 200 0 Q 280 80 320 160 Q 360 240 400 280" stroke="white" strokeWidth="1" />
        </svg>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ─── Top navigation ─────────────────────────────────────────────────────── */
function TopNav({ onHome }) {
  return (
    <div className="bg-[#1a1f2e] border-b border-white/10 px-6 py-3 flex items-center justify-between">
      <button onClick={onHome} className="flex items-center gap-2.5">
        <span className="text-white font-bold text-xl" style={{ fontFamily: "serif" }}>بازار</span>
      </button>
      <div className="flex items-center gap-3">
        <button className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-[#0052cc] flex items-center justify-center text-white text-[12px] font-bold">SA</div>
      </div>
    </div>
  );
}

/* ─── Help Center landing ────────────────────────────────────────────────── */
function HelpCenter({ onSelectPortal }) {
  const [search, setSearch] = useState("");
  const featured = PORTALS.filter((p) => p.featured);
  const more = PORTALS.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-white">
      <TopNav onHome={() => {}} />

      {/* Hero */}
      <HeroBanner>
        <div className="px-6 py-14 text-center">
          <h1 className="text-[32px] font-bold text-white mb-6">Welcome to the Help Center</h1>
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-[#6b778c] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for information"
              className="w-full pl-12 pr-4 py-3.5 text-[15px] bg-white rounded-lg border-2 border-transparent focus:outline-none focus:border-[#4c9aff] text-[#172b4d] placeholder-[#8590a2] shadow-lg"
            />
          </div>
        </div>
      </HeroBanner>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Featured portals */}
        {featured.length > 0 && (
          <div className="mb-10">
            <h2 className="text-[13px] font-semibold text-[#172b4d] mb-4 uppercase tracking-wide">Featured portals</h2>
            <div className="grid grid-cols-1 gap-3">
              {featured.map((portal) => (
                <PortalCard key={portal.id} portal={portal} onSelect={onSelectPortal} featured />
              ))}
            </div>
          </div>
        )}

        {/* More portals */}
        {more.length > 0 && (
          <div>
            <h2 className="text-[13px] font-semibold text-[#172b4d] mb-4 uppercase tracking-wide">More portals</h2>
            <div className="grid grid-cols-3 gap-4">
              {more.map((portal) => (
                <PortalCard key={portal.id} portal={portal} onSelect={onSelectPortal} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PortalCard({ portal, onSelect, featured }) {
  if (featured) {
    return (
      <button
        onClick={() => onSelect(portal)}
        className="flex items-start gap-5 border border-[#dfe1e6] rounded-lg p-5 hover:border-[#4c9aff] hover:bg-[#f4f7ff] transition-all text-left group shadow-sm"
      >
        <div className="w-12 h-12 rounded-lg bg-[#e9f2ff] text-[#0052cc] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0052cc] group-hover:text-white transition-colors">
          {portal.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-[#172b4d] group-hover:text-[#0052cc] transition-colors">{portal.name}</p>
          <p className="text-[13px] text-[#6b778c] mt-0.5 leading-relaxed">{portal.description}</p>
        </div>
        <svg className="w-5 h-5 text-[#dfe1e6] group-hover:text-[#0052cc] flex-shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(portal)}
      className="flex flex-col border border-[#dfe1e6] rounded-lg p-5 hover:border-[#4c9aff] hover:shadow-md transition-all text-left group shadow-sm"
    >
      <div className="w-10 h-10 rounded-lg bg-[#f1f2f4] text-[#44546f] flex items-center justify-center mb-3 group-hover:bg-[#e9f2ff] group-hover:text-[#0052cc] transition-colors">
        {portal.icon}
      </div>
      <p className="text-[14px] font-bold text-[#172b4d] group-hover:text-[#0052cc] transition-colors">{portal.name}</p>
      <p className="text-[12px] text-[#6b778c] mt-1 leading-relaxed">{portal.description}</p>
    </button>
  );
}

/* ─── Portal home (request type list) ────────────────────────────────────── */
function PortalHome({ portal, onSelectRequest, onBack }) {
  const requests = PORTAL_REQUESTS[portal.id] || [];

  return (
    <div className="min-h-screen bg-white">
      <TopNav onHome={onBack} />

      {/* Small hero banner */}
      <HeroBanner>
        <div className="px-6 py-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-[13px] text-white/60 mb-1">
              <button onClick={onBack} className="hover:text-white transition-colors">Help Center</button>
              <span className="mx-2">/</span>
              <span className="text-white/80">{portal.name}</span>
            </p>
          </div>
        </div>
      </HeroBanner>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Portal title */}
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-[#172b4d]">{portal.name}</h1>
          <p className="text-[14px] text-[#6b778c] mt-1">{portal.description}</p>
        </div>

        {/* Request types */}
        <h2 className="text-[14px] font-bold text-[#0052cc] mb-4">What can we help you with?</h2>

        <div className="divide-y divide-[#f1f2f4]">
          {requests.map((req, i) => (
            <button
              key={`${req.type}-${i}`}
              onClick={() => onSelectRequest(req)}
              className="w-full flex items-center gap-4 py-4 hover:bg-[#f7f8f9] transition-colors text-left group rounded-lg px-3 -mx-3"
            >
              <div className="w-9 h-9 rounded-full bg-[#f1f2f4] text-[#44546f] flex items-center justify-center flex-shrink-0 group-hover:bg-[#e9f2ff] group-hover:text-[#0052cc] transition-colors">
                {req.icon}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#172b4d] group-hover:text-[#0052cc] transition-colors">{req.label}</p>
                {req.description && <p className="text-[12px] text-[#6b778c] mt-0.5">{req.description}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Form fields ────────────────────────────────────────────────────────── */
function FieldInput({ field, value, onChange }) {
  const base = "w-full border border-[#dfe1e6] rounded-md px-3 py-2.5 text-[14px] text-[#172b4d] bg-white focus:outline-none focus:ring-2 focus:ring-[#4c9aff] focus:border-[#4c9aff] transition-colors placeholder-[#8590a2]";

  if (field.type === "text" || field.type === "email" || field.type === "date")
    return <input type={field.type} value={value || ""} onChange={(e) => onChange(e.target.value)} required={field.required} className={base} />;

  if (field.type === "textarea")
    return <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} required={field.required} rows={3} className={`${base} resize-none`} />;

  if (field.type === "select")
    return (
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} required={field.required} className={base}>
        <option value="">Select...</option>
        {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );

  if (field.type === "radio") {
    return (
      <div className="space-y-2">
        {field.options?.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => onChange(opt)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                value === opt ? "border-[#0052cc]" : "border-[#8590a2] group-hover:border-[#0052cc]"
              }`}
            >
              {value === opt && <div className="w-2 h-2 rounded-full bg-[#0052cc]" />}
            </div>
            <span className="text-[14px] text-[#172b4d]">{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "multiselect") {
    const selected = value ? value.split(",").filter(Boolean) : [];
    const toggle = (opt) => {
      const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
      onChange(next.join(","));
    };
    return (
      <div className="flex flex-wrap gap-2">
        {field.options?.map((opt) => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${selected.includes(opt) ? "bg-[#0052cc] border-[#0052cc] text-white" : "bg-white border-[#dfe1e6] text-[#44546f] hover:border-[#4c9aff] hover:text-[#0052cc]"}`}>
            {opt}
          </button>
        ))}
      </div>
    );
  }
  return null;
}

/* ─── Request form ───────────────────────────────────────────────────────── */
function RequestForm({ portal, request, onBack, onSuccess }) {
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    fetch(`${API}/api/public/form-fields/${request.type}`)
      .then((r) => r.json()).then(setFields).catch(() => setFields([]));
  }, [request.type]);

  const setVal = (key) => (val) => setValues((v) => ({ ...v, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const field_values = Object.entries(values).filter(([, v]) => v).map(([field_key, field_value]) => ({ field_key, field_value }));
      const res = await fetch(`${API}/api/public/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submitter_name: name, submitter_email: email, ticket_type: request.type, field_values }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || "Submission failed"); }
      onSuccess(await res.json());
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      <TopNav onHome={() => onBack("home")} />

      {/* Small banner breadcrumb */}
      <HeroBanner>
        <div className="px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-[13px] text-white/60">
              <button onClick={() => onBack("home")} className="hover:text-white transition-colors">Help Center</button>
              <span className="mx-2">/</span>
              <button onClick={() => onBack("portal")} className="hover:text-white transition-colors">{portal.name}</button>
              <span className="mx-2">/</span>
              <span className="text-white/90">{request.label}</span>
            </p>
          </div>
        </div>
      </HeroBanner>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-[22px] font-bold text-[#172b4d] mb-6">{request.label}</h1>

        {error && (
          <div className="mb-5 flex items-start gap-3 bg-[#ffebe6] border border-[#ff8f73] text-[#bf2600] text-[13px] rounded-lg px-4 py-3">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Your details */}
          <div className="bg-white border border-[#dfe1e6] rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-[#f7f8f9] border-b border-[#dfe1e6]">
              <p className="text-[12px] font-semibold text-[#6b778c] uppercase tracking-wide">Your Details</p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#172b4d] mb-1.5">Full Name <span className="text-[#de350b]">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ali Khan"
                  className="w-full border border-[#dfe1e6] rounded-md px-3 py-2.5 text-[14px] text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#4c9aff] focus:border-[#4c9aff] transition-colors placeholder-[#8590a2]" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#172b4d] mb-1.5">Email Address <span className="text-[#de350b]">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ali@bazaartech.com"
                  className="w-full border border-[#dfe1e6] rounded-md px-3 py-2.5 text-[14px] text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#4c9aff] focus:border-[#4c9aff] transition-colors placeholder-[#8590a2]" />
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="bg-white border border-[#dfe1e6] rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-[#f7f8f9] border-b border-[#dfe1e6]">
              <p className="text-[12px] font-semibold text-[#6b778c] uppercase tracking-wide">Request Details</p>
            </div>
            <div className="p-5 space-y-5">
              {fields.length === 0 ? (
                <div className="flex items-center gap-2 text-[#8590a2]">
                  <div className="w-4 h-4 border-2 border-[#0052cc] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[13px]">Loading form…</span>
                </div>
              ) : fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-[13px] font-semibold text-[#172b4d] mb-1.5">
                    {field.label}{field.required && <span className="text-[#de350b] ml-0.5">*</span>}
                  </label>
                  <FieldInput field={field} value={values[field.key]} onChange={setVal(field.key)} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting}
              className="bg-[#0052cc] hover:bg-[#0747a6] disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-md text-[14px] transition-colors shadow-sm">
              {submitting ? "Submitting…" : "Send"}
            </button>
            <button type="button" onClick={() => onBack("portal")}
              className="border border-[#dfe1e6] bg-white hover:bg-[#f7f8f9] text-[#172b4d] font-semibold py-2.5 px-6 rounded-md text-[14px] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Success screen ─────────────────────────────────────────────────────── */
function Success({ ticket, onReset }) {
  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      <TopNav onHome={onReset} />
      <HeroBanner><div className="py-4" /></HeroBanner>

      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 bg-[#e3fcef] rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-[#00875a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-[22px] font-bold text-[#172b4d] mb-2">Request Submitted</h1>
        <p className="text-[14px] text-[#6b778c] mb-8">Your request has been received. The team will pick it up shortly.</p>

        <div className="bg-white border border-[#dfe1e6] rounded-lg p-6 mb-8 text-left shadow-sm">
          <p className="text-[11px] font-semibold text-[#6b778c] uppercase tracking-wide mb-2">Reference Number</p>
          <p className="text-[28px] font-bold text-[#0052cc]">{ticket.ticket_number}</p>
          <p className="text-[13px] text-[#44546f] mt-2">{ticket.title}</p>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#fff0b3] text-[#172b4d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              {ticket.status}
            </span>
          </div>
        </div>

        <p className="text-[12px] text-[#8590a2] mb-6">
          Save your reference number <strong className="text-[#172b4d]">{ticket.ticket_number}</strong> to track your request.
        </p>

        <button onClick={onReset} className="bg-[#0052cc] hover:bg-[#0747a6] text-white font-semibold py-2.5 px-6 rounded-md text-[14px] transition-colors shadow-sm">
          Raise Another Request
        </button>
      </div>
    </div>
  );
}

/* ─── App root ───────────────────────────────────────────────────────────── */
export default function App() {
  const [screen,   setScreen]   = useState("help_center"); // help_center | portal | form | success
  const [portal,   setPortal]   = useState(null);
  const [request,  setRequest]  = useState(null);
  const [ticket,   setTicket]   = useState(null);

  const handleBack = (to) => {
    if (to === "home")   { setScreen("help_center"); setPortal(null); setRequest(null); }
    if (to === "portal") { setScreen("portal"); setRequest(null); }
  };

  if (screen === "success" && ticket)
    return <Success ticket={ticket} onReset={() => { setScreen("help_center"); setPortal(null); setRequest(null); setTicket(null); }} />;

  if (screen === "form" && portal && request)
    return <RequestForm portal={portal} request={request} onBack={handleBack} onSuccess={(t) => { setTicket(t); setScreen("success"); }} />;

  if (screen === "portal" && portal)
    return <PortalHome portal={portal} onSelectRequest={(req) => { setRequest(req); setScreen("form"); }} onBack={() => setScreen("help_center")} />;

  return <HelpCenter onSelectPortal={(p) => { setPortal(p); setScreen("portal"); }} />;
}
