<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">{{ ui("Hợp đồng & escrow") }}</h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Hai bên chấp thuận cùng một phiên bản trước khi admin duyệt pool trên Stellar.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="p-3 bg-amber-50 rounded-lg mb-5">
      {{ ui(notice) }}
    </p>
    <div class="grid xl:grid-cols-3 gap-6">
      <section class="bg-white border rounded-xl p-6">
        <h2 class="font-semibold mb-4">{{ ui("Tạo hợp đồng") }}</h2>
        <section v-if="selectedSnapshot" class="border rounded-lg p-4 mb-5 space-y-3">
          <h3 class="font-semibold">{{ ui('Bản chụp báo giá gắn với hợp đồng') }}</h3>
          <QuoteSnapshot :snapshot="selectedSnapshot" />
          <p class="text-xs text-slate-500">{{ ui('Giá trị và tài sản escrow do hai bên thỏa thuận riêng; ứng dụng không tự đổi tiền tệ của báo giá.') }}</p>
          <button type="button" :disabled="busy" class="text-sm text-emerald-700 underline" @click="loadSelectedQuote(true)">{{ ui('Tải lại báo giá mới nhất') }}</button>
        </section>
        <select
          v-model="template"
          class="w-full rounded-lg border-slate-300 mb-4"
          :aria-label="ui('Mẫu hợp đồng')"
          @change="applyTemplate"
        >
          <option value="">{{ ui("Chọn mẫu tham khảo") }}</option>
          <option v-for="t in templates" :key="t._id" :value="t._id">
            {{ t.title }}
          </option></select
        ><WorkspaceForm
          :fields="fields"
          :initial="initial"
          :busy="busy || quoteSelectionBlocked"
          @submit="create"
        />
      </section>
      <section class="xl:col-span-2 space-y-4">
        <NuxtLink
          v-for="t in trades"
          :key="t._id"
          :to="`/workspace/trades/${t._id}`"
          class="block bg-white border p-5 rounded-xl hover:border-emerald-500"
          ><div class="flex justify-between gap-3">
            <h2 class="font-semibold">{{ t.title }}</h2>
            <span class="text-xs text-emerald-700">{{ t.state }}</span>
          </div>
          <p class="mt-3 text-lg">{{ t.amount }} {{ t.asset }}</p>
          <p class="text-xs text-slate-500 mt-3">
            {{ ui("Phiên bản") }} {{ t.version }} {{ ui("· Đã nạp") }}
            {{ t.deposited }} {{ ui("· Đã giải ngân") }}
            {{ t.released }}
          </p></NuxtLink
        >
        <p
          v-if="!trades.length"
          class="bg-white border rounded-xl p-10 text-center text-slate-500"
        >
          {{ ui("Chưa có hợp đồng.") }}
        </p>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const route = useRoute();
const { request, organization } = usePlatform();
const notice = ref("");
const busy = ref(false);
const trades = ref<any[]>([]);
const partners = ref<any[]>([]);
const qrPartners = ref<any[]>([]);
const templates = ref<any[]>([]);
const template = ref("");
const selectedSnapshot = ref<any>(null), selectedQuoteVersion = ref<number | null>(null);
const quoteSelectionBlocked = ref(!!route.query.quote);
const initial = ref<any>({
  counterparty: route.query.counterparty || "",
  asset: "USDC",
  requiresQr: false,
});
const fields = computed(() => [
  {
    key: "counterparty",
    label: ui("Đối tác"),
    required: true,
    options: partners.value
      .filter((o) => o.kind !== organization.value?.kind)
      .map((o) => ({ value: o._id, label: o.name })),
  },
  { key: "title", label: ui("Tên hợp đồng"), required: true },
  {
    key: "body",
    label: ui("Điều khoản đầy đủ"),
    type: "textarea",
    required: true,
  },
  { key: "amount", label: ui("Giá trị"), required: true },
  {
    key: "asset",
    label: ui("Tài sản đặt cọc"),
    options: ["USDC", "XLM"],
    required: true,
  },
  {
    key: "deadline",
    label: ui("Hạn hợp đồng"),
    type: "datetime-local",
    required: true,
  },
  {
    key: "requiresQr",
    label: ui("Bắt buộc xác minh lô hàng bằng QR"),
    type: "checkbox",
  },
  {
    key: "qrPartner",
    label: ui("Đối tác xác minh QR"),
    options: qrPartners.value.map((p) => ({ value: p._id, label: p.title })),
  },
  { key: "lotReference", label: ui("Mã lô hàng theo chứng cứ QR") },
]);
function applyTemplate() {
  const t = templates.value.find((t) => t._id === template.value);
  if (t) initial.value = { ...initial.value, body: t.body };
}
async function load() {
  try {
    trades.value = await request("/platform/trades");
    partners.value = (await request("/platform/directory")).items;
    templates.value = await request("/platform/templates");
    qrPartners.value = await request("/qr/partners");
    if (route.query.quote) await loadSelectedQuote();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function loadSelectedQuote(useLatest = false) {
  quoteSelectionBlocked.value = true;
  try {
    if (typeof route.query.quote !== 'string' || !/^[a-f0-9]{24}$/.test(route.query.quote)) throw new Error(ui('Báo giá không hợp lệ.'));
    const result = await request(`/platform/quotes/${route.query.quote}`);
    selectedSnapshot.value = result.snapshot;
    const latest = result.quote.version || 1;
    selectedQuoteVersion.value = useLatest || !route.query.quoteVersion ? latest : Number(route.query.quoteVersion);
    if (result.counterparty) {
      if (!partners.value.some(p => p._id === result.counterparty._id)) partners.value.push(result.counterparty);
      initial.value = { ...initial.value, counterparty: result.counterparty._id };
    }
    if (selectedQuoteVersion.value !== latest) { notice.value = ui('Báo giá đã đổi phiên bản. Xem bản mới nhất trước khi tạo hợp đồng.'); return; }
    if (result.quote.state !== 'submitted' || Date.parse(result.quote.validUntil) <= Date.now()) { notice.value = ui('Báo giá đã hết hiệu lực hoặc không còn khả dụng.'); return; }
    quoteSelectionBlocked.value = false; notice.value = '';
  } catch (e: any) { notice.value = e.data?.error?.message || e.message; }
}
async function create(data: any) {
  if (busy.value || quoteSelectionBlocked.value) return;
  busy.value = true;
  try {
    const d = { ...data, deadline: new Date(data.deadline).toISOString() };
    if (!d.qrPartner) delete d.qrPartner;
    if (!d.lotReference) delete d.lotReference;
    if (route.query.quote) { d.quote = route.query.quote; d.quoteVersion = selectedQuoteVersion.value; }
    const t = await request("/platform/trades", "POST", d);
    await navigateTo(`/workspace/trades/${t._id}`);
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  } finally {
    busy.value = false;
  }
}
onMounted(load);
</script>
