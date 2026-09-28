import React, { useState } from 'react';

/**
 * GroupedBarChart
 * Strictly conforms to design system:
 * - Solid indigo for Submitted (rgb(79, 70, 229))
 * - Light/medium gray for Resolved (#A1A1AA)
 * - Zero gradients, flat solid bars only.
 */
const DEFAULT_DATA = [
  { month: 'Feb', submitted: 14, resolved: 12 },
  { month: 'Mar', submitted: 22, resolved: 19 },
  { month: 'Apr', submitted: 18, resolved: 16 },
  { month: 'May', submitted: 26, resolved: 20 },
  { month: 'Jun', submitted: 30, resolved: 25 },
  { month: 'Jul', submitted: 24, resolved: 18 }
];

export function GroupedBarChart({ data: dataProp, subtitle }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const data = dataProp && dataProp.length > 0 ? dataProp : DEFAULT_DATA;

  // Scale the y-axis to whatever the real data actually contains, rounded
  // up to a clean step, instead of a fixed value that assumes 6 months.
  const rawMax = Math.max(1, ...data.map(d => Math.max(d.submitted, d.resolved)));
  const step = Math.ceil(rawMax / 4 / 4) * 4 || 4;
  const maxVal = step * 4;
  const chartHeight = 220;
  const chartWidth = 520;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 20;
  const plotWidth = chartWidth - paddingLeft - 20;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const groupWidth = plotWidth / data.length;
  const barWidth = 14;

  const yTicks = [0, step, step * 2, step * 3, maxVal];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Monthly Submissions vs. Resolutions
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subtitle || (data.length > 0 ? `${data[0].month} – ${data[data.length - 1].month} 2026` : 'No data yet')}
          </div>
        </div>

        {/* Legend using strictly monochrome / indigo palette */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'rgb(79, 70, 229)', borderRadius: '2px', display: 'inline-block' }} />
            <span>Submitted</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#A1A1AA', borderRadius: '2px', display: 'inline-block' }} />
            <span>Resolved</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Y Axis Gridlines and Labels */}
        {yTicks.map((tick) => {
          const y = paddingTop + plotHeight - (tick / maxVal) * plotHeight;
          return (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - 20}
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
                {tick}
              </text>
            </g>
          );
        })}

        {/* Groups of Bars */}
        {data.map((item, idx) => {
          const groupX = paddingLeft + idx * groupWidth;
          const centerX = groupX + groupWidth / 2;

          const subHeight = (item.submitted / maxVal) * plotHeight;
          const subY = paddingTop + plotHeight - subHeight;

          const resHeight = (item.resolved / maxVal) * plotHeight;
          const resY = paddingTop + plotHeight - resHeight;

          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={item.month}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Submitted bar (solid indigo) */}
              <rect
                x={centerX - barWidth - 2}
                y={subY}
                width={barWidth}
                height={subHeight}
                fill="rgb(79, 70, 229)"
                rx="2"
              />
              {/* Resolved bar (light gray) */}
              <rect
                x={centerX + 2}
                y={resY}
                width={barWidth}
                height={resHeight}
                fill="#A1A1AA"
                rx="2"
              />

              {/* Month Label */}
              <text
                x={centerX}
                y={chartHeight - 8}
                textAnchor="middle"
                fontSize="11"
                fill={isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                fontFamily="var(--font-sans)"
                fontWeight={isHovered ? '600' : '400'}
              >
                {item.month}
              </text>

              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={centerX - 45}
                    y={Math.min(subY, resY) - 34}
                    width="90"
                    height="26"
                    rx="4"
                    fill="var(--bg-page)"
                    stroke="var(--border-color)"
                  />
                  <text
                    x={centerX}
                    y={Math.min(subY, resY) - 17}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--text-primary)"
                    fontFamily="var(--font-sans)"
                    fontWeight="500"
                  >
                    Sub: {item.submitted} | Res: {item.resolved}
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

export default GroupedBarChart;
