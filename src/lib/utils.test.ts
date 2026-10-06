import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("lets a typography utility replace a Tailwind font size and line height", () => {
    expect(cn("text-sm leading-normal text-muted-foreground", "type-body")).toBe(
      "text-muted-foreground type-body",
    );
  });

  it("keeps unrelated classes", () => {
    expect(cn("type-h2", "text-white", "mt-4")).toBe("type-h2 text-white mt-4");
  });
});
