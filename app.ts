import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { NS_Misc } from "@x/core/client/misc.ts";
import { NS_error } from "@x/core/client/error.ts";
import { NS_routes_elysia } from "@x/core/server/routes-elysia.ts";
import { IS_GH, NS_runtime } from "@x/types/env.runtime";
import { ProximaRouter } from "@x/post-process/proxima";
import { dlV1Router } from "../app-render/src/sub-router/showtime";
import { StreamRouter } from "../app-render/src/sub-router/stream";
import { FfmpegV2Router } from "../app-render/src/sub-router/probe";

const PORT = process.env.PORT || 7860;

await NS_runtime.set_env_var_db();

const app = new Elysia()

  .use(
    cors({
      origin: "*",
      allowedHeaders: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
      exposeHeaders: "*"
    })
  )

  .derive((ctx: any) => ({
    publicOrigin: NS_routes_elysia.F_public_origin(ctx)
  }))

  .onRequest(({ request }) => {
    const url = new URL(request.url);

    url.pathname = url.pathname
      .split("/")
      .map((segment) => segment.replace(/\.$/, ""))
      .join("/");

    const params = new URLSearchParams();

    for (const [key, value] of url.searchParams) {
      params.append(key.replace(/\.$/, ""), value.replace(/\.$/, ""));
    }

    url.search = params.toString();

    if (url.href !== request.url) {
      return new Response(null, {
        status: 308,
        headers: {
          Location: url.href
        }
      });
    }
  })

  .onError(async ({ code, error }) => {
    let e_message = "";
    if (code === "VALIDATION") {
      e_message = (error as any).message;
      try {
        e_message = JSON.parse(e_message).summary;
      } catch (err) {}
    }

    const err_d = NS_error.F_collect_error_status_n_message({
      ERR: error
    });

    NS_Misc.console.error({
      ENV: IS_GH() ? "all" : "dev",
      _browser: false,
      _log: ["\n"]
    });
    NS_Misc.console.error({
      ENV: IS_GH() ? "all" : "dev",
      _browser: false,
      _log: [{ code, e_message, ...err_d }, "\n"]
    });

    return new Response(err_d.message, {
      status: err_d.status,
      headers: {
        "x-error-message": JSON.stringify(err_d.message),
        "x-error-status": err_d.status
      }
    });

    const F_get_error_message = (error: unknown): string => {
      if (error instanceof Error) {
        return error.message;
      }

      return String(error);
    };
  })

  .use(dlV1Router)
  .use(FfmpegV2Router)
  .use(StreamRouter)
  .mount("/", ProximaRouter.fetch)

  .get("/", async () => {
    return "🦊 Hello Rafiki 🍿";
  })

  .listen({
    port: PORT,
    idleTimeout: 180
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
