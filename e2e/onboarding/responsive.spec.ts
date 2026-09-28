import { test, expect } from "../support/fixtures";

const VIEWPORTS = [
  { name: "phone", size: { width: 390, height: 844 } },
  { name: "tablet", size: { width: 820, height: 1180 } },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`onboarding · ${viewport.name}`, () => {
    test.use({ viewport: viewport.size });

    test("first screen has no back chevron, a skip action and no sideways scroll", async ({ page, onboarding }) => {
      await onboarding.goto({ mode: "workspace" });
      await onboarding.expectStep("workspace");

      await expect(onboarding.rail).toBeHidden();
      await expect(page.getByRole("group", { name: "Step 1 of 6: Workspace" })).toBeVisible();
      await expect(onboarding.backButton).toHaveCount(0);
      await expect(onboarding.barSkip).toBeVisible();
      expect(await onboarding.hasHorizontalOverflow()).toBe(false);
    });

    test("every step fits the width and the primary action is reachable", async ({ page, onboarding, workspaceName }) => {
      await onboarding.goto({ mode: "workspace" });
      await onboarding.createWorkspace(workspaceName);
      expect(await onboarding.hasHorizontalOverflow()).toBe(false);
      await expect(onboarding.continueButton).toBeInViewport();

      await onboarding.submitSiteDetails("example.com", "Responsive site");
      expect(await onboarding.hasHorizontalOverflow()).toBe(false);
      await onboarding.continueButton.scrollIntoViewIfNeeded();
      await expect(onboarding.continueButton).toBeInViewport();

      await onboarding.createSite();
      await onboarding.expectStep("install");
      expect(await onboarding.hasHorizontalOverflow()).toBe(false);

      await onboarding.continueButton.click();
      await onboarding.expectStep("appearance");
      expect(await onboarding.hasHorizontalOverflow()).toBe(false);

      await onboarding.continueButton.click();
      await onboarding.expectStep("billing");
      expect(await onboarding.hasHorizontalOverflow()).toBe(false);
      await expect(page.getByRole("button", { name: "Continue with Free" })).toBeVisible();
    });

    test("header back chevron goes to the previous step", async ({ page, onboarding, workspaceName }) => {
      await onboarding.goto({ mode: "workspace" });
      await onboarding.createWorkspace(workspaceName);

      await expect(onboarding.backButton).toHaveCount(1);
      await onboarding.backButton.click();
      await onboarding.expectStep("workspace");
      await expect(page.getByRole("group", { name: "Step 1 of 6: Workspace" })).toBeVisible();
    });
  });
}
