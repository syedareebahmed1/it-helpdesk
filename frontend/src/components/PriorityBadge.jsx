const PRIORITY_CONFIG = {
  P1: { label: "Critical", icon: "▲▲", color: "#de350b", bg: "#ffebe6" },
  P2: { label: "High",     icon: "▲",  color: "#ff5630", bg: "#ffebe6" },
  P3: { label: "Medium",   icon: "●",  color: "#ff8b00", bg: "#fffae6" },
  P4: { label: "Low",      icon: "▼",  color: "#36b37e", bg: "#e3fcef" },
};

export default function PriorityBadge({ priority, showLabel = false, className = "" }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.P3;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${className}`}
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
      title={`${priority} – ${cfg.label}`}
    >
      <span className="text-[10px]">{cfg.icon}</span>
      {showLabel ? `${priority} ${cfg.label}` : priority}
    </span>
  );
}
