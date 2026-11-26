import { NS_error } from "@x/core/client/error.ts";
import { NS_runtime, set_env_var_db } from "@x/types/env.runtime";
import { redis } from "@x/post-process/cache";
import { NS_crypto_client } from "@x/core/client/crypto.ts";
import { NS_promise } from "@x/core/client/promise.ts";
import { NS_Misc } from "@x/core/client/misc.ts";
import { NS_ff_dl_stream } from "@x/ff-dl/dl-stream";
import { relay_s2s_progress_info } from "@x/ff-dl/transcode-job";

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

    await (async () => {
      const data_key = task_payload.data_key;

      const metadata: any = await F_get_metadata({ payload: task_payload });

      const job_id = task_payload.job_id;

      if (!metadata || metadata.s2s_progress || !job_id) return;

      const s2s_progress = metadata.s2s_progress;

      relay_s2s_progress_info({
        endpoint: s2s_progress ? new URL(s2s_progress) : undefined,
        progress_data: {
          job_id,
          status: "failed",
          data_key: metadata.og_data_key || data_key,
          info: {
            status: "failed"
          }
        }
      });
    })();

    process.exit(1);
  } finally {
    // process.exit(0);
  }
}

async function F_get_metadata(arg0: { payload: Record<string, any> }) {
  const { payload } = arg0;

  const REQ0 = new URL(payload.REQ0);

  const data_key = payload.data_key;
  const e_data_key = REQ0.searchParams.get("edk");

  try {
    if (e_data_key) {
      const [E_, R_] = await NS_promise.F_catch_promise({
        promise: (async () => {
          return NS_crypto_client.F_decode_unicode_v1({
            data_str: e_data_key,
            _is_url_safe: true,
            encoded: "base64"
          });
        })()
      });

      if (NS_Misc.F_is_record(R_)) return R_;
    }

    const _ = await redis()?.get(`${data_key}`);

    return _;
  } catch (e) {
    return;
  }
}

async function handle_process(arg0: { payload: Record<string, any> }) {
  const { payload } = arg0;

  const REQ0 = new URL(payload.REQ0);

  const data_key = payload.data_key;
  const e_data_key = REQ0.searchParams.get("edk");

  const metadata: any = await F_get_metadata({ payload });

  console.log("metadata >>>", metadata);
  console.log(" ");

  const s2s_progress = payload.s2s_progress || metadata.s2s_progress;

  if (s2s_progress) {
    metadata.s2s_progress = s2s_progress;
  }

  console.log("s2s_progress >>>", s2s_progress);
  console.log(" ");

  if (!NS_Misc.F_is_record(metadata)) {
    throw NS_error.F_create_error({
      status: 404,
      message: "Metadata not found"
    });
  }

  console.log("metadata >>>", metadata);
  console.log(" ");

  const [E_, R_] = await NS_promise.F_catch_promise({
    promise: NS_ff_dl_stream.handle_payload({
      data_key,
      e_data_key,
      metadata: metadata as any,
      REQ0,
      REQ_ORIGIN: REQ0.origin
    })
  });

  if (E_) {
    throw E_;
  }

  return R_;
}
