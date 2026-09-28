import { expect, type Locator, type Page } from "@playwright/test";
import { API_PATHS, isResponse } from "./network";
import type { SiteRow, WorkspaceRow } from "./api";

export const STEP_TITLES = {
  details: "Tell us who you are",
  referral: "How did you hear about us?",
  workspace: "Name your workspace",
  site: "Add your first site",
  framework: "What's it built with?",
  install: "You're ready",
  appearance: "Make it yours",
  billing: "Pick a plan",
} as const;

export type StepSlug = keyof typeof STEP_TITLES;

export const PROGRESS_KEY = "quantalog_onboarding_progress";
export const SKIPPED_KEY = "quantalog_onboarding_skipped";

export class OnboardingPage {
  readonly heading: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly railSkip: Locator;
  readonly barSkip: Locator;
  readonly rail: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly mobile: Locator;
  readonly workspaceName: Locator;
  readonly workspaceHint: Locator;
  readonly domain: Locator;
  readonly siteName: Locator;
  readonly codeBlock: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole("heading", { level: 1 });
    this.continueButton = page.getByRole("button", { name: "Continue", exact: true });
    this.backButton = page.getByRole("button", { name: "Back", exact: true });
    this.railSkip = page.getByRole("button", { name: "Skip setup for now" });
    this.barSkip = page.getByRole("button", { name: /^Skip( for now)?$/ });
    this.rail = page.getByRole("complementary", { name: "Setup progress" });
    this.firstName = page.getByLabel("First name");
    this.lastName = page.getByLabel("Last name");
    this.mobile = page.getByPlaceholder("98765 43210");
    this.workspaceName = page.getByLabel("Workspace name");
    this.workspaceHint = page.locator("#onb-ws-hint");
    this.domain = page.getByLabel("Domain", { exact: true });
    this.siteName = page.getByLabel("Site name");
    this.codeBlock = page.locator("pre");
  }

  async goto(options: { mode?: "workspace"; step?: StepSlug } = {}) {
    const search = new URLSearchParams();
    if (options.mode) search.set("mode", options.mode);
    if (options.step) search.set("step", options.step);
    const query = search.toString();
    await this.page.goto(`/app/onboarding${query ? `?${query}` : ""}`);
  }

  async expectStep(slug: StepSlug) {
    await expect(this.heading).toHaveText(STEP_TITLES[slug]);
  }

  async expectUrlStep(slug: StepSlug) {
    await expect(this.page).toHaveURL(new RegExp(`[?&]step=${slug}(&|$)`));
  }

  railCurrent(): Locator {
    return this.rail.locator('li[aria-current="step"]');
  }

  tile(name: string): Locator {
    return this.page.getByRole("button", { name, exact: true });
  }

  async createWorkspace(name: string): Promise<WorkspaceRow> {
    await this.workspaceName.fill(name);
    const [response] = await Promise.all([
      this.page.waitForResponse(isResponse("POST", API_PATHS.workspaces)),
      this.continueButton.click(),
    ]);
    expect(response.status()).toBe(201);
    await this.expectStep("site");
    return (await response.json()) as WorkspaceRow;
  }

  async fillSite(domain: string, name: string) {
    await this.domain.fill(domain);
    await this.siteName.fill(name);
  }

  async submitSiteDetails(domain: string, name: string) {
    await this.fillSite(domain, name);
    await this.continueButton.click();
    await this.expectStep("framework");
  }

  async createSite(): Promise<SiteRow> {
    const [response] = await Promise.all([
      this.page.waitForResponse(isResponse("POST", API_PATHS.sites)),
      this.continueButton.click(),
    ]);
    expect(response.status()).toBe(201);
    return (await response.json()) as SiteRow;
  }

  async readProgress(): Promise<string | null> {
    return this.page.evaluate((key) => sessionStorage.getItem(key), PROGRESS_KEY);
  }

  async readLocal(key: string): Promise<string | null> {
    return this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  async hasHorizontalOverflow(): Promise<boolean> {
    return this.page.evaluate(() => {
      const root = document.scrollingElement ?? document.documentElement;
      return root.scrollWidth > root.clientWidth + 1;
    });
  }
}
