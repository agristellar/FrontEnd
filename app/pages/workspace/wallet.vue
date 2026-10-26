<template>
  <div class="space-y-6">
    <div class="flex flex-wrap justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ ui("Ví & MoneyGram") }}</h1>
        <p class="text-slate-500 mt-2">
          {{ ui("Tiền mặt → USDC trên Stellar → đặt cọc hợp đồng") }}
        </p>
      </div>
      <button
        :disabled="busy"
        class="bg-emerald-700 text-white px-5 py-2.5 rounded-lg"
        @click="run(connectWallet)"
      >
        {{
          wallet?.connected ? ui("Kết nối lại ví") : ui("Kết nối ví Stellar")
        }}
      </button>
    </div>
    <p
      v-if="notice"
      role="status"
      class="p-4 border border-amber-200 bg-amber-50 rounded-xl"
    >
      {{ notice }}
    </p>
    <div class="grid lg:grid-cols-3 gap-5">
      <section class="bg-white border rounded-xl p-6 lg:col-span-2">
        <h2 class="font-semibold">{{ ui("Ví đã xác minh") }}</h2>
        <p class="break-all text-sm text-slate-600 mt-3">
          {{ wallet?.wallet?.address || ui("Chưa kết nối") }}
        </p>
        <p class="text-xs text-slate-500 mt-2">
          {{ ui("Mạng") }} {{ configuration?.network || "…" }}
        </p>
        <div class="flex gap-8 mt-6">
          <div v-for="b in balances" :key="b.asset">
            <p class="text-xs text-slate-500">{{ b.asset }}</p>
            <p class="text-2xl font-semibold mt-1">{{ b.balance }}</p>
          </div>
        </div>
        <p
          v-if="wallet?.requiresActivation"
          class="text-sm text-amber-700 mt-4"
        >
          {{
            ui(
              "Ví cần được kích hoạt trên Stellar. Với testnet, sử dụng Friendbot; cần trustline USDC để nhận tiền.",
            )
          }}
        </p>
      </section>
      <section class="bg-emerald-900 text-white rounded-xl p-6">
        <h2 class="font-semibold">MoneyGram Ramps</h2>
        <p class="text-sm text-emerald-100 leading-6 mt-3">
          {{
            ui(
              "Nạp hoặc nhận tiền mặt qua điểm giao dịch được hỗ trợ. MoneyGram xử lý KYC và báo giá; ví của bạn giữ USDC.",
            )
          }}
        </p>
        <p class="text-xs mt-4">
          {{ configuration?.moneygram?.environment }} ·
          {{
            configuration?.moneygram?.configured
              ? ui("Đã cấu hình")
              : ui("Chưa có API key")
          }}
        </p>
      </section>
    </div>
    <section class="bg-white border rounded-xl p-6">
      <h2 class="font-semibold mb-3">{{ ui("Nạp và rút tiền mặt") }}</h2>
      <p
        v-if="!configuration?.moneygram?.configured"
        class="text-sm text-slate-600 mb-4"
      >
        {{
          ui(
            "Sandbox chưa được cấu hình. Đội dự án cần đăng ký partner MoneyGram, lấy sandbox key và cho phép origin của ứng dụng.",
          )
        }}
        <a
          href="https://xramps.moneygram.com/ops/developer/getting-started"
          target="_blank"
          rel="noopener noreferrer"
          class="text-emerald-700 underline"
          >{{ ui("Hướng dẫn đăng ký") }}</a
        >
      </p>
      <div class="flex flex-wrap gap-3">
        <button
          :disabled="
            busy || !wallet?.connected || !configuration?.moneygram?.configured
          "
          class="bg-emerald-700 text-white px-4 py-2 rounded-lg disabled:opacity-40"
          @click="run(() => openMoneygram('cash-in'))"
        >
          {{ ui("Nạp tiền mặt thành USDC") }}</button
        ><button
          :disabled="
            busy || !wallet?.connected || !configuration?.moneygram?.configured
          "
          class="border px-4 py-2 rounded-lg disabled:opacity-40"
          @click="run(() => openMoneygram('cash-out'))"
        >
          {{ ui("Rút USDC thành tiền mặt") }}
        </button>
      </div>
      <p class="text-xs text-slate-500 mt-4">
        {{
          ui(
            "XLM được nạp trực tiếp qua ví hoặc escrow. MoneyGram trong luồng này sử dụng USDC.",
          )
        }}
      </p>
    </section>
    <section v-if="session" class="bg-white border rounded-xl overflow-hidden">
      <div class="p-4 flex justify-between border-b">
        <h2 class="font-semibold">
          {{
            session.flow === "cash-in"
              ? ui("Nạp tiền MoneyGram")
              : ui("Rút tiền MoneyGram")
          }}
        </h2>
        <button class="text-sm underline" @click="session = null">
          {{ ui("Đóng") }}
        </button>
      </div>
      <iframe
        ref="frame"
        :src="session.widgetUrl"
        title="MoneyGram Ramps"
        class="w-full h-[720px]"
        allow="camera"
        referrerpolicy="strict-origin-when-cross-origin"
      />
    </section>
    <section
      v-if="cashoutRequest"
      class="bg-white border border-emerald-400 rounded-xl p-6"
    >
      <h2 class="font-semibold">
        {{ ui("Xác nhận chuyển USDC cho MoneyGram") }}
      </h2>
      <p class="text-sm mt-2">
        {{ cashoutRequest.amount }} {{ ui("USDC · Mạng") }}
        {{ cashoutRequest.requiredNetwork }}
      </p>
      <p class="text-xs break-all mt-2">{{ cashoutRequest.to }}</p>
      <p class="text-xs mt-2">
        Memo ID {{ cashoutRequest.memo || ui("Không yêu cầu") }}
      </p>
      <button
        :disabled="busy"
        class="mt-4 bg-emerald-700 text-white px-4 py-2 rounded-lg"
        @click="run(confirmCashout)"
      >
        {{ ui("Kiểm tra settlement và ký bằng ví") }}
      </button>
    </section>
    <section class="bg-white border rounded-xl p-6">
      <div class="flex justify-between mb-4">
        <h2 class="font-semibold">{{ ui("Lịch sử MoneyGram") }}</h2>
        <button
          class="text-sm text-emerald-700 underline"
          @click="run(refresh)"
        >
          {{ ui("Cập nhật") }}
        </button>
      </div>
      <div
        v-for="r in ramps"
        :key="r._id"
        class="py-4 border-t flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <p class="font-medium text-sm">
            {{ r.flow === "cash-in" ? ui("Nạp tiền mặt") : ui("Rút tiền mặt") }}
            · {{ r.amount || ui("Chờ báo giá") }} USDC
          </p>
          <p class="text-xs text-slate-500 mt-1 break-all">
            {{ r.providerId }}
          </p>
          <p class="text-xs mt-1">
            {{ r.status }} · MoneyGram {{ r.providerStatus }}
          </p>
        </div>
        <button
          class="text-sm underline text-emerald-700"
          @click="run(() => reconcileRamp(r))"
        >
          {{ ui("Đối soát") }}
        </button>
      </div>
      <p v-if="!ramps.length" class="text-sm text-slate-500">
        {{ ui("Chưa có giao dịch MoneyGram.") }}
      </p>
    </section>
    <section
      v-if="authorizations.length"
      class="bg-white border rounded-xl p-6"
    >
      <h2 class="font-semibold mb-4">{{ ui("Yêu cầu chấp thuận Soroban") }}</h2>
      <article v-for="a in authorizations" :key="a._id" class="py-4 border-t">
        <p class="font-medium text-sm">
          {{ a.kind }} · {{ a.amount }} {{ a.asset }}
        </p>
        <p class="text-xs text-slate-500 mt-2">
          {{ ui("Hợp đồng") }} {{ a.trade }} {{ ui("· hết hạn") }}
          {{ new Date(a.expiresAt).toLocaleString("vi-VN") }}
        </p>
        <p class="text-xs text-slate-500 mt-2">
          {{ ui("Đọc lời gọi contract trong ví trước khi ký.") }}
        </p>
        <button
          :disabled="busy"
          class="bg-emerald-700 text-white rounded-lg px-4 py-2 mt-3"
          @click="
            run(async () => {
              await signAuthorization(a);
              await refresh();
            })
          "
        >
          {{ ui("Xem và ký authorization") }}
        </button>
      </article>
    </section>
    <section class="bg-white border rounded-xl p-6">
      <h2 class="font-semibold mb-4">{{ ui("Giao dịch Stellar") }}</h2>
      <div v-for="i in intents" :key="i._id" :data-intent-id="i._id" class="border-t py-4 text-sm">
        <div class="flex justify-between gap-3">
          <span>{{ i.kind }} · {{ i.amount }} {{ i.asset }}</span
          ><span>{{ i.status }}</span>
        </div>
        <p class="text-xs break-all text-slate-500 mt-2">{{ i.txHash }}</p>
        <p
          v-if="i.warnings?.includes('NEW_RECIPIENT')"
          class="text-sm text-amber-800 mt-2"
        >
          {{
            ui(
              "Người nhận mới trong lịch sử chuẩn bị giao dịch. Kiểm tra địa chỉ và số tiền trước khi ký.",
            )
          }}
        </p>
        <button
          v-if="i.status === 'awaiting_signature'"
          :disabled="busy"
          class="mt-2 mr-4 underline text-emerald-700"
          @click="run(() => resumeSigning(i))"
        >
          {{ ui("Ký và gửi") }}</button
        ><button
          v-if="['submitted', 'awaiting_signature', 'awaiting_authorizations'].includes(i.status)"
          :disabled="busy"
          class="mt-2 underline text-emerald-700"
          @click="run(() => reconcileIntent(i))"
        >
          {{ ui("Kiểm tra ledger") }}
        </button>
        <p v-if="i.status === 'awaiting_authorizations'" class="text-xs mt-2">
          {{ ui("Chờ các bên ký authorization.") }}
        </p>
      </div>
      <p v-if="!intents.length" class="text-sm text-slate-500">
        {{ ui("Chưa có giao dịch Stellar.") }}
      </p>
    </section>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request } = usePlatform();
