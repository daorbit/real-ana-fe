import { test, expect } from "../support/fixtures";
import { OnboardingPage, PROGRESS_KEY } from "../support/onboarding-page";

test.describe("onboarding routing", () => {
  test.describe("signed out", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("redirects to login", async ({ page }) => {
      await new OnboardingPage(page).goto();
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test("a failed session check does not sign the user out", async ({ page, onboarding }) => {
    let failed = false;
    await page.route("**/api/auth/me", (route) => {
      if (route.request().method() !== "GET" || failed) return route.fallback();
      failed = true;
      return route.fulfill({ status: 503, json: { error: "temporarily unavailable" } });
    });

    await onboarding.goto();
    await page.reload();

    await expect(page).toHaveURL(/\/app\/onboarding/);
    await onboarding.expectStep("details");
  });

  test("a brand-new account is sent to onboarding from the app", async ({ page, onboarding }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/app\/onboarding/);
    await onboarding.expectStep("details");
  });

  for (const path of ["/app/analytics", "/app/seo", "/app/settings"]) {
    test(`deep link ${path} is held until setup is done`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/app\/onboarding/);
    });
  }

  test("an account with details but no workspace is still sent to onboarding", async ({ api, page }) => {
    await api.updateProfile({ mobile: "919876543210" });
    await page.goto("/app");
    await expect(page).toHaveURL(/\/app\/onboarding/);
  });

  test("an account with details and a workspace goes straight to the app", async ({ api, page, workspaceName }) => {
    await api.updateProfile({ mobile: "919876543210" });
    await api.createWorkspace(workspaceName);
    await page.goto("/app");
    await expect(page).toHaveURL(/\/app$/);
  });

  test("without a step the URL is filled in with the first step", async ({ onboarding }) => {
    await onboarding.goto();
    await onboarding.expectUrlStep("details");
    await onboarding.expectStep("details");
  });

  test("the rail lists all eight steps with the first one current", async ({ onboarding }) => {
    await onboarding.goto();
    await expect(onboarding.rail).toContainText("Step 1 of 8");
    await expect(onboarding.rail.getByRole("listitem")).toHaveCount(8);
    await expect(onboarding.railCurrent()).toContainText("Your details");
  });

  test("workspace mode starts at the workspace step with six steps", async ({ onboarding }) => {
    await onboarding.goto({ mode: "workspace" });
    await onboarding.expectUrlStep("workspace");
    await onboarding.expectStep("workspace");
    await expect(onboarding.backButton).toHaveCount(0);
    await expect(onboarding.rail).toContainText("Step 1 of 6");
    await expect(onboarding.rail.getByRole("listitem")).toHaveCount(6);
  });

  test("unknown step slug falls back to the details step", async ({ onboarding }) => {
    await onboarding.goto({ step: "bogus" as never });
    await onboarding.expectStep("details");
  });

  for (const step of ["site", "framework", "install", "appearance", "billing"] as const) {
    test(`deep link to ${step} without a workspace is held at the workspace step`, async ({ onboarding }) => {
      await onboarding.goto({ step });
      await onboarding.expectStep("workspace");
    });
  }

  test("malformed saved progress is ignored", async ({ page, onboarding }) => {
    await onboarding.goto();
    await onboarding.expectStep("details");
    await page.evaluate((key) => sessionStorage.setItem(key, "{not json"), PROGRESS_KEY);
    await onboarding.goto({ step: "install" });
    await onboarding.expectStep("workspace");
  });
});
