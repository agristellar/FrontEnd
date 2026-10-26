import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { getAddress, getNetwork, requestAccess } from "@stellar/freighter-api";

// requestAccess returns the address approved by the wallet. Reading it again
// through getAddress adds a separate two-second RPC deadline after approval.
export class FreighterAccessModule extends FreighterModule {
  override async runChecks() {
    // Connection probes are read-only. A slow extension response must not cause
    // access or signing prompts to be repeated automatically.
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt === 2) {
        // isConnected has a fixed two-second SDK timeout. Give a slow extension
        // one bounded, read-only warm-up before the final official probe.
        let timeout: ReturnType<typeof setTimeout> | undefined;
        await Promise.race([
          getNetwork().catch(() => null),
          new Promise((resolve) => { timeout = setTimeout(() => resolve(null), 10000); }),
        ]).finally(() => { if (timeout !== undefined) clearTimeout(timeout); });
      }
      if (await this.isAvailable()) return;
      if (attempt < 2)
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
    throw Object.assign(new Error("Freighter connection did not respond"), {
      code: "FREIGHTER_CONNECTION_UNAVAILABLE",
    });
  }
  override async getAddress(params: { skipRequestAccess?: boolean } = {}) {
    await this.runChecks();
    const result = params.skipRequestAccess
      ? await getAddress()
      : await requestAccess();
    if (result.error) throw result.error;
    if (!result.address)
      throw Object.assign(new Error("Freighter returned no authorized address"), {
        code: "FREIGHTER_ADDRESS_UNAVAILABLE",
      });
    return { address: result.address };
  }
}
