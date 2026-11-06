import { NS_error } from "@x/core/client/error.ts";
import { NS_runtime, set_env_var_db } from "@x/types/env.runtime";
import { redis } from "@x/post-process/cache";
import { NS_promise } from "@x/core/client/promise.ts";
import { NS_Misc } from "@x/core/client/misc.ts";
import { PptXGenericProcessHandler } from "@x/ppt/routes/generic.ts";
import { NS_routes_c } from "@x/core/client/route.ts";
import { FfmpegV2HandleProcessData } from "../app-render/src/sub-router/probe";
import { NS_scrape_post_processing_helper } from "@x/post-process/helper";

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
    process.exit(1);
  }

  const payload = JSON.parse(rawPayload);

  console.log("PAYLOAD >>>", payload);
  console.log(" ");

  try {
    const task_payload = payload.task_payload;

    if (!NS_Misc.F_is_record(task_payload)) {
      process.exit(1);
    }

    const cache_id = task_payload.cache_id;

    const REQ0 = NS_routes_c.F_is_url(task_payload.REQ0)
      ? new URL(task_payload.REQ0)
      : undefined;

    const body = task_payload.body;
    const portal = task_payload.portal;

    const proxies = await get_dbproxy();

    console.log("proxies", proxies);
    console.log(" ");

    const [E_, R_] = await NS_promise.F_catch_promise({
      promise: PptXGenericProcessHandler({
        payload: body,
        portal,
        REQ_ORIGIN: REQ0?.origin,
        self_host: {
          probe: FfmpegV2HandleProcessData,
          proxies: proxies
        }
      })
    });

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

    const [E__, R__] = await NS_promise.F_catch_promise({
      promise: (async () => {
        if (!cache_id) return;

        if (!R_) return;

        // 1 * 60 = 60 seconds
        const ONE_MIN_IN_SECONDS = 60;

        await redis()?.set(cache_id, R_, {
          ex: ONE_MIN_IN_SECONDS
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

async function get_dbproxy() {
  // workerd
  const workerd = await NS_scrape_post_processing_helper.get_cloudflare_proxy(
    {}
  );

  if (!workerd?.available) {
    throw new Error("dbp workerd not available");
  }

  // workerv
  let workerv = await NS_scrape_post_processing_helper.get_alwaysdata_proxy({});

  if (!workerv?.available) {
    workerv = workerd;
  }

  // workereo
  let workereo = await NS_scrape_post_processing_helper.get_edgeone_proxy({});

  if (!workereo?.available) {
    workereo = workerd;
  }

  // serverful
  const workersf = await NS_scrape_post_processing_helper.get_serverful_proxy(
    {}
  );

  if (!workersf?.available && !workersf?.fallback) {
    throw new Error("dbp serverful not available");
  }

  const is_fallback = true;

  return {
    workerd: new URL(workerd.available),
    workerv: new URL(workerv.available),
    workereo: new URL(workereo.available),
    workersf: {
      _: new URL(workersf.available || workersf.fallback),
      is_fallback
    }
  };
}
