import { NS_error } from "@x/core/client/error.ts";
import { NS_runtime, set_env_var_db } from "@x/types/env.runtime";
import { redis } from "@x/post-process/cache";
import { NS_promise } from "@x/core/client/promise.ts";
import { NS_Misc } from "@x/core/client/misc.ts";
import { FfmpegV2HandleProcessData } from "../app-render/src/sub-router/probe";
import { NS_routes_c } from "@x/core/client/route.ts";

run();

async function run() {
  console.log(
    "Initializing application lifecycle and environment configurations...",
    "\n"
  );

  await set_env_var_db();

  const rawPayload = process.env.INPUT_PAYLOAD;

  if (!rawPayload) {
    console.error(
      "Critical Failure: Incoming client trigger payload missing.",
      "\n"
    );
    process.exit(1);
  }

  const payload = JSON.parse(rawPayload);

  console.log("PAYLOAD >>>", payload, "\n");

  try {
    const task_payload = payload.task_payload;

    if (!NS_Misc.F_is_record(task_payload)) {
      process.exit(1);
    }

    const cache_id = task_payload.cache_id;

    const REQ0 = NS_routes_c.F_is_url(task_payload.REQ0)
      ? new URL(task_payload.REQ0)
      : undefined;

    const playback = task_payload.playback;
    const live = task_payload.live;

    const timeout =
      typeof task_payload.timeout === "number" ? task_payload.timeout : 30_000;

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
      console.error(E_, "\n");
      throw E_;
    }

    console.log(R_, "\n");

    // store the data in Redis
    const [E__, R__] = await NS_promise.F_catch_promise({
      promise: (async () => {
        if (!cache_id) return;

        if (!R_) return;

        // 5 * 60 = 300 seconds
        const FIVE_MINS_IN_SECONDS = 300;

        await redis()?.set(cache_id, R_, {
          ex: FIVE_MINS_IN_SECONDS
        });
      })()
    });
  } catch (error) {
    console.error(
      "Fatal exception caught during continuous streaming processing loop:",
      error,
      "\n"
    );

    process.exit(1);
  } finally {
    process.exit(0);
  }
}
