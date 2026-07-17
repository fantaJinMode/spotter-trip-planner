import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { it, expect } from "vitest";
import { NotFound } from "./NotFound";

it("renders the title, message, and a link to the given path", () => {
  render(
    <MemoryRouter>
      <NotFound
        title="Trip not found"
        message="No trip exists with that id."
        linkTo="/trips"
        linkLabel="Back to trips"
      />
    </MemoryRouter>,
  );

  expect(screen.getByText("Trip not found")).toBeInTheDocument();
  expect(screen.getByText("No trip exists with that id.")).toBeInTheDocument();
  const link = screen.getByRole("link", { name: "Back to trips" });
  expect(link).toHaveAttribute("href", "/trips");
});
