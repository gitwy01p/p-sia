import { NS_error } from "@x/core/client/error.ts";
import { NS_runtime, set_env_var_db } from "@x/types/env.runtime";
import { redis } from "@x/post-process/cache";
import { NS_crypto_client } from "@x/core/client/crypto.ts";
import { NS_promise } from "@x/core/client/promise.ts";
import { NS_Misc } from "@x/core/client/misc.ts";

run();

async function run() {
  console.log(
    "Initializing application lifecycle and environment configurations...",
    "\n"
  );

  await set_env_var_db();

  console.log(
    `Current Application Environment Context: ${NS_runtime.ENV_VAR_DB?.APP_ENV || process.env.APP_ENV}`,
    `UPSTASH_REDIS_REST_URL: ${process.env.UPSTASH_REDIS_REST_URL}`,
    `UPSTASH_REDIS_REST_TOKEN: ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    `REPO_ORIGIN: ${process.env.REPO_ORIGIN}`,
    "\n"
  );

  const rawPayload = process.env.INPUT_PAYLOAD;

  if (!rawPayload) {
    console.error(
      "Critical Failure: Incoming client trigger payload missing.",
      "\n"
    );
    process.exit(1);
  }

  const payload = JSON.parse(rawPayload);

  console.log({ payload }, "\n");

  try {
    const data_key = payload.data_key;

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

        console.log("_", _, "\n");

        return _;
      } catch (e) {
        console.log("_e", e, "\n");

        return;
      }
    })();

    console.log({ metadata }, "\n");

    if (!metadata) {
      throw NS_error.F_create_error({
        status: 404,
        message: "Metadata not found"
      });
    }
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
