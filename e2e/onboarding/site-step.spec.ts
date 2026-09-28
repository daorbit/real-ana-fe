import { test, expect } from "../support/fixtures";
import { API_PATHS, isRequest } from "../support/network";

test.describe("onboarding · your site", () => {
  test.beforeEach(async ({ onboarding, workspaceName }) => {
    await onboarding.goto({ mode: "workspace" });
    await onboarding.createWorkspace(workspaceName);
  });

  test("requires a domain and a site name", async ({ page, onboarding }) => {
    await onboarding.continueButton.click();
    await expect(page.getByText("Domain is required")).toBeVisible();
    await expect(page.getByText("Site name is required")).toBeVisible();
    await expect(onboarding.domain).toHaveAttribute("aria-invalid", "true");
    await onboarding.expectStep("site");
  });

  for (const [domain, message] of [
    ["my site.com", "A domain cannot contain spaces"],
    ["notadomain", "Enter a domain like example.com"],
    ["-bad-.com", "Enter a domain like example.com"],
    ["exa_mple.com", "Enter a domain like example.com"],
  ] as const) {
    test(`rejects domain "${domain}"`, async ({ page, onboarding }) => {
      await onboarding.fillSite(domain, "Marketing site");
      await onboarding.continueButton.click();
      await expect(page.getByText(message)).toBeVisible();
      await onboarding.expectStep("site");
    });
  }

  for (const domain of ["localhost", "192.168.1.10", "https://www.Example.com/pricing?utm=1"]) {
    test(`accepts domain "${domain}"`, async ({ onboarding }) => {
      await onboarding.submitSiteDetails(domain, "Marketing site");
    });
  }

  test("rejects a site name longer than 60 characters", async ({ page, onboarding }) => {
    await onboarding.fillSite("example.com", "s".repeat(61));
    await onboarding.continueButton.click();
    await expect(page.getByText("Site name must be 60 characters or fewer")).toBeVisible();
  });

  test("editing a field clears only its own error", async ({ page, onboarding }) => {
    await onboarding.continueButton.click();
    await onboarding.domain.fill("example.com");
    await expect(page.getByText("Domain is required")).toHaveCount(0);
    await expect(page.getByText("Site name is required")).toBeVisible();
  });

  test("purpose is optional and single-select", async ({ onboarding }) => {
    const blog = onboarding.tile("Blog");
    const saas = onboarding.tile("SaaS product");

    await blog.click();
    await expect(blog).toHaveAttribute("aria-pressed", "true");

    await saas.click();
    await expect(saas).toHaveAttribute("aria-pressed", "true");
    await expect(blog).toHaveAttribute("aria-pressed", "false");

    await saas.click();
    await expect(saas).toHaveAttribute("aria-pressed", "false");
  });

  test("site details do not hit the API until the framework is chosen", async ({ page, onboarding }) => {
    const creates: string[] = [];
    page.on("request", (req) => isRequest("POST", API_PATHS.sites)(req) && creates.push(req.url()));

    await onboarding.submitSiteDetails("example.com", "Marketing site");
    expect(creates).toHaveLength(0);
  });

  test("back keeps what was typed", async ({ onboarding }) => {
    await onboarding.submitSiteDetails("example.com", "Marketing site");
    await onboarding.backButton.click();
    await onboarding.expectStep("site");
    await expect(onboarding.domain).toHaveValue("example.com");
    await expect(onboarding.siteName).toHaveValue("Marketing site");
  });
});
