import { createTheme } from "@mui/material/styles";

export const SIDEBAR_BG = "#0B1B33";
export const SIDEBAR_HOVER_BG = "#122A47";
export const SIDEBAR_TEXT_MUTED = "#C6CBD3";

export const theme = createTheme({
  palette: {
    primary: { main: "#0E7C86", dark: "#0B6570", light: "#E3F4F5" },
    secondary: { main: "#F59E0B" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#202939", secondary: "#667085" },
    success: { main: "#22C55E" },
    warning: { main: "#F59E0B" },
    error: { main: "#EF4444" },
    info: { main: "#3B82F6" },
    divider: "#E5E7EB",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Inter','Roboto',sans-serif",
    h5: { fontWeight: 600 },
    h6: { fontWeight: 700, color: "#111827" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { border: "1px solid #E5E7EB" },
        elevation: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(15,23,42,.05)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 9 },
      },
    },
  },
});
