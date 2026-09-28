import { test, expect } from "../support/fixtures";
import { API_PATHS, isRequest } from "../support/network";

test.describe("onboarding · how did you hear about us", () => {
  test.beforeEach(async ({ onboarding }) => {
    await onboarding.goto({ step: "referral" });
    await onboarding.expectStep("referral");
  });

  test("offers all thirteen sources, none selected", async ({ page }) => {
    const tiles = page.locator("button[aria-pressed]");
    await expect(tiles).toHaveCount(13);
    await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(0);
  });

  test("toggles a source and hides the opt-out while something is picked", async ({ page, onboarding }) => {
    const optOut = page.getByRole("button", { name: "Prefer not to say" });
    const youtube = onboarding.tile("YouTube");

    await expect(optOut).toBeVisible();
    await youtube.click();
    await expect(youtube).toHaveAttribute("aria-pressed", "true");
    await expect(optOut).toHaveCount(0);

    await youtube.click();
    await expect(youtube).toHaveAttribute("aria-pressed", "false");
    await expect(optOut).toBeVisible();
  });

  test("saves every selected source and moves to the workspace step", async ({ page, onboarding }) => {
    await onboarding.tile("YouTube").click();
    await onboarding.tile("A community").click();

    const [save] = await Promise.all([
      page.waitForRequest(isRequest("PATCH", API_PATHS.me)),
      onboarding.continueButton.click(),
    ]);

    expect(save.postDataJSON()).toEqual({ referralSources: ["youtube", "community"] });
    await onboarding.expectStep("workspace");
    await onboarding.expectUrlStep("workspace");
  });

  test("prefer not to say moves on without saving", async ({ page, onboarding }) => {
    const saves: string[] = [];
    page.on("request", (req) => isRequest("PATCH", API_PATHS.me)(req) && saves.push(req.url()));

    await page.getByRole("button", { name: "Prefer not to say" }).click();

    await onboarding.expectStep("workspace");
    expect(saves).toHaveLength(0);
  });

  test("a failed save does not block setup", async ({ page, onboarding }) => {
    await page.route("**/api/auth/me", (route) =>
      route.request().method() === "PATCH"
        ? route.fulfill({ status: 500, json: { error: "boom" } })
        : route.fallback(),
    );

    await onboarding.tile("Email").click();
    await onboarding.continueButton.click();

    await onboarding.expectStep("workspace");
  });

  test("back returns to the details step", async ({ onboarding }) => {
    await onboarding.backButton.click();
    await onboarding.expectStep("details");
  });
});
