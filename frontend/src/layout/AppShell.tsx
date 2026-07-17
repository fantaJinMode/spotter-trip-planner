import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Topbar } from "./Topbar";

export interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar title={title} subtitle={subtitle} />
        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 3.5 }, pb: { xs: 9, md: 3.5 } }}>
          {children}
        </Box>
      </Box>
      <BottomNav />
    </Box>
  );
}
