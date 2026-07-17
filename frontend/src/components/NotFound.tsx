import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Typography } from "@mui/material";

export interface NotFoundProps {
  title: string;
  message: string;
  linkTo: string;
  linkLabel: string;
}

export function NotFound({ title, message, linkTo, linkLabel }: NotFoundProps) {
  return (
    <Box sx={{ textAlign: "center", color: "text.secondary", py: 6 }}>
      <Typography variant="h6" sx={{ mb: 1, color: "text.primary" }}>
        {title}
      </Typography>
      <Typography sx={{ mb: 1 }}>{message}</Typography>
      <Link component={RouterLink} to={linkTo}>
        {linkLabel}
      </Link>
    </Box>
  );
}
