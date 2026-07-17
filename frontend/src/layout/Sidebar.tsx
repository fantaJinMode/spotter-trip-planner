import { Box, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import { NAV_ITEMS } from "./navItems";
import { SIDEBAR_BG, SIDEBAR_HOVER_BG, SIDEBAR_TEXT_MUTED } from "../theme";

export function Sidebar() {
  return (
    <Box
      component="nav"
      sx={{
        width: 232,
        flexShrink: 0,
        bgcolor: SIDEBAR_BG,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        p: "20px 14px",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <Stack
        component={NavLink}
        to="/"
        direction="row"
        spacing={1.25}
        sx={{ alignItems: "center", px: 1, pb: 3, textDecoration: "none" }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "9px",
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <LocalShippingRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 700, lineHeight: 1.1 }}>
            Trip Planner
          </Typography>
          <Typography sx={{ color: SIDEBAR_TEXT_MUTED, fontSize: 11, lineHeight: 1.1 }}>
            + ELD Logs
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={0.5}>
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <Box
            key={to}
            component={NavLink}
            to={to}
            end={to === "/"}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.25,
              py: 1.1,
              borderRadius: "9px",
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: 500,
              color: SIDEBAR_TEXT_MUTED,
              "&:hover": { bgcolor: SIDEBAR_HOVER_BG },
              "&.active": { bgcolor: "primary.main", color: "#fff" },
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
            {label}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
