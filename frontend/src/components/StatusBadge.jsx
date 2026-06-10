const STATUS_STYLES = {
  "WAITING FOR SUPPORT":  { bg: "#deebff", text: "#0747a6", dot: "#0052cc" },
  "AWAITING APPROVAL":    { bg: "#fff0b3", text: "#172b4d", dot: "#f59e0b" },
  "WAITING FOR APPROVAL": { bg: "#fff0b3", text: "#172b4d", dot: "#f59e0b" },
  "ACKNOWLEDGE":          { bg: "#e3fcef", text: "#006644", dot: "#00875a" },
  "IN PROGRESS":          { bg: "#e9f2ff", text: "#0052cc", dot: "#0052cc" },
  "WORK IN PROGRESS":     { bg: "#e9f2ff", text: "#0052cc", dot: "#0052cc" },
  "HOLD":                 { bg: "#fffae6", text: "#974f0c", dot: "#ff8b00" },
  "PENDING":              { bg: "#fffae6", text: "#974f0c", dot: "#ff8b00" },
  "PENDING VENDOR":       { bg: "#fffae6", text: "#974f0c", dot: "#ff8b00" },
  "RESOLVED":             { bg: "#e3fcef", text: "#006644", dot: "#00875a" },
  "COMPLETED":            { bg: "#e3fcef", text: "#006644", dot: "#00875a" },
  "CLOSED":               { bg: "#f1f2f4", text: "#44546f", dot: "#8590a2" },
  "CANCELED":             { bg: "#f1f2f4", text: "#44546f", dot: "#8590a2" },
  "REJECTED":             { bg: "#ffebe6", text: "#bf2600", dot: "#de350b" },
  "NOT APPROVED":         { bg: "#ffebe6", text: "#bf2600", dot: "#de350b" },
  "OPEN":                 { bg: "#e9f2ff", text: "#0052cc", dot: "#0052cc" },
  "CREATE CREDENTIALS":   { bg: "#eae6ff", text: "#403294", dot: "#5243aa" },
  "CLOSE CREDENTIALS":    { bg: "#eae6ff", text: "#403294", dot: "#5243aa" },
  "WAITING FOR LAPTOP":   { bg: "#e6fcff", text: "#008da6", dot: "#00b8d9" },
};

export default function StatusBadge({ status, className = "" }) {
  const style = STATUS_STYLES[status] || { bg: "#f1f2f4", text: "#44546f", dot: "#8590a2" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${className}`}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: style.dot }} />
      {status}
    </span>
  );
}
