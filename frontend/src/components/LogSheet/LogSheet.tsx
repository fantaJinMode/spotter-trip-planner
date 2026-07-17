import { Paper, Typography } from "@mui/material";
import type { DailyLog, DutyStatus } from "../../api/types";
import {
  GRID_W,
  GRID_H,
  HOUR_W,
  ROW_H,
  ROW_Y,
  eventsToSegments,
  transitionDots,
} from "./logGeometry";

export interface LogSheetProps {
  log: DailyLog;
}

const ROW_ORDER: DutyStatus[] = ["off_duty", "sleeper", "driving", "on_duty"];
const ROW_LABELS: Record<DutyStatus, [string, string?]> = {
  off_duty: ["1: OFF DUTY"],
  sleeper: ["2: SLEEPER", "BERTH"],
  driving: ["3: DRIVING"],
  on_duty: ["4: ON DUTY", "(NOT DRIVING)"],
};

const BLUE = "#3A53A4";
const RED = "#D32F2F";
const GRID_X = 110; // left margin for row labels
const GRID_TOP = 18; // top margin for the upper time scale
const TOTALS_X = GRID_W + 38; // grid-relative x of the totals column, clear of the "Midnight" label
const SVG_W = GRID_X + GRID_W + 90;
const SVG_H = GRID_TOP + GRID_H + 28;
const QUARTER_TICK = ROW_H * 0.28;
const HALF_TICK = ROW_H * 0.45; // 30-min tick is taller, like the paper form

const hourLabel = (h: number) =>
  h % 24 === 0 ? "Midnight" : h % 12 === 0 ? "noon" : String(h % 12);

export function LogSheet({ log }: LogSheetProps) {
  const segments = eventsToSegments(log.events);
  const dots = transitionDots(log.events);
  const totalHours = ROW_ORDER.reduce((sum, s) => sum + log.totals[s], 0);

  return (
    <Paper sx={{ p: 2, bgcolor: "#fff" }}>
      <Typography variant="h6" gutterBottom>
        Driver Log for {log.date}
      </Typography>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        role="img"
        aria-label={`Daily log for ${log.date}`}
        style={{ width: "100%", height: "auto" }}
      >
        <g transform={`translate(${GRID_X}, ${GRID_TOP})`}>
          {/* hour lines + time labels above and below the grid */}
          {Array.from({ length: 25 }, (_, h) => {
            const x = h * HOUR_W;
            return (
              <g key={`hour-${h}`}>
                <line x1={x} y1={0} x2={x} y2={GRID_H} stroke={BLUE} strokeWidth={1} />
                <text x={x} y={-6} fontSize={9} fontWeight={700} fill={BLUE} textAnchor="middle">
                  {hourLabel(h)}
                </text>
                <text x={x} y={GRID_H + 13} fontSize={9} fontWeight={700} fill={BLUE} textAnchor="middle">
                  {hourLabel(h)}
                </text>
              </g>
            );
          })}

          {/* quarter-hour ticks hanging from the top edge of every row */}
          {ROW_ORDER.map((status, row) =>
            Array.from({ length: 24 }, (_, h) =>
              [15, 30, 45].map((min) => {
                const x = h * HOUR_W + (min / 60) * HOUR_W;
                const yTop = row * ROW_H;
                const len = min === 30 ? HALF_TICK : QUARTER_TICK;
                return (
                  <line
                    key={`tick-${status}-${h}-${min}`}
                    x1={x}
                    y1={yTop}
                    x2={x}
                    y2={yTop + len}
                    stroke={BLUE}
                    strokeWidth={1}
                  />
                );
              }),
            ),
          )}

          {/* row boundaries, labels, and per-row totals */}
          {ROW_ORDER.map((status, i) => {
            const [label, sub] = ROW_LABELS[status];
            const midY = ROW_Y[status];
            return (
              <g key={status}>
                {i > 0 && (
                  <line x1={0} y1={i * ROW_H} x2={GRID_W} y2={i * ROW_H} stroke={BLUE} strokeWidth={1.5} />
                )}
                <text x={-10} y={sub ? midY - 2 : midY + 4} fontSize={11} fontWeight={700} fill={BLUE} textAnchor="end">
                  {label}
                </text>
                {sub && (
                  <text
                    x={-10}
                    y={midY + 10}
                    fontSize={sub.startsWith("(") ? 8 : 11}
                    fontWeight={700}
                    fill={BLUE}
                    textAnchor="end"
                  >
                    {sub}
                  </text>
                )}
                <text x={TOTALS_X} y={midY + 4} fontSize={11} fill={BLUE}>
                  {log.totals[status].toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* enclosing rectangle */}
          <rect x={0} y={0} width={GRID_W} height={GRID_H} fill="none" stroke={BLUE} strokeWidth={2} />

          {/* sum of the totals column */}
          <text x={TOTALS_X} y={GRID_H + 13} fontSize={11} fontWeight={700} fill={BLUE}>
            {totalHours.toFixed(2)}
          </text>

          {/* duty-status step line through the middle of each row */}
          {segments.map((seg, i) => (
            <line
              key={`seg-${i}`}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#000"
              strokeWidth={3}
              strokeLinecap="square"
            />
          ))}

          {/* red dots at each status transition */}
          {dots.map((d, i) => (
            <circle key={`dot-${i}`} cx={d.x} cy={d.y} r={3.5} fill={RED} />
          ))}
        </g>
      </svg>
    </Paper>
  );
}
