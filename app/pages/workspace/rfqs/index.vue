<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">{{ ui("RFQ & báo giá") }}</h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Đăng nhu cầu mua hoặc chào bán với đơn vị, Incoterm và thời hạn rõ ràng.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="p-3 bg-amber-50 rounded-lg mb-5">
      {{ ui(notice) }}
    </p>
    <div class="grid xl:grid-cols-3 gap-6">
      <section class="bg-white border p-6 rounded-xl">
        <h2 class="font-semibold mb-5">{{ ui("Tạo yêu cầu") }}</h2>
        <label class="flex gap-2 text-sm mb-4"><input id="rfq-multiline" v-model="multiline" type="checkbox" :disabled="busy" />{{ ui('RFQ nhiều dòng hàng') }}</label>
        <WorkspaceForm
          :fields="fields"
          :initial="{
            direction: organization?.kind === 'Supplier' ? 'sell' : 'buy',
            unit: 'kg',
            incoterm: 'FOB',
            currency: 'USD',
            public: true,
            comparisonBasis: 'line_items',
          }"
          :busy="busy"
          @submit="save"
        >
          <template #before-submit>
            <fieldset v-if="multiline" :disabled="busy" class="space-y-4">
              <legend class="font-medium mb-3">{{ ui('Dòng hàng') }}</legend>
              <div v-for="(line, index) in lineDrafts" :key="line.localId" class="border rounded-lg p-3 space-y-3">
                <ProductImagePicker v-model="line.imageId" :disabled="busy" />
                <p class="text-sm font-semibold">{{ ui('Dòng hàng') }} {{ index + 1 }}</p>
                <label class="text-sm block">{{ ui('Sản phẩm') }}<input :id="`rfq-line-${index}-product`" v-model="line.product" required maxlength="200" class="w-full rounded-lg border-slate-300 mt-1" /></label>
                <label class="text-sm block">{{ ui('Số lượng') }}<input :id="`rfq-line-${index}-quantity`" v-model="line.quantity" required inputmode="decimal" pattern="(0|[1-9][0-9]*)(\.[0-9]{1,7})?" class="w-full rounded-lg border-slate-300 mt-1" /></label>
                <label class="text-sm block">{{ ui('Đơn vị') }}<input :id="`rfq-line-${index}-unit`" v-model="line.unit" required maxlength="30" class="w-full rounded-lg border-slate-300 mt-1" /></label>
                <label class="text-sm block">{{ ui('Quy cách') }}<textarea :id="`rfq-line-${index}-specifications`" v-model="line.specifications" maxlength="2000" rows="2" class="w-full rounded-lg border-slate-300 mt-1" /></label>
                <button type="button" :disabled="lineDrafts.length === 1" class="text-sm underline text-red-700 disabled:opacity-40" @click="lineDrafts.splice(index, 1)">{{ ui('Xóa dòng hàng') }} {{ index + 1 }}</button>
              </div>
              <button type="button" :disabled="lineDrafts.length >= 50" class="text-sm underline text-emerald-700 disabled:opacity-40" @click="addLine">{{ ui('Thêm dòng hàng') }}</button>
            </fieldset>
          </template>
        </WorkspaceForm>
      </section>
      <section class="xl:col-span-2 space-y-4">
        <NuxtLink
          v-for="r in items"
          :key="r._id"
          :to="`/workspace/rfqs/${r._id}`"
          class="block bg-white border p-5 rounded-xl hover:border-emerald-500"
          ><ProductPhoto :image-id="r.imageId" :name="r.product" photo-class="w-full h-40 rounded-lg mb-4 border border-slate-100" /><div class="flex justify-between gap-3">
            <h2 class="font-semibold">{{ r.title }}</h2>
            <span class="text-xs text-emerald-700">{{ r.state }}</span>
          </div>
          <p v-if="r.quoteIntakeState === 'paused'" class="text-xs text-amber-800">{{ ui('Tạm dừng nhận báo giá') }}</p>
          <p class="text-sm text-slate-500 mt-3">
            {{ r.lines?.length > 1 ? `${r.lines.length} ${ui('dòng hàng')}` : `${r.product} · ${r.quantity} ${r.unit}` }} · {{ r.incoterm }} · {{ r.destination }}
          </p>
          <p class="text-xs text-slate-400 mt-3">
            {{ ui("Hạn") }} {{ new Date(r.deadline).toLocaleString("vi-VN") }}
          </p></NuxtLink
        >
        <p
          v-if="!items.length"
          class="bg-white border p-10 rounded-xl text-center text-slate-500"
        >
          {{ ui("Chưa có yêu cầu.") }}
        </p>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request, organization } = usePlatform();
const items = ref<any[]>([]);
const notice = ref("");
const busy = ref(false);
const multiline = ref(false);
let nextLine = 1;
const lineDrafts = ref([{ localId: 0, product: '', imageId: undefined as string | undefined, specifications: '', quantity: '', unit: 'kg' }]);
const addLine = () => lineDrafts.value.push({ localId: nextLine++, product: '', imageId: undefined as string | undefined, specifications: '', quantity: '', unit: 'kg' });
const fields = computed(() => [
  { key: "title", label: ui("Tiêu đề"), required: true },
  { key: "imageId", label: ui("Ảnh sản phẩm"), type: "product-image" },
  {
    key: "direction",
    label: ui("Loại yêu cầu"),
    options: ["buy", "sell"],
    required: true,
  },
  { key: "product", label: ui("Sản phẩm"), required: true },
  { key: "quantity", label: ui("Số lượng"), required: true },
  { key: "unit", label: ui("Đơn vị"), required: true },
  {
    key: "incoterm",
    label: "Incoterm",
    options: ["EXW", "FOB", "CIF", "CFR", "DAP", "DDP"],
    required: true,
  },
  { key: "currency", label: ui("Tiền tệ"), required: true },
  { key: 'comparisonBasis', label: ui('Cơ sở so sánh giá'), required: true, options: [{ value: 'line_items', label: ui('Giá hàng hóa riêng') }, { value: 'declared_total', label: ui('Tổng giá hàng cùng thuế và cước đã khai') }] },
  { key: "destination", label: ui("Nơi giao hàng"), required: true },
  {
    key: "deadline",
    label: ui("Hạn phản hồi"),
    type: "datetime-local",
    required: true,
  },
  { key: "requirements", label: ui("Yêu cầu chất lượng"), type: "textarea" },
  {
    key: "public",
    label: ui("Công khai trong bảng nhu cầu"),
    type: "checkbox",
  },
].filter(field => !multiline.value || !['product', 'quantity', 'unit'].includes(field.key)));
async function load() {
  try {
    items.value = await request("/platform/rfqs");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function save(d: any) {
  busy.value = true;
  try {
    const payload = { ...d, deadline: new Date(d.deadline).toISOString() };
    if (multiline.value) { for (const key of ['product', 'quantity', 'unit']) delete payload[key]; payload.lines = lineDrafts.value.map(({ localId, ...line }) => line); }
    await request("/platform/rfqs", "POST", payload);
    await load();
    notice.value = ui("Đã tạo yêu cầu");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  } finally {
    busy.value = false;
  }
}
onMounted(load);
</script>
