// components/BarChart.jsx
//
// Zero-dependency SVG bar chart. If your project already has recharts,
// chart.js, or similar installed, feel free to swap this out — this
// version exists so Analytics renders a real chart with no new packages.

export default function BarChart({ data, valueKey = "value", labelKey = "metric" }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  const barWidth = 60;
  const gap = 24;
  const chartHeight = 200;
  const width = data.length * (barWidth + gap) + gap;

  return (
    <svg
      viewBox={`0 0 ${width} ${chartHeight + 40}`}
      className="w-full h-auto"
      role="img"
      aria-label="Bar chart"
    >
      {data.map((d, i) => {
        const value = d[valueKey] || 0;
        const barHeight = (value / max) * chartHeight;
        const x = gap + i * (barWidth + gap);
        const y = chartHeight - barHeight;

        return (
          <g key={d[labelKey]}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={6}
              fill="#facc15"
              opacity={0.9}
            />
            <text
              x={x + barWidth / 2}
              y={y - 8}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="14"
              fontWeight="600"
            >
              {value}
            </text>
            <text
              x={x + barWidth / 2}
              y={chartHeight + 20}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
            >
              {d[labelKey]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
