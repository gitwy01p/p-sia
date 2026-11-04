import { NS_error } from "@x/core/client/error.ts";
import { NS_runtime, set_env_var_db } from "@x/types/env.runtime";
import { redis } from "@x/post-process/cache";
import { NS_crypto_client } from "@x/core/client/crypto.ts";
import { NS_promise } from "@x/core/client/promise.ts";
import { NS_Misc } from "@x/core/client/misc.ts";
import { NS_ff_dl_stream } from "@x/ff-dl/dl-stream";

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

  try {
    const task_payload = payload.task_payload;

    if (!NS_Misc.F_is_record(task_payload)) {
      process.exit(1);
    }

    const data_key = task_payload.data_key;

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

        console.log("_", _, "\n");

        return _;
      } catch (e) {
        return;
      }
    })();

    if (!NS_Misc.F_is_record(metadata)) {
      throw NS_error.F_create_error({
        status: 404,
        message: "Metadata not found"
      });
    }

    const REQ0 = new URL(task_payload.REQ0);

    const [E_, R_] = await NS_promise.F_catch_promise({
      promise: NS_ff_dl_stream.handle_payload({
        data_key,
        metadata: metadata as any,
        REQ0,
        REQ_ORIGIN: REQ0.origin
      })
    });

    console.warn("E_", E_, "\n");
    console.log("R_", R_, "\n");
  } catch (error) {
    console.error(
      "Fatal exception caught during continuous streaming processing loop:",
      error,
      "\n"
    );

    process.exit(1);
  }

  //finally {
  //   process.exit(0);
  // }
}
