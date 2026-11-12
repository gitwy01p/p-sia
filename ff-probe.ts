import { type Context, Elysia, t } from "elysia";
import { NS_error } from "@x/core/client/error.ts";
import { NS_runtime, set_env_var_db } from "@x/types/env.runtime";
import { redis } from "@x/post-process/cache";
import { NS_promise } from "@x/core/client/promise.ts";
import { NS_Misc } from "@x/core/client/misc.ts";
import { FfmpegV2HandleProcessData } from "@x/ff-dl/probe";
import { NS_routes_c } from "@x/core/client/route.ts";

run();

async function run() {
  console.log(
    "Initializing application lifecycle and environment configurations..."
  );
  console.log(" ");

  await set_env_var_db();

  const rawPayload = process.env.INPUT_PAYLOAD;

  if (!rawPayload) {
    console.error("Critical Failure: Incoming client trigger payload missing.");
    console.log(" ");

    process.exit(1);
  }

  const payload = JSON.parse(rawPayload);

  console.log("PAYLOAD >>>", payload);
  console.log(" ");

  const task_payload = payload.task_payload;

  if (!NS_Misc.F_is_record(task_payload)) {
    process.exit(1);
  }

  const [E_, R_] = await NS_promise.F_catch_promise({
    promise: handle_process({ payload: task_payload })
  });

  try {
    const cache_id = task_payload.cache_id;

    if (E_) {
      console.error("E_", E_);
      console.log(" ");

      const { message } = NS_error.F_collect_error_message({ ERR: E_ });

      const [E__, R__] = await NS_promise.F_catch_promise({
        promise: (async () => {
          if (!cache_id) return;

          // 1 * 60 = 60 seconds
          const ONE_MIN_IN_SECONDS = 60;

          await redis()?.set(
            cache_id,
            {
              error: message
            },
            {
              ex: ONE_MIN_IN_SECONDS
            }
          );
        })()
      });

      throw E_;
    }

    console.log("R_", R_);
    console.log(" ");

    // store the data in Redis
    const [E__, R__] = await NS_promise.F_catch_promise({
      promise: (async () => {
        if (!cache_id) return;

        if (!R_) return;

        // 1 * 60 = 60 seconds
        const ONE_MIN_IN_SECONDS = 60;

        await redis()?.set(
          cache_id,
          { data: R_ },
          {
            ex: ONE_MIN_IN_SECONDS
          }
        );
      })()
    });
  } catch (error) {
    console.error(
      "Fatal exception caught during continuous streaming processing loop:",
      error
    );
    console.log(" ");

    process.exit(1);
  } finally {
    process.exit(0);
  }
}

async function handle_process(arg0: { payload: Record<string, any> }) {
  const { payload } = arg0;

  const REQ0 = NS_routes_c.F_is_url(payload.REQ0)
    ? new URL(payload.REQ0)
    : undefined;

  const playback = payload.playback;
  const live = payload.live;

  const timeout =
    typeof payload.timeout === "number" ? payload.timeout : 30_000;

  if (!NS_Misc.isValidUrlFormat(playback.url)) {
    if (playback.protocol !== "local") {
      throw NS_error.F_create_error({
        status: 400,
        message: "invalid playback URL"
      });
    }
  }

  if (
    live?.progress_update_endpoint &&
    !NS_Misc.isValidUrlFormat(live.progress_update_endpoint)
  ) {
    throw NS_error.F_create_error({
      status: 400,
      message: "invalid progress update URL"
    });
  }

  const [E_, R_] = await NS_promise.F_catch_promise({
    promise: FfmpegV2HandleProcessData({ playback, live, timeout, REQ0 })
  });

  if (E_) {
    throw E_;
  }

  return R_;
}
