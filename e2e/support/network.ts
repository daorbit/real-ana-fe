import type { Request, Response } from "@playwright/test";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

function matches(method: Method, pathname: RegExp, req: Request): boolean {
  return req.method() === method && pathname.test(new URL(req.url()).pathname);
}

export const API_PATHS = {
  me: /^\/api\/auth\/me$/,
  workspaces: /^\/api\/workspaces$/,
  sites: /^\/api\/workspaces\/[^/]+\/sites$/,
  onboardingCopy: /^\/api\/workspaces\/[^/]+\/onboarding-ai\/copy$/,
};

export function isRequest(method: Method, pathname: RegExp) {
  return (req: Request) => matches(method, pathname, req);
}

export function isResponse(method: Method, pathname: RegExp) {
  return (res: Response) => matches(method, pathname, res.request());
}
