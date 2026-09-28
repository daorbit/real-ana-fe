import { test as base, expect } from "@playwright/test";
import { Api, login } from "./api";
import { OnboardingPage } from "./onboarding-page";
import { UserFactory, type TestUser } from "./users";
import { BASE_URL, TOKEN_KEY } from "./env";

type TestFixtures = {
  user: TestUser;
  token: string;
  api: Api;
  onboarding: OnboardingPage;
  workspaceName: string;
};

type WorkerFixtures = {
  userFactory: UserFactory;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  userFactory: [
    async ({}, use) => {
      const factory = await UserFactory.start();
      await use(factory);
      await factory.stop();
    },
    { scope: "worker", timeout: 60_000 },
  ],

  user: async ({ userFactory }, use) => {
    await use(await userFactory.create());
  },

  token: async ({ user }, use) => {
    await use(await login(user.email, user.password));
  },

  storageState: async ({ token }, use) => {
    await use({
      cookies: [],
      origins: [{ origin: new URL(BASE_URL).origin, localStorage: [{ name: TOKEN_KEY, value: token }] }],
    });
  },

  api: async ({ token }, use) => {
    const api = await Api.create(token);
    await use(api);
    await api.dispose();
  },

  onboarding: async ({ page }, use) => {
    await use(new OnboardingPage(page));
  },

  workspaceName: async ({}, use, testInfo) => {
    await use(`E2E ${testInfo.workerIndex}-${Date.now().toString(36)}`);
  },
});

export { expect };
