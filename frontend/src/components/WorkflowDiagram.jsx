import StatusBadge from "./StatusBadge";

export default function WorkflowDiagram({ workflow, currentStatus }) {
  if (!workflow) return null;

  const { states, transitions } = workflow;

  const getTransitionsFrom = (stateName) =>
    transitions.filter((t) => t.from_state === stateName || t.from_state === "*");

  const initial = states.find((s) => s.is_initial);
  const terminals = states.filter((s) => s.is_terminal);
  const middle = states.filter((s) => !s.is_initial && !s.is_terminal);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 text-xs text-gray-500">
          <span className="font-medium text-gray-700 text-sm">
            {workflow.name}
          </span>
          {currentStatus && (
            <span className="ml-auto text-xs">
              Current: <StatusBadge status={currentStatus} />
            </span>
          )}
        </div>

        <svg
          viewBox="0 0 700 320"
          className="w-full"
          style={{ minHeight: 280 }}
        >
          {/* START node */}
          <circle cx={60} cy={40} r={20} fill="#1e293b" />
          <text x={60} y={45} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">
            START
          </text>

          {/* Arrow from START to initial */}
          <line x1={60} y1={60} x2={60} y2={88} stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#arrow)" />

          {/* Initial state */}
          {initial && (
            <StateBox
              state={initial}
              x={10} y={90} w={100} h={32}
              isCurrent={currentStatus === initial.name}
            />
          )}

          {/* Middle states */}
          {middle.map((state, i) => {
            const cols = Math.min(middle.length, 3);
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = 130 + col * 150;
            const y = 90 + row * 80;
            return (
              <StateBox
                key={state.id}
                state={state}
                x={x} y={y} w={130} h={32}
                isCurrent={currentStatus === state.name}
              />
            );
          })}

          {/* Terminal states */}
          {terminals.map((state, i) => {
            const x = 10 + i * 180;
            const y = 260;
            return (
              <StateBox
                key={state.id}
                state={state}
                x={x} y={y} w={130} h={32}
                isCurrent={currentStatus === state.name}
                isTerminal
              />
            );
          })}

          <defs>
            <marker id="arrow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
              <path d="M0,0 L0,8 L8,4 z" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>

        {/* Transitions list (text) */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Transitions</p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <span key={t.id} className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-600">
                {t.from_state === "*" ? "Any" : t.from_state} → {t.to_state}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StateBox({ state, x, y, w, h, isCurrent, isTerminal }) {
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h}
        rx={4}
        fill={state.color || (isTerminal ? "#bbf7d0" : "#dbeafe")}
        stroke={isCurrent ? "#2563eb" : "#cbd5e1"}
        strokeWidth={isCurrent ? 2 : 1}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 4}
        textAnchor="middle"
        fontSize={9}
        fontWeight={isCurrent ? "bold" : "500"}
        fill={state.text_color || "#1e293b"}
      >
        {state.name}
      </text>
    </g>
  );
}
