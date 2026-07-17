import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<SvgIconProps>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: DashboardRoundedIcon },
  { label: "Trips List", to: "/trips", icon: ListAltRoundedIcon },
];
