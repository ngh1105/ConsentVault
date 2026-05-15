import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const siteShellSource = readFileSync(resolve(__dirname, "site-shell.tsx"), "utf8");
const homePageSource = readFileSync(resolve(__dirname, "../app/page.tsx"), "utf8");

describe("Task 1 scaffold shell", () => {
  it("renders primary navigation semantically and keeps demo sidebar content out of the shell", () => {
    expect(siteShellSource).toContain('<nav aria-label="Primary"');
    expect(siteShellSource).toContain("<ul");
    expect(siteShellSource).toContain("<li");
    expect(siteShellSource).not.toContain("Sample disputes loaded");
    expect(siteShellSource).not.toContain("Task 2 will replace");
    expect(homePageSource).toContain("Sample disputes loaded");
  });

  it("keeps unavailable scaffold actions non-navigable until their routes exist", () => {
    expect(siteShellSource).not.toContain('href="/cases/new"');
    expect(siteShellSource).not.toContain('href="/policy"');
    expect(homePageSource).not.toContain('href="/cases/new"');
    expect(homePageSource).not.toContain('href="/policy"');
    expect(siteShellSource).toContain("Available in a later task");
    expect(homePageSource).toContain("Available in a later task");
  });
});
