const PRIORITY_STYLES = {
  P1: "bg-red-500 text-white",
  P2: "bg-orange-400 text-white",
  P3: "bg-yellow-400 text-gray-900",
  P4: "bg-gray-300 text-gray-700",
};

const PRIORITY_LABELS = {
  P1: "P1 Critical",
  P2: "P2 High",
  P3: "P3 Medium",
  P4: "P4 Low",
};

export default function PriorityBadge({ priority, showLabel = false, className = "" }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.P3;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${style} ${className}`}>
      {showLabel ? PRIORITY_LABELS[priority] || priority : priority}
    </span>
  );
}
