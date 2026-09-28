import { test, expect } from "../support/fixtures";
import { API_PATHS, isRequest } from "../support/network";

test.describe("onboarding · your details", () => {
  test.beforeEach(async ({ onboarding }) => {
    await onboarding.goto();
    await onboarding.expectStep("details");
  });

  test("prefills the name from signup and shows the account email", async ({ page, user, onboarding }) => {
    await expect(onboarding.firstName).toHaveValue(user.firstName);
    await expect(onboarding.lastName).toHaveValue(user.lastName);
    await expect(page.getByText(user.email)).toBeVisible();
    await expect(page.getByText(`${user.firstName} ${user.lastName}`, { exact: true })).toBeVisible();
  });

  test("the identity preview follows the name fields", async ({ page, onboarding }) => {
    await onboarding.firstName.fill("Grace");
    await onboarding.lastName.fill("Hopper");
    await expect(page.getByText("Grace Hopper", { exact: true })).toBeVisible();

    await onboarding.firstName.fill("");
    await onboarding.lastName.fill("");
    await expect(page.getByText("Your name", { exact: true })).toBeVisible();
  });

  test("cannot be skipped and has no back action", async ({ onboarding }) => {
    await expect(onboarding.railSkip).toHaveCount(0);
    await expect(onboarding.backButton).toHaveCount(0);
  });

  test("requires a first name and does not save", async ({ page, onboarding }) => {
    const saves: string[] = [];
    page.on("request", (req) => isRequest("PATCH", API_PATHS.me)(req) && saves.push(req.url()));

    await onboarding.firstName.fill("   ");
    await onboarding.mobile.fill("9876543210");
    await onboarding.continueButton.click();

    await expect(page.getByText("Enter your first name")).toBeVisible();
    await onboarding.expectStep("details");
    expect(saves).toHaveLength(0);
  });

  test("clears the first-name error on typing", async ({ page, onboarding }) => {
    await onboarding.firstName.fill("");
    await onboarding.continueButton.click();
    await expect(page.getByText("Enter your first name")).toBeVisible();

    await onboarding.firstName.fill("Ada");
    await expect(page.getByText("Enter your first name")).toHaveCount(0);
  });

  for (const [input, message] of [
    ["", "Enter your mobile number"],
    ["12345", "That number looks too short"],
    ["1234567890123456", "That number looks too long"],
    ["000000", "Enter your mobile number"],
  ] as const) {
    test(`rejects mobile "${input || "(empty)"}"`, async ({ page, onboarding }) => {
      await onboarding.mobile.fill(input);
      await onboarding.continueButton.click();
      await expect(page.getByText(message)).toBeVisible();
      await onboarding.expectStep("details");
    });
  }

  test("mobile field strips anything that is not a digit or space", async ({ onboarding }) => {
    await onboarding.mobile.pressSequentially("98a7-6+5 43");
    await expect(onboarding.mobile).toHaveValue("9876 543");
  });

  test("saves trimmed details and moves to the referral step", async ({ api, page, onboarding }) => {
    await onboarding.firstName.fill("  Grace ");
    await onboarding.lastName.fill(" Hopper  ");
    await onboarding.mobile.fill("09876 543210");

    const [save] = await Promise.all([
      page.waitForRequest(isRequest("PATCH", API_PATHS.me)),
      onboarding.continueButton.click(),
    ]);

    const body = save.postDataJSON() as { firstName: string; lastName: string; mobile: string };
    expect(body.firstName).toBe("Grace");
    expect(body.lastName).toBe("Hopper");
    expect(body.mobile).toMatch(/^\+?\d{1,4}9876543210$/);

    await onboarding.expectStep("referral");
    await onboarding.expectUrlStep("referral");

    const me = await api.me();
    expect(me.firstName).toBe("Grace");
    expect(me.mobile).toMatch(/9876543210$/);
  });

  test("a failed save keeps the user on the step", async ({ page, onboarding }) => {
    await page.route("**/api/auth/me", (route) =>
      route.request().method() === "PATCH"
        ? route.fulfill({ status: 500, json: { error: "Profile service unavailable" } })
        : route.fallback(),
    );

    await onboarding.mobile.fill("9876543210");
    await onboarding.continueButton.click();

    await expect(page.getByText("Profile service unavailable")).toBeVisible();
    await onboarding.expectStep("details");
    await expect(onboarding.continueButton).toBeEnabled();
  });
});
