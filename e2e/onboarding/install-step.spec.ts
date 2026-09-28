import { test, expect } from "../support/fixtures";
import { API_PATHS, isRequest } from "../support/network";

test.describe("onboarding · install snippet", () => {
  test.beforeEach(async ({ onboarding, workspaceName }) => {
    await onboarding.goto({ mode: "workspace" });
    await onboarding.createWorkspace(workspaceName);
  });

  test("no purpose means no AI copy request and the static headline", async ({ page, onboarding }) => {
    const aiCalls: string[] = [];
    page.on("request", (req) => isRequest("POST", API_PATHS.onboardingCopy)(req) && aiCalls.push(req.url()));

    await onboarding.submitSiteDetails("example.com", "Static copy");
    await onboarding.createSite();

    await onboarding.expectStep("install");
    expect(aiCalls).toHaveLength(0);
  });

  test("a purpose swaps in the AI headline and description", async ({ page, onboarding }) => {
    await page.route("**/onboarding-ai/copy", (route) =>
      route.fulfill({
        status: 200,
        json: { readyHeadline: "Your blog is almost live", readyDescription: "Paste this into your blog's head." },
      }),
    );

    await onboarding.fillSite("example.com", "AI copy");
    await onboarding.tile("Blog").click();
    await onboarding.continueButton.click();
    await onboarding.expectStep("framework");

    const [, aiRequest] = await Promise.all([
      onboarding.createSite(),
      page.waitForRequest(isRequest("POST", API_PATHS.onboardingCopy)),
    ]);

    expect(aiRequest.postDataJSON()).toMatchObject({ purpose: "Blog", siteName: "AI copy", domain: "example.com" });
    await expect(onboarding.heading).toHaveText("Your blog is almost live");
    await expect(page.getByText("Paste this into your blog's head.")).toBeVisible();
  });

  test("a failed AI request falls back to the static copy", async ({ page, onboarding }) => {
    await page.route("**/onboarding-ai/copy", (route) =>
      route.fulfill({ status: 503, json: { error: "onboarding copy is not configured" } }),
    );

    await onboarding.fillSite("example.com", "AI fallback");
    await onboarding.tile("SaaS product").click();
    await onboarding.continueButton.click();
    await onboarding.createSite();

    await onboarding.expectStep("install");
    await expect(page.getByText("onboarding copy is not configured")).toHaveCount(0);
  });

  test("a failed site create keeps the user on the framework step", async ({ page, onboarding }) => {
    await page.route("**/api/workspaces/*/sites", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({ status: 500, json: { error: "Site service unavailable" } })
        : route.fallback(),
    );

    await onboarding.submitSiteDetails("example.com", "Failing site");
    await onboarding.continueButton.click();

    await expect(page.getByText("Site service unavailable")).toBeVisible();
    await onboarding.expectStep("framework");
  });

  for (const [framework, filename] of [
    ["HTML", "index.html"],
    ["React", "App.tsx"],
    ["WordPress", "header.php"],
  ] as const) {
    test(`${framework} shows its own install file`, async ({ page, onboarding }) => {
      await onboarding.submitSiteDetails("example.com", `${framework} site`);
      await onboarding.tile(framework).click();
      const site = await onboarding.createSite();

      await onboarding.expectStep("install");
      await expect(page.getByText(filename, { exact: true })).toBeVisible();
      await expect(onboarding.codeBlock.first()).toContainText(site.siteId);
    });
  }
});
