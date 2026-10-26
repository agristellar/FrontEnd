<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">
      {{ ui("Thanh toán dịch vụ & phí") }}
    </h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Phí được chụp tại thời điểm tạo hóa đơn. Ví ký chuyển XLM/USDC và ledger xác nhận trước khi kích hoạt dịch vụ.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="p-4 bg-amber-50 rounded-xl mb-5">
      {{ notice }}
    </p>
    <div class="grid xl:grid-cols-3 gap-6">
      <section class="bg-white border p-6 rounded-xl">
        <h2 class="font-semibold mb-4">{{ ui("Tạo hóa đơn") }}</h2>
        <WorkspaceForm :fields="fields" @submit="create" />
      </section>
      <section class="xl:col-span-2 space-y-4">
        <article
          v-for="i in invoices"
          :key="i._id"
          class="bg-white border rounded-xl p-5"
        >
          <div class="flex justify-between gap-3">
            <h2 class="font-semibold">{{ i.title }}</h2>
            <span>{{ i.amount }} {{ i.asset }}</span>
          </div>
          <p class="text-sm text-slate-500 mt-2">
            {{ i.state }} · {{ i.intent?.status || ui("Chưa ký thanh toán") }}
          </p>
          <p class="text-xs text-slate-500 break-all mt-2">
            {{ ui("Ví nhận:") }} {{ i.destination }}
          </p>
          <div class="flex flex-wrap gap-4 mt-4 text-sm text-emerald-700">
            <button
              v-if="i.state==='open' &amp;&amp; !['failed','expired'].includes(i.intent?.status)"
              class="underline"
              @click="pay(i)"
            >
              {{ ui("Ký thanh toán") }}</button
            ><button
              v-if="['failed', 'expired'].includes(i.intent?.status)"
              class="underline"
              @click="retry(i)"
            >
              {{ ui("Tạo lần thử mới") }}</button
            ><button class="underline" @click="reconcile(i)">
              {{ ui("Đối soát hóa đơn") }}
            </button>
          </div>
        </article>
        <p
          v-if="!invoices.length"
          class="p-8 text-slate-500 bg-white border rounded-xl"
        >
          {{
            ui(
              "Chưa có hóa đơn. Đăng ký gói tại mục Dịch vụ để lấy mã đăng ký.",
            )
          }}
        </p>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request } = usePlatform();
const { sign } = useStellarWallet();
const invoices = ref<any[]>([]);
const notice = ref("");
const subscriptions = ref<any[]>([]);
const trades = ref<any[]>([]);
const fields = computed(() => [
  {
    key: "purpose",
    label: ui("Mục đích"),
    options: [
      { value: "subscription", label: ui("Gói dịch vụ") },
      { value: "trade_sync", label: ui("Đưa hợp đồng lên on-chain") },
      { value: "trade_cancel", label: ui("Hủy hợp đồng off-chain") },
    ],
    required: true,
  },
  {
    key: "subscription",
    label: ui("Đăng ký dịch vụ"),
    options: subscriptions.value
      .filter((s) => s.state === "requested")
      .map((s) => ({
        value: s._id,
        label: s.plan?.title || ui("Gói dịch vụ"),
      })),
  },
  {
    key: "trade",
    label: ui("Hợp đồng"),
    options: trades.value.map((t) => ({ value: t._id, label: t.title })),
  },
]);
async function load() {
  try {
    [invoices.value, subscriptions.value, trades.value] = await Promise.all([
      request("/billing/invoices"),
      request("/platform/subscriptions"),
      request("/platform/trades"),
    ]);
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function create(data: any) {
  try {
    const body = { ...data };
    if (!body.subscription) delete body.subscription;
    if (!body.trade) delete body.trade;
    await request("/billing/invoices", "POST", body);
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function pay(i: any) {
  try {
    const intent = await request(
      `/billing/invoices/${i._id}/prepare`,
      "POST",
      {},
    );
    if (intent.status === "awaiting_signature") await sign(intent);
    await load();
    notice.value = ui("Theo dõi xác nhận tại mục Ví, sau đó đối soát hóa đơn.");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function reconcile(i: any) {
  try {
    await request(`/billing/invoices/${i._id}/reconcile`, "POST", {});
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function retry(i: any) {
  try {
    await request(`/billing/invoices/${i._id}/retry`, "POST", {});
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
</script>
