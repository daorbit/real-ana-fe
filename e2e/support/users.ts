import { execFileSync, spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import { BACKEND_DIR, USER_DOMAIN, USER_PREFIX } from "./env";

export type TestUser = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type Reply = { id?: number; ok?: boolean; result?: Record<string, unknown>; error?: string; ready?: boolean };

const SCRIPT = ["--import", "tsx", "scripts/e2e-user.ts"];

export class UserFactory {
  private nextId = 0;
  private readonly pending = new Map<number, (reply: Reply) => void>();

  private constructor(private readonly child: ChildProcessWithoutNullStreams) {}

  static start(): Promise<UserFactory> {
    const child = spawn(process.execPath, [...SCRIPT, "serve"], { cwd: BACKEND_DIR });
    const factory = new UserFactory(child);
    const stderr: string[] = [];
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk.toString()));

    return new Promise((resolve, reject) => {
      child.once("exit", (code) => reject(new Error(`user factory exited (${code}): ${stderr.join("")}`)));
      createInterface({ input: child.stdout }).on("line", (line) => {
        if (!line.startsWith("{")) return;
        const reply = JSON.parse(line) as Reply;
        if (reply.ready) return resolve(factory);
        if (reply.id !== undefined) factory.pending.get(reply.id)?.(reply);
      });
    });
  }

  async create(firstName = "Ada", lastName = "Lovelace"): Promise<TestUser> {
    const tag = randomBytes(5).toString("hex");
    const email = `${USER_PREFIX}-${Date.now().toString(36)}-${tag}@${USER_DOMAIN}`;
    const password = `E2e-${tag}-pass1`;
    const created = await this.send("create", [email, password, firstName, lastName]);
    return { id: String(created.id), email, password, firstName, lastName };
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.child.once("exit", () => resolve());
      this.child.stdin.end();
    });
  }

  private send(command: string, args: unknown[]): Promise<Record<string, unknown>> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, (reply) => {
        this.pending.delete(id);
        if (reply.ok) resolve(reply.result ?? {});
        else reject(new Error(reply.error ?? `${command} failed`));
      });
      this.child.stdin.write(`${JSON.stringify({ id, command, args })}\n`);
    });
  }
}

export function purgeUsers(): void {
  execFileSync(process.execPath, [...SCRIPT, "purge"], { cwd: BACKEND_DIR, stdio: "inherit" });
}
