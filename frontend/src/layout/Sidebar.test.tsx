import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { it, expect } from "vitest";
import { Sidebar } from "./Sidebar";

it("renders Dashboard and Trips List nav links", () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  );
  expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: /trips list/i })).toHaveAttribute("href", "/trips");
});
