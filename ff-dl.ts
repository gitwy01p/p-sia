import { NS_error } from "@x/core/client/error.ts";
import { NS_runtime, set_env_var_db } from "@x/types/env.runtime";
import { redis } from "@x/post-process/cache";
import { NS_crypto_client } from "@x/core/client/crypto.ts";
import { NS_promise } from "@x/core/client/promise.ts";
import { NS_Misc } from "@x/core/client/misc.ts";
import { dlV1RouterProcessPayload } from "@x/ff-dl/dl";

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
    // process.exit(0);
  }
}

async function handle_process(arg0: { payload: Record<string, any> }) {
  const { payload } = arg0;

  const REQ0 = new URL(payload.REQ0);

  const data_key = REQ0.searchParams.get("data_key") || payload.data_key;

  const metadata = await (async () => {
    try {
      const [E_, R_] = await NS_promise.F_catch_promise({
        promise: (async () => {
          return NS_crypto_client.F_decode_unicode_v1({
            data_str: data_key,
            _is_url_safe: true,
            encoded: "hex"
          });
        })()
      });

      if (NS_Misc.F_is_record(R_)) return R_;

      const _ = await redis()?.get(`${data_key}`);

      return _;
    } catch (e) {
      return;
    }
  })();

  console.log("metadata >>>", metadata);
  console.log(" ");

  if (!NS_Misc.F_is_record(metadata)) {
    throw NS_error.F_create_error({
      status: 404,
      message: "Metadata not found"
    });
  }

  const [E_, R_] = await NS_promise.F_catch_promise({
    promise: dlV1RouterProcessPayload({
      data_key,
      metadata: metadata as any,
      REQ0
    })
  });

  if (E_) {
    throw E_;
  }

  return R_;
}
