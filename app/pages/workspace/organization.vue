<template>
  <div class="max-w-3xl">
    <h1 class="text-2xl font-semibold mb-2">{{ ui("Hồ sơ doanh nghiệp") }}</h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Thông tin công khai phục vụ tìm kiếm. Hồ sơ KYB riêng được nộp tại mục Xác minh.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="mb-4 p-3 rounded-lg bg-amber-50">
      {{ notice }}
    </p>
    <div class="bg-white border p-6 rounded-xl">
      <WorkspaceForm
        :key="org?._id || 'new'"
        :fields="fields"
        :initial="initial"
        :busy="busy"
        @submit="save"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();
const route = useRoute();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request, organization: org, loadOrganizations } = usePlatform();
const notice = ref("");
const busy = ref(false);
const initial = computed(() =>
  org.value
    ? {
        name: org.value.name,
        country: org.value.country,
        description: org.value.description,
        products: org.value.products.join(", "),
        capacity: org.value.capacity,
        public: org.value.public,
      }
    : {},
);
const fields = [
  { key: "name", label: ui("Tên doanh nghiệp"), required: true },
  { key: "country", label: ui("Quốc gia"), required: true },
  { key: "description", label: ui("Giới thiệu"), type: "textarea" },
  {
    key: "products",
    label: ui("Ngành hàng"),
    help: ui("Phân cách bằng dấu phẩy"),
  },
  { key: "capacity", label: ui("Năng lực cung ứng") },
  {
    key: "public",
    label: ui("Cho phép hiển thị trong danh bạ"),
    type: "checkbox",
  },
];
async function save(d: any) {
  busy.value = true;
  notice.value = "";
  try {
    const payload = {
      ...d,
      products: String(d.products || "")
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean),
    };
    await request(
      org.value ? "/platform/organization" : "/platform/organizations",
      org.value ? "PATCH" : "POST",
      payload,
    );
    await loadOrganizations();
    notice.value = ui("Đã lưu hồ sơ");
    if (typeof route.query.rfq === 'string' && /^[a-f0-9]{24}$/.test(route.query.rfq)) await navigateTo('/workspace/rfqs/' + route.query.rfq);
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  } finally {
    busy.value = false;
  }
}
</script>
