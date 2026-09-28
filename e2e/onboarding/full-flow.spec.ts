import { test, expect } from "../support/fixtures";
import { API_PATHS, isRequest } from "../support/network";
import { PROGRESS_KEY, SKIPPED_KEY } from "../support/onboarding-page";

const WELCOME_KEY = "quantalog_welcome_pending";

test.describe("onboarding · first run end to end", () => {
  test("a new user completes every step and lands in the app", async ({
    api,
    page,
    onboarding,
    workspaceName,
  }) => {
    await page.goto("/app");
    await onboarding.expectStep("details");

    await onboarding.mobile.fill("9876543210");
    await onboarding.continueButton.click();
    await onboarding.expectStep("referral");
    await expect(onboarding.railCurrent()).toContainText("About you");

    await onboarding.tile("Search engines").click();
    await onboarding.continueButton.click();
    await onboarding.expectStep("workspace");

    const workspace = await onboarding.createWorkspace(workspaceName);
    await expect(onboarding.railCurrent()).toContainText("Your site");

    await onboarding.submitSiteDetails("https://www.Onboarding-E2E.example.com/pricing?utm=1", "E2E marketing site");
    await onboarding.expectUrlStep("framework");

    const html = onboarding.tile("HTML");
    const next = onboarding.tile("Next.js");
    await expect(html).toHaveAttribute("aria-pressed", "true");
    await next.click();
    await expect(next).toHaveAttribute("aria-pressed", "true");
    await expect(html).toHaveAttribute("aria-pressed", "false");

    const [createRequest] = await Promise.all([
      page.waitForRequest(isRequest("POST", API_PATHS.sites)),
      page.waitForURL(/step=install/),
      onboarding.continueButton.click(),
    ]);
    expect(createRequest.postDataJSON()).toEqual({
      workspaceId: workspace._id,
      name: "E2E marketing site",
      domain: "onboarding-e2e.example.com",
      framework: "nextjs",
      purpose: "",
    });

    const [site] = await api.sites(workspace._id);
    expect(site).toMatchObject({
      name: "E2E marketing site",
      domain: "onboarding-e2e.example.com",
      framework: "nextjs",
    });

    await onboarding.expectStep("install");
    await expect(page.getByText("app/layout.tsx")).toBeVisible();
    await expect(onboarding.codeBlock.first()).toContainText(site.siteId);

    await page.reload();
    await onboarding.expectStep("install");
    await expect(onboarding.codeBlock.first()).toContainText(site.siteId);

    await onboarding.continueButton.click();
    await onboarding.expectStep("appearance");

    await onboarding.continueButton.click();
    await onboarding.expectStep("billing");

    await page.getByRole("button", { name: "Continue with Free" }).click();
    await expect(page).toHaveURL(/\/app$/);

    expect(await onboarding.readProgress()).toBeNull();
    expect(await onboarding.readLocal(SKIPPED_KEY)).toBeNull();

    const me = await api.me();
    expect(me.mobile).toMatch(/9876543210$/);
    expect(me.referralSources).toEqual(["search"]);
    expect((await api.workspaces()).map((ws) => ws.name)).toEqual([workspaceName]);
    expect(await api.sites(workspace._id)).toHaveLength(1);

    await page.reload();
    await expect(page).toHaveURL(/\/app$/);
  });

  test("finishing shows the welcome overlay once", async ({ page, onboarding, workspaceName }) => {
    await page.goto("/app");
    await onboarding.mobile.fill("9876543210");
    await onboarding.continueButton.click();
    await page.getByRole("button", { name: "Prefer not to say" }).click();
    await onboarding.createWorkspace(workspaceName);
    await onboarding.submitSiteDetails("example.com", "Welcome test");
    await onboarding.createSite();
    await onboarding.continueButton.click();
    await onboarding.continueButton.click();

    await page.getByRole("button", { name: "Continue with Free" }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.locator(".welcome-overlay")).toBeVisible();
    expect(await onboarding.readLocal(WELCOME_KEY)).toBeNull();

    await page.reload();
    await expect(page.locator(".welcome-overlay")).toHaveCount(0);
  });

  test("back through the late steps returns to the step before", async ({ onboarding, workspaceName }) => {
    await onboarding.goto({ mode: "workspace" });
    await onboarding.createWorkspace(workspaceName);
    await onboarding.submitSiteDetails("example.com", "Back test");
    await onboarding.createSite();
    await onboarding.expectStep("install");

    await onboarding.continueButton.click();
    await onboarding.expectStep("appearance");
    await onboarding.continueButton.click();
    await onboarding.expectStep("billing");

    await onboarding.backButton.click();
    await onboarding.expectStep("appearance");
    await onboarding.backButton.click();
    await onboarding.expectStep("install");
    await onboarding.backButton.click();
    await onboarding.expectStep("framework");
  });

  test("progress is scoped to the tab session", async ({ page, onboarding, workspaceName }) => {
    await onboarding.goto({ mode: "workspace" });
    await onboarding.createWorkspace(workspaceName);

    const saved = JSON.parse((await onboarding.readProgress()) ?? "{}") as { wsId?: string };
    expect(saved.wsId).toBeTruthy();

    const fresh = await page.context().newPage();
    await fresh.goto("/app/onboarding?mode=workspace&step=site");
    await expect(fresh.getByRole("heading", { level: 1 })).toHaveText("Name your workspace");
    await fresh.close();

    expect(await page.evaluate((key) => sessionStorage.getItem(key), PROGRESS_KEY)).toContain(saved.wsId);
  });
});

test.describe("onboarding · skipping", () => {
  test.beforeEach(async ({ page, onboarding }) => {
    await page.goto("/app");
    await onboarding.mobile.fill("9876543210");
    await onboarding.continueButton.click();
    await onboarding.expectStep("referral");
  });

  test("skipping before a workspace exists lands in the app without one", async ({ api, page, onboarding }) => {
    await onboarding.railSkip.click();

    await expect(page).toHaveURL(/\/app$/);
    expect(await onboarding.readLocal(SKIPPED_KEY)).toBe("1");
    expect(await onboarding.readLocal(WELCOME_KEY)).toBeNull();
    expect(await api.workspaces()).toHaveLength(0);

    await page.reload();
    await expect(page).toHaveURL(/\/app$/);
  });

  test("skipping after the workspace exists keeps it", async ({ api, page, onboarding, workspaceName }) => {
    await page.getByRole("button", { name: "Prefer not to say" }).click();
    await onboarding.createWorkspace(workspaceName);

    await onboarding.railSkip.click();

    await expect(page).toHaveURL(/\/app$/);
    expect(await onboarding.readProgress()).toBeNull();
    expect((await api.workspaces()).map((ws) => ws.name)).toEqual([workspaceName]);
  });

  test("skip is not offered on the last step", async ({ page, onboarding, workspaceName }) => {
    await page.getByRole("button", { name: "Prefer not to say" }).click();
    await onboarding.createWorkspace(workspaceName);
    await onboarding.submitSiteDetails("example.com", "Skip test");
    await onboarding.createSite();
    await onboarding.continueButton.click();
    await onboarding.continueButton.click();
    await onboarding.expectStep("billing");

    await expect.soft(onboarding.railSkip).toHaveCount(0);
  });
});
