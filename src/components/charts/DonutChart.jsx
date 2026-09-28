import React, { useState } from 'react';

/**
 * DonutChart
 * Strictly conforms to design system:
 * - Monochrome ramp of indigo tints and grays
 * - No multi-hue colors (no red, green, orange, yellow, etc.)
 * - Plain text legend with counts
 */
// Fixed monochrome ramp applied in order to whatever categories the API
// actually returns, so the design system rule (no multi-hue colors) holds
// regardless of how many/which categories exist in the real data.
const SHADE_RAMP = [
  'rgb(79, 70, 229)',   // Primary indigo
  'rgb(99, 102, 241)',  // Indigo tint 1
  'rgb(129, 140, 248)', // Indigo tint 2
  'rgb(165, 180, 252)', // Indigo tint 3
  '#9CA3AF',            // Neutral light gray
  '#4B5563',            // Neutral dark gray
  '#D1D5DB',            // Extra fallback shade
  '#6B7280'             // Extra fallback shade
];

const DEFAULT_CATEGORIES = [
  { name: 'Facilities', count: 38 },
  { name: 'IT', count: 22 },
  { name: 'Welfare', count: 16 },
  { name: 'Library', count: 12 },
  { name: 'Catering', count: 8 },
  { name: 'Academic', count: 4 }
];

export function DonutChart({ data: dataProp }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const rawCategories = dataProp && dataProp.length > 0
    ? dataProp.map(c => ({ name: c.category ?? c.name, count: c.count }))
    : DEFAULT_CATEGORIES;

  const categories = rawCategories.map((cat, i) => ({
    ...cat,
    color: SHADE_RAMP[i % SHADE_RAMP.length]
  }));

  const total = categories.reduce((sum, item) => sum + item.count, 0) || 1;

  // Donut geometry
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Complaints by Category
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          All time ({total} total)
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        {/* SVG Donut Ring */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {categories.map((cat, i) => {
              const strokeDasharray = `${(cat.count / total) * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += (cat.count / total) * circumference;

              const isHovered = hoveredIdx === i;

              return (
                <circle
                  key={cat.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{
                    transition: 'stroke-width 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Centered label inside donut */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {hoveredIdx !== null ? categories[hoveredIdx].count : total}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {hoveredIdx !== null ? categories[hoveredIdx].name : 'Total'}
            </div>
          </div>
        </div>

        {/* Plain text legend + counts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {categories.map((cat, idx) => (
            <div
              key={cat.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12.5px',
                color: hoveredIdx === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: hoveredIdx === idx ? 600 : 400,
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px'
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '9px',
                    height: '9px',
                    backgroundColor: cat.color,
                    borderRadius: '2px',
                    display: 'inline-block'
                  }}
                />
                <span>{cat.name}</span>
              </div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{cat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DonutChart;
