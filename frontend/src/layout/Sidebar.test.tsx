// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { it, expect } from "vitest";
import { Sidebar } from "./Sidebar";

it("renders New Trip and Trip List nav links", () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  );
  expect(screen.getByRole("link", { name: /new trip/i })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: /trip list/i })).toHaveAttribute("href", "/trips");
});
