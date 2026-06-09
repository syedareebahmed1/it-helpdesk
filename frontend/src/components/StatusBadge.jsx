const STATUS_STYLES = {
  "WAITING FOR SUPPORT": "bg-blue-100 text-blue-700 border-blue-200",
  "ACKNOWLEDGE": "bg-blue-200 text-blue-800 border-blue-300",
  "IN PROGRESS": "bg-blue-600 text-white border-blue-600",
  "CREATE CREDENTIALS": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "RESOLVED": "bg-green-100 text-green-700 border-green-200",
  "NOT APPROVED": "bg-red-100 text-red-700 border-red-200",
  "REJECTED": "bg-red-100 text-red-700 border-red-200",
  "HOLD": "bg-orange-100 text-orange-700 border-orange-200",
  "AWAITING APPROVAL": "bg-slate-100 text-slate-600 border-slate-200",
  "OPEN": "bg-sky-100 text-sky-700 border-sky-200",
};

export default function StatusBadge({ status, className = "" }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style} ${className}`}
    >
      {status}
    </span>
  );
}
