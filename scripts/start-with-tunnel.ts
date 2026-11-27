import { spawn, type ChildProcess } from "node:child_process";
import { Redis } from "@upstash/redis";

const PORT = process.env.PORT || "7860";
const REDIS_KEY = process.env.TUNNEL_REDIS_KEY || "gh:temp-server:url";
const REDIS_TTL_SECONDS = Number(process.env.TUNNEL_REDIS_TTL || 60 * 70); // ~70 min

// (?!api\.) so cloudflared's own API endpoint (https://api.trycloudflare.com,
// which shows up in its error logs) is never mistaken for the tunnel URL.
const TUNNEL_URL_RE = /https:\/\/(?!api\.)[-a-z0-9]+\.trycloudflare\.com/;

let tunnel: ChildProcess | undefined;
let app: ChildProcess | undefined;
let redis: Redis | undefined;
let shuttingDown = false;

function waitForTunnelUrl(
  proc: ChildProcess,
  timeoutMs = 30_000
): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const onData = (chunk: Buffer) => {
      const text = chunk.toString();
      process.stdout.write(text); // still show cloudflared logs

      if (settled) return;

      buffer += text;

      const match = buffer.match(TUNNEL_URL_RE);
      if (match) finish(() => resolve(match[0]));
    };

    proc.stdout?.on("data", onData);
    proc.stderr?.on("data", onData);

    proc.on("exit", (code) => {
      finish(() =>
        reject(new Error(`cloudflared exited early with code ${code}`))
      );
    });

    // safety timeout
    const timer = setTimeout(() => {
      finish(() => reject(new Error("Timed out waiting for cloudflared URL")));
    }, timeoutMs);
  });
}

// Any HTTP response (even a 404) means the app is listening.
async function waitForApp(proc: ChildProcess, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (proc.exitCode !== null || proc.signalCode !== null) {
      throw new Error(
        `App exited early (code ${proc.exitCode}, signal ${proc.signalCode})`
      );
    }

    try {
      await fetch(`http://127.0.0.1:${PORT}/`, {
        signal: AbortSignal.timeout(2_000)
      });
      return;
    } catch {
      // not up yet
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error(
    `App did not respond on port ${PORT} within ${timeoutMs / 1000}s`
  );
}

async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  try {
    tunnel?.kill();
    app?.kill();
  } catch {}

  // Don't leave a dead URL in Redis until the TTL runs out.
  if (redis) {
    try {
      await Promise.race([
        redis.del(REDIS_KEY),
        new Promise((r) => setTimeout(r, 3_000))
      ]);
    } catch {}
  }

  process.exit(code);
}

async function main() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN"
    );
  }

  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });

  process.on("SIGINT", () => void shutdown(0));
  process.on("SIGTERM", () => void shutdown(0));

  console.log("Starting cloudflared tunnel...");

  tunnel = spawn(
    "cloudflared",
    ["tunnel", "--url", `http://127.0.0.1:${PORT}`],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  tunnel.on("exit", (code) => {
    console.error("cloudflared exited");
    void shutdown(code ?? 1);
  });

  const publicUrl = await waitForTunnelUrl(tunnel);

  console.log("\n==============================================");
  console.log("PUBLIC URL:", publicUrl);
  console.log("==============================================\n");

  // The app needs the tunnel URL at startup, so it starts after the tunnel.
  console.log("Starting Elysia app...");

  app = spawn("bun", ["run", "start:server"], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      IS_GH: "1",
      PORT,
      PUBLIC_TUNNEL_URL: publicUrl,
      PUBLIC_URL: publicUrl
    }
  });

  app.on("exit", (code) => {
    console.log("Elysia app exited");
    void shutdown(code ?? 0);
  });

  // Only publish the URL once the app answers, so nobody gets a 502 from a
  // tunnel that points at a server that is not listening yet.
  await waitForApp(app);

  await redis.set(REDIS_KEY, publicUrl, { ex: REDIS_TTL_SECONDS });
  console.log(
    `Saved URL to Redis key "${REDIS_KEY}" (TTL ${REDIS_TTL_SECONDS}s)`
  );

  // The workflow waits for this exact line.
  console.log("SERVER READY");
}

main().catch(async (err) => {
  console.error(err);
  await shutdown(1);
});
