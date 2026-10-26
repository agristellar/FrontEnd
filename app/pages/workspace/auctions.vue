<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">{{ ui("Đấu giá nông sản") }}</h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Mua vé và đặt giá bằng token trên Stellar. Tiền chỉ được xác nhận sau khi giao dịch thành công trên ledger.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="p-4 bg-amber-50 rounded-lg mb-6">
      {{ notice }}
    </p>
    <fieldset :disabled="busy" :aria-busy="busy" :aria-label="ui('Đấu giá nông sản')" class="grid xl:grid-cols-3 gap-6 min-w-0">
      <section
        v-if="organization?.kind === 'Supplier' || user?.role === 'Admin'"
        class="bg-white border rounded-xl p-6"
      >
        <h2 class="font-semibold mb-4">{{ ui("Đề xuất phiên đấu giá") }}</h2>
        <WorkspaceForm
          :fields="
            user?.role === 'Admin'
              ? [
                  {
                    key: 'supplier',
                    label: ui('ID tổ chức supplier được chỉ định'),
                    required: true,
                  },
                  ...fields,
                ]
              : fields
          "
          :initial="{ asset: 'USDC', unit: 'kg', ticketPrice: '0' }"
          @submit="create"
        />
      </section>
      <section
        class="space-y-4"
        :class="
          organization?.kind === 'Supplier' ? 'xl:col-span-2' : 'xl:col-span-3'
        "
      >
        <article
          v-for="a in auctions"
          :key="a._id"
          class="bg-white border rounded-xl p-6"
        >
          <div class="flex flex-wrap justify-between gap-3">
            <h2 class="font-semibold text-lg">{{ a.title }}</h2>
            <span class="text-xs text-emerald-700">{{ a.state }}</span>
          </div>
          <p class="text-sm text-slate-500 mt-3">
            {{ a.product }} · {{ a.quantity }} {{ a.unit }}
          </p>
          <div class="grid sm:grid-cols-3 gap-3 text-sm mt-4">
            <p>{{ ui("Khởi điểm") }} {{ a.reserve }} {{ a.asset }}</p>
            <p>{{ ui("Giá cao nhất") }} {{ a.highestBid || "—" }}</p>
            <p>{{ ui("Vé") }} {{ a.ticketPrice }} {{ a.asset }}</p>
          </div>
          <p class="text-xs text-slate-500 mt-3">
            {{ ui("Kết thúc") }}
            {{ new Date(a.endsAt).toLocaleString("vi-VN") }}
          </p>
          <button
            v-if="a.nominatedBy &amp;&amp; !a.nominationAcceptedAt &amp;&amp; a.state==='pending' &amp;&amp; organization?._id===a.supplier"
            class="text-emerald-700 underline text-sm mt-4"
            @click="acceptNomination(a)"
          >
            {{ ui("Chấp nhận chỉ định của admin") }}
          </button>
          <div class="flex flex-wrap gap-3 mt-5">
            <button class="text-sm text-emerald-700 underline" @click="sync(a)">
              {{ ui("Đối soát on-chain") }}</button
            ><button
              v-if="organization?.kind === 'Supplier' && a.state === 'pending'"
              class="text-sm text-emerald-700 underline"
              @click="prepare(a, 'create')"
            >
              {{ ui("Ký tạo phiên on-chain") }}</button
            ><template v-if="user?.role === 'Admin'"
              ><button
                v-for="action in [
                  'approve',
                  'pause',
                  'resume',
                  'cancel',
                  'claim_fees',
                ]"
                :key="action"
                class="text-sm text-emerald-700 underline"
                @click="prepare(a, action)"
              >
                {{ ui(actionLabels[action]) }}
              </button></template
            ><button
              v-if="organization?.kind === 'Buyer' && a.state === 'live'"
              class="text-sm text-emerald-700 underline"
              @click="prepare(a, 'buy_ticket')"
            >
              {{ ui("Mua vé") }}</button
            ><button
              class="text-sm text-emerald-700 underline"
              @click="prepare(a, 'close')"
            >
              {{ ui("Kết thúc sau hạn") }}</button
            ><button
              class="text-sm text-emerald-700 underline"
              @click="prepare(a, 'claim_refund')"
            >
              {{ ui("Claim khoản được hoàn") }}</button
            ><button
              v-if="organization?.kind === 'Supplier'"
              class="text-sm text-emerald-700 underline"
              @click="prepare(a, 'claim_proceeds')"
            >
              {{ ui("Claim tiền thắng") }}
            </button>
          </div>
          <details
            v-if="organization?._id===a.supplier &amp;&amp; ['live','paused','closed'].includes(a.state)"
            class="border-t mt-5 pt-4"
          >
            <summary class="cursor-pointer font-medium text-sm">
              {{ ui("Ủy quyền supplier agent claim tiền") }}
            </summary>
            <p class="text-sm text-slate-500 my-4">
              {{
                ui(
                  "Agent chỉ claim tiền thắng về chính ví supplier, trong hạn mức và thời hạn.",
                )
              }}
            </p>
            <WorkspaceForm
              :fields="supplierAgentFields"
              @submit="grantProceeds(a, $event)"
            />
            <div class="flex flex-wrap gap-3 mt-4">
              <input
                v-model="agentAddresses[a._id]"
                :placeholder="ui('Địa chỉ agent')"
                :aria-label="ui('Địa chỉ supplier agent')"
                class="rounded-lg border-slate-300 flex-1 min-w-0"
              /><button
                class="text-red-700 underline text-sm"
                @click="agentProceeds(a, 'revoke_proceeds')"
              >
                {{ ui("Ký thu hồi") }}</button
              ><button
                class="text-emerald-700 underline text-sm"
                @click="agentProceeds(a, 'agent_claim_proceeds')"
              >
                {{ ui("Claim bằng ví agent") }}
              </button>
            </div>
          </details>
          <form
            v-if="organization?.kind === 'Buyer' && a.state === 'live'"
            class="flex gap-3 mt-5"
            @submit.prevent="prepare(a, 'bid', bids[a._id])"
          >
            <input
              v-model="bids[a._id]"
              required
              inputmode="decimal"
              class="rounded-lg border-slate-300 min-w-0 flex-1"
              :aria-label="ui('Giá đặt cho ') + a.title + ''"
              :placeholder="ui('Số tiền đặt giá')"
            /><button
              :disabled="busy"
              class="bg-emerald-700 text-white rounded-lg px-4 py-2"
            >
              {{ ui("Ký đặt giá") }}
            </button>
          </form>
        </article>
        <p
          v-if="!auctions.length"
          class="bg-white border rounded-xl p-10 text-center text-slate-500"
        >
          {{ ui("Chưa có phiên đấu giá.") }}
        </p>
      </section>
    </fieldset>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request, organization } = usePlatform();
