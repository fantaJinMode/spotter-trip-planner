import { Box, Typography } from "@mui/material";

export interface TopbarProps {
  title: string;
  subtitle: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <Box
      sx={{
        height: 68,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: { xs: 2.5, md: 3.5 },
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography component="h1" sx={{ fontSize: 19, fontWeight: 700, color: "#111827" }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary", display: { xs: "none", sm: "block" } }}>
        {subtitle}
      </Typography>
    </Box>
  );
}
