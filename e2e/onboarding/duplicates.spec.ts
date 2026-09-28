import { test, expect } from "../support/fixtures";

test.describe("onboarding · going back must not duplicate records", () => {
  test("back to the workspace step and continue again reuses the workspace", async ({
    api,
    onboarding,
    workspaceName,
  }) => {
    await onboarding.goto({ mode: "workspace" });
    await onboarding.createWorkspace(workspaceName);

    await onboarding.backButton.click();
    await onboarding.expectStep("workspace");
    await onboarding.continueButton.click();
    await onboarding.expectStep("site");

    expect(await api.workspacesNamed(workspaceName)).toHaveLength(1);
  });

  test("back to the framework step and continue again reuses the site", async ({
    api,
    onboarding,
    workspaceName,
  }) => {
    await onboarding.goto({ mode: "workspace" });
    const workspace = await onboarding.createWorkspace(workspaceName);
    await onboarding.submitSiteDetails("example.com", "Duplicate check");
    await onboarding.createSite();
    await onboarding.expectStep("install");

    await onboarding.backButton.click();
    await onboarding.expectStep("framework");
    await onboarding.continueButton.click();
    await onboarding.expectStep("install");

    expect(await api.sites(workspace._id)).toHaveLength(1);
  });
});