const { configuration, load, connect, sign, signAuthorization } =
  useStellarWallet();
const authorizations = ref<any[]>([]);
const wallet = ref<any>(null);
const ramps = ref<any[]>([]);
const intents = ref<any[]>([]);
const session = ref<any>(null);
const frame = ref<HTMLIFrameElement>();
const busy = ref(false);
const notice = ref("");
const cashoutRequest = ref<any>(null);
const currentRamp = ref<any>(null);
let registering: Promise<any> | undefined;
const balances = computed(
  () =>
    wallet.value?.balances?.filter(
      (b: any) =>
        b.asset === "XLM" ||
        (b.asset === "USDC" && b.issuer === configuration.value?.usdcIssuer),
    ) || [],
);
async function run(fn: () => Promise<any>) {
  if (busy.value) return;
  busy.value = true;
  notice.value = "";
  try {
    await fn();
  } catch (e: any) {
    notice.value =
      e.data?.error?.message || e.message || ui("Không thực hiện được");
  } finally {
    busy.value = false;
  }
}
async function refresh() {
  wallet.value = await request("/finance/wallet");
  ramps.value = await request("/finance/moneygram/transactions");
  intents.value = await request("/finance/intents");
  if (wallet.value?.connected)
    authorizations.value = await request("/finance/authorizations");
}
async function resumeSigning(i: any) {
  const intent = await request(`/finance/intents/${i._id}`);
  await sign(intent);
  await refresh();
}
async function connectWallet() {
  await connect();
  await refresh();
  notice.value = ui("Đã xác minh quyền sở hữu ví");
}
async function openMoneygram(flow: string) {
  currentRamp.value = null;
  cashoutRequest.value = null;
  session.value = await request("/finance/moneygram/sessions", "POST", {
    flow,
  });
}
async function reconcileRamp(r: any) {
  await request(`/finance/moneygram/transactions/${r._id}/reconcile`, "POST");
  await refresh();
}
async function reconcileIntent(i: any) {
  await request(`/finance/intents/${i._id}/reconcile`, "POST");
  await refresh();
}
function reply(type: string, payload: any) {
  if (session.value)
    frame.value?.contentWindow?.postMessage(
      { type, payload },
      new URL(session.value.widgetUrl).origin,
    );
}
async function receive(event: MessageEvent) {
  if (
    !session.value ||
    event.origin !== new URL(session.value.widgetUrl).origin ||
    event.source !== frame.value?.contentWindow
  )
    return;
  const { type, payload } = event.data || {};
  try {
    if (type === "RAMPS_READY")
      reply("RAMPS_CONFIG", {
        sessionToken: session.value.sessionToken,
        wallet: {
          address: session.value.walletAddress,
          chain: "stellar",
          asset: "USDC",
          walletType: "non-custodial",
        },
        transaction: {
          type: session.value.flow === "cash-in" ? "on-ramp" : "off-ramp",
          asset: "USDC",
        },
        mode: session.value.flow === "cash-in" ? "on-ramp" : "off-ramp",
      });
    if (type === "RAMPS_CHECK_BALANCE") {
      const balance =
        balances.value.find((b: any) => b.asset === "USDC")?.balance || "0";
      const units = (v: string) => {
        const [w, f = ""] = v.split(".");
        return BigInt(w) * 10000000n + BigInt(f.padEnd(7, "0").slice(0, 7));
      };
      reply("RAMPS_BALANCE_RESULT", {
        balance,
        sufficient: units(balance) >= units(String(payload?.amount || "0")),
        asset: "USDC",
      });
    }
    if (
      type === "RAMPS_TRANSACTION_CREATED" &&
      typeof payload?.id === "string"
    ) {
      registering = request("/finance/moneygram/transactions", "POST", {
        session: session.value.id,
        providerId: payload.id,
      });
      currentRamp.value = await registering;
      await refresh();
    }
    if (type === "RAMPS_SIGN_TRANSACTION") {
      if (
        payload?.chain !== "stellar" ||
        payload?.asset !== "USDC" ||
        payload?.requiredNetwork !== configuration.value.network ||
        (payload?.issuer && payload.issuer !== configuration.value.usdcIssuer)
      )
        throw new Error(ui("Yêu cầu ký MoneyGram sai tài sản hoặc sai mạng"));
      if (registering) await registering;
      cashoutRequest.value = payload;
    }
    if (type === "RAMPS_TRANSACTION_COMPLETE") {
      notice.value = ui(
        "MoneyGram đã tạo hướng dẫn. Chờ thanh toán tiền mặt và đối soát USDC trên ledger.",
      );
      if (currentRamp.value) await reconcileRamp(currentRamp.value);
    }
    if (type === "RAMPS_TRANSACTION_FAILED")
      notice.value = ui(
        "MoneyGram chưa hoàn tất giao dịch. Xem trạng thái và đối soát trước khi thử lại.",
      );
    if (type === "RAMPS_CLOSE") session.value = null;
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
    if (type === "RAMPS_SIGN_TRANSACTION")
      reply("RAMPS_SIGN_ERROR", { error: notice.value });
  }
}
async function confirmCashout() {
  if (!currentRamp.value)
    throw new Error(ui("Chưa lưu được MoneyGram transaction ID"));
  const intent = await request(
    "/finance/moneygram/cash-out/prepare",
    "POST",
    { ramp: currentRamp.value._id },
    { "Idempotency-Key": `cashout-${currentRamp.value._id}` },
  );
  if (intent.status === "awaiting_signature") await sign(intent);
  const result = await request(
    `/finance/intents/${intent._id}/reconcile`,
    "POST",
  );
  if (result.status !== "confirmed") {
    notice.value = ui(
      "Giao dịch đã gửi, đang chờ ledger. Không chuyển thêm lần nữa.",
    );
    return;
  }
  reply("RAMPS_SIGN_SUCCESS", {
    txHash: result.txHash,
    walletAddress: wallet.value.wallet.address,
  });
  cashoutRequest.value = null;
  await refresh();
}
onMounted(async () => {
  window.addEventListener("message", receive);
  await run(async () => {
    await load();
    await refresh();
  });
});
onBeforeUnmount(() => window.removeEventListener("message", receive));
</script>
