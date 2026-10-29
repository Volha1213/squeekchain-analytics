"use client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/chart-data";

export function AnalyticsChart({
  points,
  unit,
  bar = false,
}: {
  points: ChartPoint[];
  unit: string;
  bar?: boolean;
}) {
  const grid = (
    <CartesianGrid
      stroke="var(--line)"
      vertical={false}
      strokeDasharray="3 5"
    />
  );
  const x = (
    <XAxis
      dataKey="label"
      axisLine={false}
      tickLine={false}
      tick={{ fill: "var(--muted)", fontSize: 11 }}
      minTickGap={40}
      dy={12}
    />
  );
  const y = (
    <YAxis
      axisLine={false}
      tickLine={false}
      tick={{ fill: "var(--muted)", fontSize: 11 }}
      width={47}
      tickFormatter={(v) =>
        Intl.NumberFormat("en", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(v)
      }
    />
  );
  const tooltip = (
    <Tooltip
      cursor={{
        stroke: "var(--muted)",
        strokeDasharray: "4 4",
        fill: "var(--accent-soft)",
      }}
      content={({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const point = payload[0].payload as ChartPoint;
        return (
          <div className="chart-tooltip">
            <span>{point.fullLabel}</span>
            <strong>
              {point.value == null
                ? "Unavailable"
                : point.value.toLocaleString("en-US", {
                    maximumFractionDigits: 3,
                  })}{" "}
              {unit}
            </strong>
            {point.coverage && <small>{point.coverage} coverage</small>}
          </div>
        );
      }}
    />
  );
  return (
    <div
      className="chart-canvas"
      role="img"
      aria-label={`${unit} over time. Missing observations are gaps. Use the table view for accessible values.`}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
      >
        {bar ? (
          <BarChart
            data={points}
            margin={{ top: 12, right: 8, bottom: 12, left: -6 }}
          >
            {grid}
            {x}
            {y}
            {tooltip}
            <Bar
              dataKey="value"
              fill="var(--accent)"
              radius={[3, 3, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <AreaChart
            data={points}
            margin={{ top: 12, right: 8, bottom: 12, left: -6 }}
          >
            <defs>
              <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--accent)"
                  stopOpacity={0.24}
                />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {grid}
            {x}
            {y}
            {tooltip}
            <Area
              type="linear"
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#chart-fill)"
              connectNulls={false}
              isAnimationActive={false}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
