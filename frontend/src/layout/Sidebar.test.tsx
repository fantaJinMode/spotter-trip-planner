import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { it, expect } from "vitest";
import { Sidebar } from "./Sidebar";

it("renders Plan Trip and Trip List nav links", () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  );
  expect(screen.getByRole("link", { name: /plan trip/i })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: /trip list/i })).toHaveAttribute("href", "/trips");
});
