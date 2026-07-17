import { Paper, Typography } from "@mui/material";
import type { DailyLog, DutyStatus } from "../../api/types";
import { GRID_W, ROW_Y, eventsToSegments } from "./logGeometry";

export interface LogSheetProps {
  log: DailyLog;
}

const ROW_LABELS: Record<DutyStatus, string> = {
  off_duty: "Off Duty",
  sleeper: "Sleeper",
  driving: "Driving",
  on_duty: "On Duty",
};

const ROW_ORDER: DutyStatus[] = ["off_duty", "sleeper", "driving", "on_duty"];
const ROW_H = 30;
const TOTALS_X = GRID_W + 20;
const SVG_W = GRID_W + 100;
const SVG_H = 180;

export function LogSheet({ log }: LogSheetProps) {
  const segments = eventsToSegments(log.events);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Driver Log for {log.date}
      </Typography>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        role="img"
        aria-label={`Daily log for ${log.date}`}
        style={{ width: "100%", height: "auto" }}
      >
        {/* hour ticks + labels */}
        {Array.from({ length: 25 }, (_, h) => {
          const x = (h / 24) * GRID_W;
          return (
            <g key={`tick-${h}`}>
              <line x1={x} y1={0} x2={x} y2={ROW_H * 4} stroke="#ccc" strokeWidth={1} />
              <text x={x} y={ROW_H * 4 + 12} fontSize={8} textAnchor="middle">
                {h}
              </text>
            </g>
          );
        })}

        {/* row labels + grid lines */}
        {ROW_ORDER.map((status, i) => (
          <g key={status}>
            <line x1={0} y1={ROW_Y[status]} x2={GRID_W} y2={ROW_Y[status]} stroke="#ddd" strokeWidth={1} />
            <text x={-4} y={ROW_Y[status] + 4} fontSize={9} textAnchor="end">
              {ROW_LABELS[status]}
            </text>
            <text x={TOTALS_X} y={ROW_Y[status] + 4} fontSize={9}>
              {log.totals[status].toFixed(2)} hr
            </text>
            <rect x={0} y={i * ROW_H} width={GRID_W} height={ROW_H} fill="none" />
          </g>
        ))}

        {/* step-line duty segments */}
        {segments.map((seg, i) => (
          <line
            key={i}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke="#0E7C86"
            strokeWidth={2.5}
          />
        ))}
      </svg>
    </Paper>
  );
}
