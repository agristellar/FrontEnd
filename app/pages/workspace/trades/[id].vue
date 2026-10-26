<template>
  <div v-if="trade">
    <NuxtLink to="/workspace/trades" class="text-sm text-emerald-700">{{
      ui("← Hợp đồng")
    }}</NuxtLink>
    <div class="flex flex-wrap justify-between gap-4 mt-4 mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ trade.title }}</h1>
        <p class="text-sm text-slate-500 mt-2">
          {{ ui("Phiên bản") }} {{ trade.version }} · {{ trade.state }}
        </p>
      </div>
      <p class="text-2xl font-semibold">{{ trade.amount }} {{ trade.asset }}</p>
    </div>
    <details v-if="trade.quoteSnapshot" open class="bg-white border rounded-xl p-5 mb-6">
      <summary class="font-semibold cursor-pointer">{{ ui('Bản chụp báo giá gắn với hợp đồng') }}</summary>
      <QuoteSnapshot class="mt-4" :snapshot="trade.quoteSnapshot" />
    </details>
    <p
      v-if="notice"
      role="status"
      class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6"
    >
      {{ ui(notice) }}
    </p>
    <div
      v-if="trade.state==='chain_requested' &amp;&amp; trade.chainApprovedBy"
      class="bg-white border rounded-xl p-5 mb-6"
    >
      <p class="text-sm text-slate-600 mb-3">
        {{
          ui(
            "Cấu hình pool đã được admin duyệt. Buyer tạo giao dịch; supplier và trọng tài ký tại mục Ví.",
          )
        }}
      </p>
      <button
        :disabled="busy"
        class="bg-emerald-700 text-white px-4 py-2 rounded-lg"
        @click="createPool"
      >
        {{ ui("Chuẩn bị giao dịch tạo pool") }}
      </button>
    </div>
    <section
      v-if="trade.requiresQr"
      class="bg-white border rounded-xl p-6 mb-6"
    >
      <h2 class="font-semibold mb-2">
        {{ ui("Chứng cứ QR lô hàng") }} {{ trade.lotReference }}
      </h2>
      <p class="text-sm text-slate-500 mb-4">
        {{
          ui(
            "Đối tác kiểm tra chứng cứ đã ký. Giải ngân cần xác nhận QR còn hạn trên blockchain.",
          )
        }}
      </p>
      <form class="flex flex-wrap gap-3" @submit.prevent="submitQr">
        <input
          v-model="qrReference"
          required
          minlength="4"
          maxlength="2000"
          :placeholder="ui('Mã hoặc URL chứng cứ QR')"
          :aria-label="ui('Chứng cứ QR')"
          class="rounded-lg border-slate-300 flex-1 min-w-0"
        /><button class="bg-emerald-700 text-white px-4 py-2 rounded-lg">
          {{ ui("Gửi xác minh") }}
        </button>
      </form>
      <ul class="text-sm mt-4 space-y-2">
        <li v-for="q in qrItems" :key="q._id">
          {{ q.state }} · {{ q.intent?.status || ui("Chờ trọng tài xác minh") }}
          <span v-if="q.expiresAt"
            >{{ ui("· hết hạn") }}
            {{ new Date(q.expiresAt).toLocaleString("vi-VN") }}</span
          >
        </li>
      </ul>
    </section>
    <details v-if="trade.poolHash" class="bg-white border rounded-xl p-6 mb-6">
      <summary class="font-semibold cursor-pointer">
        {{ ui("Ủy quyền ví agent") }}
      </summary>
      <p class="text-sm text-slate-500 my-4">
        {{
          ui(
            "Buyer ký ngân sách và thời hạn. Agent chỉ giải ngân tiền đã nạp cho supplier của hợp đồng, theo nonce; không giữ quyền rút về địa chỉ khác.",
          )
        }}
      </p>
      <div class="grid md:grid-cols-2 gap-6">
        <WorkspaceForm
          :fields="delegationFields"
          :submit-label="ui('Chuẩn bị ủy quyền')"
          @submit="delegate"
        />
        <div>
          <label for="agent-address" class="text-sm block mb-2">{{
            ui("Địa chỉ agent đã ủy quyền")
          }}</label
          ><input
            id="agent-address"
            v-model="agentAddress"
            class="w-full rounded-lg border-slate-300"
          />
          <div class="flex gap-4 my-3">
            <button
              class="underline text-emerald-700 text-sm"
              @click="readDelegation"
            >
              {{ ui("Đọc quyền từ ledger") }}</button
            ><button
              class="underline text-red-700 text-sm"
              @click="revokeAgent"
            >
              {{ ui("Ký thu hồi") }}
            </button>
          </div>
          <dl v-if="delegation" class="text-sm space-y-2">
            <div>
              {{ ui("Ngân sách còn lại:") }} {{ delegation.remaining }}
              {{ trade.asset }}
            </div>
            <div>
              Nonce: {{ delegation.nonce }} ·
              {{
                delegation.revoked
                  ? ui("Đã thu hồi")
                  : ui("Có hiệu lực đến ") +
                    new Date(delegation.expiresAt).toLocaleString("vi-VN")
              }}
            </div>
          </dl>
          <form
            v-if="delegation"
            class="flex gap-2 mt-4"
            @submit.prevent="agentRelease"
          >
            <input
              v-model="agentAmount"
              required
              inputmode="decimal"
              :aria-label="ui('Số tiền agent giải ngân')"
              :placeholder="ui('Số tiền')"
              class="rounded-lg border-slate-300 min-w-0"
            /><button class="underline text-emerald-700 text-sm">
              {{ ui("Ký bằng ví agent") }}
            </button>
          </form>
        </div>
      </div>
    </details>
    <div class="grid lg:grid-cols-3 gap-6">
      <section class="lg:col-span-2 bg-white border rounded-xl p-6">
        <h2 class="font-semibold mb-4">
          {{ ui("Điều khoản được chấp thuận") }}
        </h2>
        <textarea
          v-if="editing"
          v-model="body"
          class="w-full rounded-lg border-slate-300 min-h-72"
          :aria-label="ui('Chỉnh sửa điều khoản')"
        />
        <p v-else class="whitespace-pre-wrap text-sm leading-7">
          {{ trade.body }}
        </p>
        <p class="text-xs text-slate-400 break-all mt-5">
          Terms commitment {{ trade.termsHash }}
        </p>
        <div class="flex flex-wrap gap-3 mt-5">
          <button
            v-if="trade.state === 'draft'"
            class="text-sm underline text-emerald-700"
            @click="editing ? revise() : (editing = true)"
          >
            {{ editing ? ui("Lưu phiên bản mới") : ui("Chỉnh sửa") }}</button
          ><button
            v-if="trade.state === 'draft'"
            class="px-4 py-2 bg-emerald-700 text-white rounded-lg"
            @click="action('offer')"
          >
            {{ ui("Gửi chấp thuận") }}</button
          ><button
            v-if="trade.state === 'offered'"
            class="px-4 py-2 bg-emerald-700 text-white rounded-lg"
            @click="action('accept', { termsHash: trade.termsHash })"
          >
            {{ ui("Chấp thuận phiên bản này") }}</button
          ><button
            v-if="trade.state === 'accepted'"
            class="px-4 py-2 bg-emerald-700 text-white rounded-lg"
            @click="action('request-chain')"
          >
            {{ ui("Yêu cầu pool on-chain") }}</button
          ><button class="text-sm underline text-slate-600" @click="review">
            {{ ui("Rà điều khoản") }}</button
          ><button
            v-if="['draft', 'offered'].includes(trade.state)"
            class="text-sm underline text-red-700"
            @click="action('cancel')"
          >
            {{ ui("Hủy hợp đồng") }}
          </button>
        </div>
        <div v-if="findings" class="mt-6 border-t pt-5">
          <p class="text-xs text-slate-500">
            {{ ui("Kiểm tra quy tắc v1 · Cần người phụ trách rà soát") }}
          </p>
          <p
            v-for="f in findings"
            :key="f.rule"
            class="text-sm text-amber-800 mt-2"
          >
            {{ f.message }}
          </p>
          <p v-if="!findings.length" class="text-sm mt-3">
            {{ ui("Không phát hiện thiếu mục theo bộ quy tắc hiện tại.") }}
          </p>
        </div>
        <div class="border-t pt-5 mt-6">
          <h3 class="font-semibold mb-3">{{ ui("Chấp thuận") }}</h3>
          <p
            v-for="a in trade.acceptedBy"
            :key="a.organization"
            class="text-sm text-slate-500 mt-2"
          >
            {{
              a.organization === organization?._id
                ? ui("Tổ chức của bạn")
                : ui("Đối tác")
            }}
            · {{ new Date(a.at).toLocaleString("vi-VN") }}
          </p>
        </div>
      </section>
      <section class="bg-white border rounded-xl p-6 h-fit">
        <h2 class="font-semibold mb-4">Pool {{ trade.asset }}</h2>
        <dl class="space-y-3 text-sm">
          <div
            v-for="s in summary"
            :key="s.label"
            class="flex justify-between gap-2"
          >
            <dt class="text-slate-500">{{ ui(s.label) }}</dt>
            <dd>{{ s.value }}</dd>
          </div>
        </dl>
        <p
          v-if="trade.state === 'chain_requested'"
          class="text-sm text-slate-500 mt-5"
        >
          {{
            ui(
              "Chờ admin duyệt và các bên ký tạo pool trên Stellar. Tiền chưa được nhận trong bước này.",
            )
          }}
        </p>
        <div v-if="trade.state === 'active'" class="mt-6 pt-5 border-t">
          <label class="block text-sm mb-2" for="payment-amount"
            >{{ ui("Số tiền") }} {{ trade.asset }}</label
          ><input
            id="payment-amount"
            v-model="amount"
            class="w-full rounded-lg border-slate-300"
            inputmode="decimal"
          /><label for="moneygram-source" class="block text-sm mt-4 mb-2">{{
            ui("Nguồn nạp")
          }}</label
          ><select
            id="moneygram-source"
            v-model="ramp"
            class="w-full rounded-lg border-slate-300"
          >
            <option value="">{{ ui("Số dư ví") }}</option>
            <option v-for="r in ramps" :key="r._id" :value="r._id">
              MoneyGram {{ r.amount }} USDC · {{ r.providerId }}
            </option>
          </select>
          <div class="grid gap-2 mt-4">
            <button
              :disabled="busy"
              class="bg-emerald-700 text-white py-2 rounded-lg disabled:opacity-50"
              @click="pay(ramp ? 'deposit_ramp' : 'deposit')"
            >
              {{ ui("Ký nạp vào escrow") }}</button
            ><button
              :disabled="busy"
              class="border py-2 rounded-lg"
              @click="pay('release')"
            >
              {{ ui("Ký giải ngân cho supplier") }}</button
            ><button
              :disabled="busy"
              class="border py-2 rounded-lg"
              @click="pay('refund')"
            >
              {{ ui("Ký hoàn tiền về ví") }}</button
            ><button
              :disabled="busy"
              class="text-red-700 text-sm underline"
              @click="pay('dispute')"
            >
              {{ ui("Mở tranh chấp on-chain") }}
            </button>
          </div>
        </div>
        <button
          v-if="trade.poolHash"
          class="underline text-sm text-emerald-700 mt-5"
          @click="sync"
        >
          {{ ui("Đối soát pool từ ledger") }}</button
        ><NuxtLink
          to="/workspace/wallet"
          class="block underline text-sm text-emerald-700 mt-3"
          >{{ ui("Nạp USDC qua MoneyGram") }}</NuxtLink
        >
      </section>
    </div>
  </div>
  <p v-else role="status">{{ notice || ui("Đang tải hợp đồng…") }}</p>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const route = useRoute();
