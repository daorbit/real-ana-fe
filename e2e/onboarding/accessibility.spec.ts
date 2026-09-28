import { test, expect } from "../support/fixtures";

test.describe("onboarding · accessibility smoke", () => {
  test("details step fields have accessible names", async ({ page, onboarding }) => {
    await onboarding.goto({ step: "details" });
    await onboarding.expectStep("details");

    await expect(onboarding.firstName).toBeVisible();
    await expect(onboarding.lastName).toBeVisible();
    await expect.soft(page.getByRole("textbox", { name: /mobile|phone/i })).toHaveCount(1);
    await expect.soft(page.getByRole("button", { name: /Country code/ })).toHaveCount(1);
  });

  test("workspace step is fully keyboard operable", async ({ api, page, onboarding, workspaceName }) => {
    await onboarding.goto({ mode: "workspace" });
    await onboarding.expectStep("workspace");

    await onboarding.workspaceName.focus();
    await page.keyboard.type(workspaceName);
    await page.keyboard.press("Enter");

    await onboarding.expectStep("site");
    await expect.soft(onboarding.domain).toBeFocused();
    expect(await api.workspacesNamed(workspaceName)).toHaveLength(1);
  });

  test("selection tiles expose their pressed state", async ({ page, onboarding }) => {
    await onboarding.goto({ step: "referral" });
    const tiles = page.locator("button[aria-pressed]");
    await expect(tiles).toHaveCount(13);
    for (const tile of await tiles.all()) {
      await expect.soft(tile).toHaveAccessibleName(/\S/);
    }
  });

  test("the rail marks the current step for assistive tech", async ({ onboarding }) => {
    await onboarding.goto({ mode: "workspace" });
    await expect(onboarding.railCurrent()).toHaveCount(1);
    await expect(onboarding.railCurrent()).toContainText("Workspace");
  });

  test("validation errors are announced on the invalid field", async ({ onboarding, workspaceName }) => {
    await onboarding.goto({ mode: "workspace" });
    await onboarding.createWorkspace(workspaceName);
    await onboarding.continueButton.click();

    await expect(onboarding.domain).toHaveAttribute("aria-invalid", "true");
    await expect.soft(onboarding.domain).toHaveAccessibleDescription(/Domain is required/);
    await expect(onboarding.siteName).toHaveAttribute("aria-invalid", "true");
    await expect(onboarding.siteName).toHaveAccessibleDescription(/Site name is required/);
  });
});
