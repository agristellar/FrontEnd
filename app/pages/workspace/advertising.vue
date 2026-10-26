<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">
      {{ ui("Quảng cáo nguồn cung") }}
    </h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Quảng cáo chờ admin duyệt, được ghi nhãn tài trợ và chỉ hiển thị trong thời hạn.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="bg-amber-50 p-4 rounded-xl mb-5">
      {{ notice }}
    </p>
    <div class="grid lg:grid-cols-2 gap-6">
      <section class="bg-white p-6 border rounded-xl">
        <WorkspaceForm :fields="fields" @submit="create" />
      </section>
      <section class="space-y-4">
        <article
          v-for="a in ads"
          :key="a._id"
          class="bg-white border rounded-xl p-5"
        >
          <h2 class="font-semibold">{{ a.title }}</h2>
          <p class="text-sm mt-3">{{ a.body }}</p>
          <p class="text-sm text-slate-500 mt-2">
            {{ a.state }} · {{ a.reason }}
          </p>
          <p class="text-sm mt-2">
            {{ new Date(a.startsAt).toLocaleDateString("vi-VN") }} –
            {{ new Date(a.expiresAt).toLocaleDateString("vi-VN") }}
          </p>
          <button
            v-if="a.state === 'approved'"
            class="text-red-700 underline text-sm mt-3"
            @click="pause(a)"
          >
            {{ ui("Dừng quảng cáo") }}
          </button>
        </article>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request } = usePlatform();
const notice = ref("");
const ads = ref<any[]>([]);
const fields = [
  { key: "title", label: ui("Tiêu đề"), required: true },
  { key: "body", label: ui("Nội dung"), type: "textarea", required: true },
  { key: "url", label: ui("Đường dẫn HTTPS"), type: "url", required: true },
  {
    key: "startsAt",
    label: ui("Bắt đầu"),
    type: "datetime-local",
    required: true,
  },
  {
    key: "expiresAt",
    label: ui("Kết thúc"),
    type: "datetime-local",
    required: true,
  },
];
async function load() {
  try {
    ads.value = await request("/advertising/campaigns");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function create(d: any) {
  try {
    await request("/advertising/campaigns", "POST", {
      ...d,
      startsAt: new Date(d.startsAt).toISOString(),
      expiresAt: new Date(d.expiresAt).toISOString(),
    });
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function pause(a: any) {
  try {
    await request(`/advertising/campaigns/${a._id}/pause`, "POST", {});
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
</script>
