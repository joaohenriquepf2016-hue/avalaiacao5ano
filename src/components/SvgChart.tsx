import React, { useState } from "react";

interface SvgChartProps {
  portugues: number[]; // [s1, s2, s3, ...]
  matematica: number[]; // [s1, s2, s3, ...]
  labels: string[]; // ["1º Sim.", "2º Sim.", ...]
}

export default function SvgChart({ portugues, matematica, labels }: SvgChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    subject: string;
    simulado: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  // Chart configuration
  const width = 600;
  const height = 340;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 50;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Values range from 30% to 100%
  const yMin = 30;
  const yMax = 100;
  const yRange = yMax - yMin;

  const count = labels.length;
  const getX = (index: number) => {
    if (count <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + index * (plotWidth / (count - 1));
  };

  const getY = (value: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, value));
    return paddingTop + plotHeight - ((clamped - yMin) / yRange) * plotHeight;
  };

  // Helper to color points by level
  const getPointColor = (val: number) => {
    if (val >= 85) return "#5cb85c"; // Adequado
    if (val >= 70) return "#f0a500"; // Intermediário
    return "#c0392b"; // Crítico
  };

  const getPointLabel = (val: number) => {
    if (val >= 85) return "Adequado";
    if (val >= 70) return "Intermediário";
    return "Crítico";
  };

  // Y-axis grid ticks (30, 40, 50, 60, 70, 80, 90, 100)
  const yTicks = [30, 40, 50, 60, 70, 80, 90, 100];

  // Draw background colored bands
  const y70 = getY(70);
  const y85 = getY(85);
  const yBot = getY(30);
  const yTop = getY(100);

  // SVG Line paths
  const getPathD = (data: number[]) => {
    if (data.length === 0) return "";
    const points = data.map((val, i) => ({ x: getX(i), y: getY(val) }));
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  const getAreaD = (data: number[]) => {
    if (data.length === 0) return "";
    const points = data.map((val, i) => ({ x: getX(i), y: getY(val) }));
    const path = getPathD(data);
    return `${path} L ${points[points.length - 1].x} ${yBot} L ${points[0].x} ${yBot} Z`;
  };

  return (
    <div id="svg-chart-container" className="relative w-full overflow-x-auto select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        className="min-w-[500px]"
      >
        {/* Horizontal Background Colored Bands */}
        {/* Crítico (< 70%) */}
        <rect
          x={paddingLeft}
          y={y85}
          width={plotWidth}
          height={y70 - y85}
          fill="rgba(240, 165, 0, 0.07)"
        />
        <rect
          x={paddingLeft}
          y={y70}
          width={plotWidth}
          height={yBot - y70}
          fill="rgba(192, 57, 43, 0.08)"
        />
        <rect
          x={paddingLeft}
          y={yTop}
          width={plotWidth}
          height={y85 - yTop}
          fill="rgba(92, 184, 92, 0.08)"
        />

        {/* Dashed Threshold Lines */}
        <line
          x1={paddingLeft}
          y1={y85}
          x2={width - paddingRight}
          y2={y85}
          stroke="#5cb85c"
          strokeWidth="1.5"
          strokeDasharray="6,4"
          opacity="0.7"
        />
        <line
          x1={paddingLeft}
          y1={y70}
          x2={width - paddingRight}
          y2={y70}
          stroke="#f0a500"
          strokeWidth="1.5"
          strokeDasharray="6,4"
          opacity="0.6"
        />

        {/* Grid Lines & Y Ticks */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={paddingLeft}
              y1={getY(tick)}
              x2={width - paddingRight}
              y2={getY(tick)}
              stroke="#e2e8f0"
              strokeWidth="1"
              opacity={tick === 70 || tick === 85 ? 0 : 0.5}
            />
            <text
              x={paddingLeft - 12}
              y={getY(tick) + 4}
              textAnchor="end"
              className="font-mono text-[10px] font-semibold fill-slate-400"
            >
              {tick}%
            </text>
          </g>
        ))}

        {/* X Ticks & Labels */}
        {labels.map((label, i) => (
          <g key={i}>
            <line
              x1={getX(i)}
              y1={paddingTop}
              x2={getX(i)}
              y2={paddingTop + plotHeight}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.5"
            />
            <text
              x={getX(i)}
              y={paddingTop + plotHeight + 22}
              textAnchor="middle"
              className="font-sans text-[11px] font-bold fill-slate-500"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Português Area and Line */}
        <path
          d={getAreaD(portugues)}
          fill="url(#portuguesGrad)"
          opacity="0.5"
        />
        <path
          d={getPathD(portugues)}
          fill="none"
          stroke="#4a80c4"
          strokeWidth="3.5"
        />

        {/* Matemática Area and Line */}
        <path
          d={getAreaD(matematica)}
          fill="url(#matematicaGrad)"
          opacity="0.4"
        />
        <path
          d={getPathD(matematica)}
          fill="none"
          stroke="#e05a00"
          strokeWidth="3.5"
        />

        {/* Data Points (Português) */}
        {portugues.map((val, i) => {
          const cx = getX(i);
          const cy = getY(val);
          return (
            <circle
              key={`p-${i}`}
              cx={cx}
              cy={cy}
              r="7"
              fill={getPointColor(val)}
              stroke="#fff"
              strokeWidth="2"
              className="cursor-pointer transition-colors duration-150 hover:stroke-slate-200"
              onMouseEnter={(e) => {
                setHoveredPoint({
                  subject: "Língua Portuguesa",
                  simulado: i + 1,
                  value: val,
                  x: cx,
                  y: cy,
                });
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          );
        })}

        {/* Data Points (Matemática) */}
        {matematica.map((val, i) => {
          const cx = getX(i);
          const cy = getY(val);
          return (
            <circle
              key={`m-${i}`}
              cx={cx}
              cy={cy}
              r="7"
              fill={getPointColor(val)}
              stroke="#fff"
              strokeWidth="2"
              className="cursor-pointer transition-colors duration-150 hover:stroke-slate-200"
              onMouseEnter={() => {
                setHoveredPoint({
                  subject: "Matemática",
                  simulado: i + 1,
                  value: val,
                  x: cx,
                  y: cy,
                });
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          );
        })}

        {/* Gradients definitions */}
        <defs>
          <linearGradient id="portuguesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a80c4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4a80c4" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="matematicaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e05a00" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#e05a00" stopOpacity="0.01" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          id="chart-tooltip"
          className="absolute z-10 bg-slate-900 text-white rounded-lg p-3 text-xs shadow-xl border border-slate-700 pointer-events-none transition-all duration-100"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${hoveredPoint.y - 65}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-bold border-b border-slate-700 pb-1 mb-1">
            {hoveredPoint.simulado}º Simulado
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                background:
                  hoveredPoint.subject === "Matemática" ? "#e05a00" : "#4a80c4",
              }}
            ></span>
            {hoveredPoint.subject}:{" "}
            <span className="text-amber-400 font-bold">
              {hoveredPoint.value.toFixed(1)}%
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Nível:{" "}
            <span
              className="font-bold"
              style={{ color: getPointColor(hoveredPoint.value) }}
            >
              {getPointLabel(hoveredPoint.value)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
