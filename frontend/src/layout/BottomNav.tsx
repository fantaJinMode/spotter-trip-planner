import { Box } from "@mui/material";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";

export function BottomNav() {
  return (
    <Box
      component="nav"
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        zIndex: (t) => t.zIndex.appBar,
      }}
    >
      {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
        <Box
          key={to}
          component={NavLink}
          to={to}
          end={to === "/"}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.25,
            py: 1,
            textDecoration: "none",
            color: "text.secondary",
            fontSize: 11,
            fontWeight: 600,
            "&.active": { color: "primary.main" },
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
          {label}
        </Box>
      ))}
    </Box>
  );
}
