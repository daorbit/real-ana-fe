import { request, type APIRequestContext, type APIResponse } from "@playwright/test";
import { API_URL } from "./env";

export type WorkspaceRow = { _id: string; name: string };

export type SiteRow = {
  _id: string;
  siteId: string;
  name: string;
  domain: string;
  framework: string;
  purpose: string;
};

export type Me = {
  email: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  referralSources?: string[];
};

async function json<T>(res: APIResponse): Promise<T> {
  if (!res.ok()) throw new Error(`${res.url()} → ${res.status()} ${await res.text()}`);
  return (await res.json()) as T;
}

export async function login(email: string, password: string): Promise<string> {
  const ctx = await request.newContext({ baseURL: API_URL });
  try {
    const body = await json<{ token: string }>(
      await ctx.post("/api/auth/login", { data: { email, password } }),
    );
    return body.token;
  } finally {
    await ctx.dispose();
  }
}

export class Api {
  private constructor(private readonly ctx: APIRequestContext) {}

  static async create(token: string): Promise<Api> {
    const ctx = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    return new Api(ctx);
  }

  async me(): Promise<Me> {
    return json<Me>(await this.ctx.get("/api/auth/me"));
  }

  async workspaces(): Promise<WorkspaceRow[]> {
    return json<WorkspaceRow[]>(await this.ctx.get("/api/workspaces"));
  }

  async workspacesNamed(prefix: string): Promise<WorkspaceRow[]> {
    return (await this.workspaces()).filter((ws) => ws.name.startsWith(prefix));
  }

  async sites(workspaceId: string): Promise<SiteRow[]> {
    return json<SiteRow[]>(await this.ctx.get(`/api/workspaces/${workspaceId}/sites`));
  }

  async createWorkspace(name: string): Promise<WorkspaceRow> {
    return json<WorkspaceRow>(await this.ctx.post("/api/workspaces", { data: { name } }));
  }

  async updateProfile(patch: Partial<Me>): Promise<Me> {
    return json<Me>(await this.ctx.patch("/api/auth/me", { data: patch }));
  }

  dispose(): Promise<void> {
    return this.ctx.dispose();
  }
}
