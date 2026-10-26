<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">{{ ui("Trợ lý soạn thảo AI") }}</h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Chọn agent đã được cấp language.draft. Nội dung hợp đồng hoặc RFQ được gửi tới nhà cung cấp sau khi bạn duyệt. Kết quả là đề xuất để người phụ trách xem xét.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="bg-amber-50 rounded-xl p-4 mb-5">
      {{ notice }}
    </p>
    <div class="grid lg:grid-cols-2 gap-6">
      <section class="bg-white border rounded-xl p-6">
        <h2 class="font-semibold mb-4">{{ ui("Yêu cầu soạn thảo") }}</h2>
        <WorkspaceForm :fields="fields" @submit="create" />
        <section
          v-for="m in models"
          :key="m._id"
          class="border-t mt-5 pt-4 text-sm"
        >
          <h3 class="font-medium">
            {{ m.name }} · {{ m.costUnits }} {{ ui("đơn vị nội bộ") }}
          </h3>
          <p class="text-slate-500 mt-2">{{ m.dataPolicy }}</p>
        </section>
      </section>
      <section class="space-y-4">
        <article
          v-for="j in jobs"
          :key="j._id"
          class="bg-white border rounded-xl p-5"
        >
          <p class="font-medium">
            {{ j.state }} · {{ j.costUnits }} {{ ui("đơn vị") }}
          </p>
          <p class="text-sm my-3">{{ j.instruction }}</p>
          <p class="text-xs text-slate-500 break-all">
            Commitment {{ j.inputHash }}
          </p>
          <div v-if="j.state === 'pending_approval'" class="flex gap-5 mt-4">
            <button
              class="underline text-emerald-700"
              @click="approve(j, true)"
            >
              {{ ui("Cho phép gửi dữ liệu và chạy model") }}</button
            ><button class="underline text-red-700" @click="approve(j, false)">
              {{ ui("Từ chối") }}
            </button>
          </div>
          <p v-if="j.result" class="whitespace-pre-wrap text-sm leading-7 mt-4">
            {{ j.result }}
          </p>
          <p v-if="j.error" class="text-sm text-red-700 mt-3">{{ j.error }}</p>
          <p v-if="j.usage" class="text-xs text-slate-500 mt-3">
            {{ ui("Token vào") }} {{ j.usage.inputTokens }} · ra
            {{ j.usage.outputTokens }}
          </p>
        </article>
        <p
          v-if="!jobs.length"
          class="bg-white border p-8 rounded-xl text-slate-500"
        >
          {{ ui("Chưa có yêu cầu soạn thảo.") }}
        </p>
        <button class="underline text-emerald-700" @click="load">
          {{ ui("Cập nhật kết quả") }}
        </button>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request } = usePlatform();
const agents = ref<any[]>([]);
const trades = ref<any[]>([]);
const rfqs = ref<any[]>([]);
const models = ref<any[]>([]);
const jobs = ref<any[]>([]);
const notice = ref("");
const fields = computed(() => [
  {
    key: "agent",
    label: "Agent",
    required: true,
    options: agents.value
      .filter((a) => a.tools.includes("language.draft") && a.state === "active")
      .map((a) => ({ value: a._id, label: `${a.name} · ${a.model}` })),
  },
  {
    key: "trade",
    label: ui("Hợp đồng"),
    options: trades.value.map((t) => ({ value: t._id, label: t.title })),
  },
  {
    key: "rfq",
    label: "RFQ",
    options: rfqs.value.map((r) => ({ value: r._id, label: r.title })),
  },
  {
    key: "instruction",
    label: ui("Yêu cầu soạn thảo"),
    type: "textarea",
    required: true,
  },
  {
    key: "allowProviderData",
    label: ui(
      "Tôi đồng ý gửi phần nội dung được chọn tới model theo chính sách trên",
    ),
    type: "checkbox",
    required: true,
  },
]);
async function load() {
  try {
    [agents.value, models.value, jobs.value, trades.value, rfqs.value] =
      await Promise.all([
        request("/platform/agents"),
        request("/ai/models"),
        request("/ai/drafts"),
        request("/platform/trades"),
        request("/platform/rfqs"),
      ]);
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function create(d: any) {
  try {
    const agent = d.agent;
    delete d.agent;
    if (!d.trade) delete d.trade;
    if (!d.rfq) delete d.rfq;
    await request(`/ai/agents/${agent}/drafts`, "POST", {
      ...d,
      key: crypto.randomUUID(),
    });
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function approve(j: any, approved: boolean) {
  try {
    await request(`/ai/drafts/${j._id}/approve`, "POST", {
      approved,
      inputHash: j.inputHash,
    });
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
</script>
