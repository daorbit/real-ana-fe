import { test, expect } from "../support/fixtures";
import { API_PATHS, isRequest, isResponse } from "../support/network";

test.describe("onboarding · workspace", () => {
  test.beforeEach(async ({ onboarding }) => {
    await onboarding.goto({ mode: "workspace" });
    await onboarding.expectStep("workspace");
  });

  for (const [label, value] of [
    ["empty", ""],
    ["whitespace only", "    "],
  ] as const) {
    test(`rejects an ${label} name without calling the API`, async ({ page, onboarding }) => {
      const creates: string[] = [];
      page.on("request", (req) => isRequest("POST", API_PATHS.workspaces)(req) && creates.push(req.url()));

      await onboarding.workspaceName.fill(value);
      await onboarding.continueButton.click();

      await expect(onboarding.workspaceHint).toHaveText("Workspace name is required");
      await expect(onboarding.workspaceName).toHaveAttribute("aria-invalid", "true");
      await onboarding.expectStep("workspace");
      expect(creates).toHaveLength(0);
    });
  }

  test("rejects a name longer than 60 characters", async ({ onboarding }) => {
    await onboarding.workspaceName.fill("x".repeat(61));
    await onboarding.continueButton.click();
    await expect(onboarding.workspaceHint).toHaveText("Workspace name must be 60 characters or fewer");
    await onboarding.expectStep("workspace");
  });

  test("typing clears the error", async ({ onboarding }) => {
    await onboarding.continueButton.click();
    await expect(onboarding.workspaceHint).toHaveText("Workspace name is required");

    await onboarding.workspaceName.fill("A");
    await expect(onboarding.workspaceHint).toHaveText("Usually your company or team. You can rename it later.");
    await expect(onboarding.workspaceName).toHaveAttribute("aria-invalid", "false");
  });

  test("accepts exactly 60 characters and trims surrounding spaces", async ({ api, page, onboarding, workspaceName }) => {
    const name = workspaceName.padEnd(60, "x");
    await onboarding.workspaceName.fill(`  ${name}  `);

    const [request] = await Promise.all([
      page.waitForRequest(isRequest("POST", API_PATHS.workspaces)),
      onboarding.continueButton.click(),
    ]);

    expect(request.postDataJSON()).toEqual({ name });
    await onboarding.expectStep("site");
    await onboarding.expectUrlStep("site");
    expect(await api.workspacesNamed(name)).toHaveLength(1);
  });

  test("enter key submits", async ({ api, page, onboarding, workspaceName }) => {
    await onboarding.workspaceName.fill(workspaceName);
    await Promise.all([
      page.waitForResponse(isResponse("POST", API_PATHS.workspaces)),
      onboarding.workspaceName.press("Enter"),
    ]);
    await onboarding.expectStep("site");
    expect(await api.workspacesNamed(workspaceName)).toHaveLength(1);
  });

  test("special characters survive the round trip", async ({ api, onboarding, workspaceName }) => {
    const name = `${workspaceName} — Ünïcødé & "quotes" <b>`;
    const created = await onboarding.createWorkspace(name);
    expect(created.name).toBe(name);
    expect((await api.workspacesNamed(workspaceName)).map((ws) => ws.name)).toEqual([name]);
  });

  test("a rapid double click creates one workspace", async ({ api, page, onboarding, workspaceName }) => {
    const creates: string[] = [];
    page.on("request", (req) => isRequest("POST", API_PATHS.workspaces)(req) && creates.push(req.url()));

    await onboarding.workspaceName.fill(workspaceName);
    await onboarding.continueButton.dblclick();
    await onboarding.expectStep("site");

    expect(creates).toHaveLength(1);
    expect(await api.workspacesNamed(workspaceName)).toHaveLength(1);
  });

  test("a server error keeps the user on the step and says why", async ({ page, onboarding, workspaceName }) => {
    await page.route("**/api/workspaces", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({ status: 500, json: { error: "Workspace service unavailable" } })
        : route.fallback(),
    );

    await onboarding.workspaceName.fill(workspaceName);
    await onboarding.continueButton.click();

    await expect(page.getByText("Workspace service unavailable")).toBeVisible();
    await onboarding.expectStep("workspace");
    await expect(onboarding.workspaceName).toHaveValue(workspaceName);
    await expect(onboarding.continueButton).toBeEnabled();
  });

  test("the created workspace survives a reload of the next step", async ({ page, onboarding, workspaceName }) => {
    await onboarding.createWorkspace(workspaceName);
    await page.reload();
    await onboarding.expectStep("site");
  });
});
