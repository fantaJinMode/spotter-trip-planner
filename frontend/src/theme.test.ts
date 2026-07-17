import { it, expect } from "vitest";
import { theme } from "./theme";

it("uses the design system's teal primary and light card background", () => {
  expect(theme.palette.primary.main).toBe("#0E7C86");
  expect(theme.palette.background.default).toBe("#F8FAFC");
});