const { request, organization } = usePlatform();
const { sign } = useStellarWallet();
const trade = ref<any>(null);
const qrReference = ref("");
const qrItems = ref<any[]>([]);
const agentAddress = ref("");
const agentAmount = ref("");
const delegation = ref<any>(null);
const delegationFields = [
  { key: "agent", label: ui("Địa chỉ Stellar của agent"), required: true },
  { key: "limit", label: ui("Ngân sách tài sản escrow"), required: true },
  {
    key: "expiresAt",
    label: ui("Hiệu lực đến"),
    type: "datetime-local",
    required: true,
  },
  {
    key: "policyHash",
    label: ui("SHA-256 chính sách ủy quyền"),
    required: true,
  },
];
async function prepareDelegation(path: string, data: any) {
  try {
    const i = await request(
      `/finance/trades/${route.params.id}/${path}`,
      "POST",
      data,
      { "Idempotency-Key": crypto.randomUUID() },
    );
    if (i.status === "awaiting_signature") await sign(i);
    notice.value = ui("Đã chuẩn bị giao dịch, theo dõi xác nhận tại mục Ví.");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function delegate(data: any) {
  agentAddress.value = data.agent;
  await prepareDelegation("delegations/prepare", {
    ...data,
    action: "delegate",
    expiresAt: new Date(data.expiresAt).toISOString(),
  });
}
async function revokeAgent() {
  await prepareDelegation("delegations/prepare", {
    action: "revoke",
    agent: agentAddress.value,
  });
}
async function readDelegation() {
  try {
    delegation.value = await request(
      `/finance/trades/${route.params.id}/delegations/${agentAddress.value}`,
    );
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function agentRelease() {
  await prepareDelegation("agent-release/prepare", {
    amount: agentAmount.value,
    nonce: delegation.value.nonce,
  });
}
const notice = ref("");
const busy = ref(false);
const amount = ref("");
const ramp = ref("");
const ramps = ref<any[]>([]);
const findings = ref<any[] | null>(null);
const editing = ref(false);
const body = ref("");
const summary = computed(() => [
  { label: ui("Đã nạp"), value: trade.value?.deposited },
  { label: ui("Đã giải ngân"), value: trade.value?.released },
  { label: ui("Đã hoàn tiền"), value: trade.value?.refunded },
]);
async function load() {
  try {
    trade.value = await request(`/platform/trades/${route.params.id}`);
    body.value = trade.value.body;
    if (trade.value.requiresQr)
      qrItems.value = await request(`/qr/trades/${route.params.id}`);
    ramps.value = (await request("/finance/moneygram/transactions")).filter(
      (r: any) => r.flow === "cash-in" && r.status === "settled",
    );
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function submitQr() {
  try {
    await request(`/qr/trades/${route.params.id}`, "POST", {
      reference: qrReference.value,
    });
    qrReference.value = "";
    await load();
    notice.value = ui("Đã gửi chứng cứ QR để kiểm tra");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function action(a: string, d: any = {}) {
  try {
    await request(`/platform/trades/${route.params.id}/${a}`, "POST", d);
    await load();
    notice.value = ui("Đã ghi nhận");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function revise() {
  try {
    await request(`/platform/trades/${route.params.id}`, "PATCH", {
      body: body.value,
      version: trade.value.version,
    });
    editing.value = false;
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function review() {
  try {
    findings.value = (
      await request(`/platform/trades/${route.params.id}/review`, "POST")
    ).findings;
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function sync() {
  try {
    await request(`/finance/trades/${route.params.id}/sync`, "POST");
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function createPool() {
  if (busy.value) return;
  busy.value = true;
  try {
    const i = await request(
      `/finance/trades/${route.params.id}/create-pool`,
      "POST",
      {},
      { "Idempotency-Key": crypto.randomUUID() },
    );
    notice.value = ui(
      "Đã tạo yêu cầu. Các bên ký tại mục Ví trước thời hạn giao dịch.",
    );
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  } finally {
    busy.value = false;
  }
}
let pendingIntent: any;
let paymentKey = "";
async function pay(action: string) {
  busy.value = true;
  notice.value = "";
  try {
    if (
      pendingIntent?._id &&
      !["failed", "expired", "confirmed"].includes(pendingIntent.status)
    )
      pendingIntent = await request(`/finance/intents/${pendingIntent._id}`);
    if (
      pendingIntent &&
      !["failed", "expired", "confirmed"].includes(pendingIntent.status) &&
      pendingIntent.kind !== action
    )
      throw new Error(
        ui(
          "Đang có giao dịch khác chờ xử lý. Kiểm tra tại mục Ví trước khi tạo lệnh mới.",
        ),
      );
    if (
      !pendingIntent ||
      ["failed", "expired", "confirmed"].includes(pendingIntent.status)
    ) {
      paymentKey = crypto.randomUUID();
      pendingIntent = await request(
        `/finance/trades/${route.params.id}/prepare`,
        "POST",
        {
          action,
          ...(action === "dispute" ? {} : { amount: amount.value }),
          ...(action === "deposit_ramp" ? { ramp: ramp.value } : {}),
        },
        { "Idempotency-Key": paymentKey },
      );
    }
    if (pendingIntent.status === "awaiting_authorizations") {
      notice.value = ui(
        "Cần các bên ký authorization. Mở mục Ví để xem và ký yêu cầu.",
      );
      return;
    }
    if (pendingIntent.status === "awaiting_signature")
      pendingIntent = await sign(pendingIntent);
    pendingIntent = await request(
      `/finance/intents/${pendingIntent._id}/reconcile`,
      "POST",
    );
    notice.value =
      pendingIntent.status === "confirmed"
        ? ui("Giao dịch đã xác nhận trên ledger")
        : ui("Đang chờ ledger. Dùng kiểm tra ledger tại Ví để theo dõi.");
    if (pendingIntent.status === "confirmed") await sync();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  } finally {
    busy.value = false;
  }
}
onMounted(load);
</script>
