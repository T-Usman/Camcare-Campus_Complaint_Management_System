import React, { useState } from 'react';

/**
 * TrendLineChart
 * Strictly conforms to design system:
 * - Single indigo line (rgb(79, 70, 229))
 * - Flat dot markers
 * - Zero gradient fill under the line
 */
const DEFAULT_DATA = [
  { month: 'Feb', rate: 78 },
  { month: 'Mar', rate: 85 },
  { month: 'Apr', rate: 88 },
  { month: 'May', rate: 76 },
  { month: 'Jun', rate: 83 },
  { month: 'Jul', rate: 78 }
];

export function TrendLineChart({ data: dataProp }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const data = dataProp && dataProp.length > 0 ? dataProp : DEFAULT_DATA;

  const chartWidth = 720;
  const chartHeight = 180;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const yTicks = [0, 25, 50, 75, 100];

  const points = data.map((d, i) => {
    const x = data.length > 1
      ? paddingLeft + (i / (data.length - 1)) * plotWidth
      : paddingLeft + plotWidth / 2;
    const y = paddingTop + plotHeight - (d.rate / 100) * plotHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Resolution Rate Trend
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Percentage of complaints resolved each month
        </div>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Y Axis Gridlines and Labels */}
        {yTicks.map((tick) => {
          const y = paddingTop + plotHeight - (tick / 100) * plotHeight;
          return (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="var(--border-color)"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                fontSize="10"
                fill="var(--text-muted)"
                fontFamily="var(--font-sans)"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* The Single Indigo Line (NO gradient underneath) */}
        <path
          d={pathD}
          fill="none"
          stroke="rgb(79, 70, 229)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Flat Dot Markers */}
        {points.map((pt, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <g
              key={pt.month}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Point circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 5.5 : 4}
                fill="rgb(79, 70, 229)"
                stroke="var(--bg-card)"
                strokeWidth="2"
              />

              {/* X Axis Month Label */}
              <text
                x={pt.x}
                y={chartHeight - 8}
                textAnchor="middle"
                fontSize="11"
                fill={isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                fontFamily="var(--font-sans)"
                fontWeight={isHovered ? '600' : '400'}
              >
                {pt.month}
              </text>

              {/* Hover Value Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={pt.x - 30}
                    y={pt.y - 28}
                    width="60"
                    height="20"
                    rx="3"
                    fill="var(--bg-page)"
                    stroke="var(--border-color)"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 14}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--text-primary)"
                    fontFamily="var(--font-sans)"
                    fontWeight="600"
                  >
                    {pt.rate}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default TrendLineChart;