const { user } = useAuth();
const { sign } = useStellarWallet();
const auctions = ref<any[]>([]);
const notice = ref("");
const busy = ref(false);
const bids = reactive<Record<string, string>>({});
const agentAddresses = reactive<Record<string, string>>({});
const supplierAgentFields = [
  { key: "agent", label: ui("Địa chỉ agent"), required: true },
  { key: "limit", label: ui("Hạn mức claim"), required: true },
  {
    key: "expiresAt",
    label: ui("Hiệu lực đến"),
    type: "datetime-local",
    required: true,
  },
  { key: "policyHash", label: ui("SHA-256 chính sách"), required: true },
];
async function grantProceeds(a: any, d: any) {
  if (busy.value) return;
  agentAddresses[a._id] = d.agent;
  await agentProceeds(a, "grant_proceeds", {
    ...d,
    expiresAt: new Date(d.expiresAt).toISOString(),
  });
}
async function agentProceeds(a: any, action: string, body: any = {}) {
  return run(async () => {
    const i = await request(
      `/auctions/${a._id}/proceeds-agents/prepare`,
      "POST",
      { ...body, action, agent: agentAddresses[a._id] },
      { "Idempotency-Key": crypto.randomUUID() },
    );
    if (i.status === "awaiting_signature") await sign(i);
    notice.value = ui("Theo dõi xác nhận tại mục Ví.");
  });
}
async function run(work: () => Promise<void>) {
  if (busy.value) return;
  busy.value = true;
  notice.value = "";
  try {
    await work();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  } finally {
    busy.value = false;
  }
}
const actionLabels: Record<string, string> = {
  claim_fees: ui("Claim phí vé"),
  approve: ui("Duyệt on-chain"),
  pause: ui("Tạm dừng"),
  resume: ui("Tiếp tục"),
  cancel: ui("Hủy phiên"),
};
const fields = [
  { key: "title", label: ui("Tên phiên"), required: true },
  { key: "product", label: ui("Sản phẩm"), required: true },
  { key: "quantity", label: ui("Số lượng"), required: true },
  { key: "unit", label: ui("Đơn vị"), required: true },
  {
    key: "asset",
    label: ui("Tài sản"),
    required: true,
    options: ["USDC", "XLM"],
  },
  { key: "reserve", label: ui("Giá khởi điểm"), required: true },
  { key: "increment", label: ui("Bước giá tối thiểu"), required: true },
  { key: "ticketPrice", label: ui("Giá vé"), required: true },
  {
    key: "endsAt",
    label: ui("Thời gian kết thúc"),
    type: "datetime-local",
    required: true,
  },
];
async function load() {
  try {
    auctions.value = await request("/auctions");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function create(d: any) {
  return run(async () => {
    await request("/auctions", "POST", {
      ...d,
      endsAt: new Date(d.endsAt).toISOString(),
    });
    await load();
    notice.value = ui(
      "Đã lưu đề xuất. Tạo phiên và admin duyệt bằng giao dịch Stellar.",
    );
  });
}
async function acceptNomination(a: any) {
  return run(async () => {
    await request(`/auctions/${a._id}/accept-nomination`, "POST", {});
    await load();
  });
}
async function sync(a: any) {
  return run(async () => {
    await request(`/auctions/${a._id}/sync`, "POST");
    await load();
  });
}
async function prepare(a: any, action: string, amount?: string) {
  return run(async () => {
    const i = await request(
      `/auctions/${a._id}/prepare`,
      "POST",
      { action, ...(amount ? { amount } : {}) },
      { "Idempotency-Key": crypto.randomUUID() },
    );
    if (i.status === "awaiting_signature") await sign(i);
    notice.value = ui(
      "Đã tạo giao dịch. Theo dõi xác nhận tại mục Ví rồi đối soát phiên.",
    );
  });
}
onMounted(load);
</script>
