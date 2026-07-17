import { describe, it, expect } from "vitest";
import { stopIcon } from "./stopIcons";

describe("stopIcon", () => {
  it("renders a distinct icon for the start stop", () => {
    const icon = stopIcon("start");
    expect(icon.options.html).toContain("#37474f");
    expect(icon.options.html).not.toContain("undefined");
  });
});
