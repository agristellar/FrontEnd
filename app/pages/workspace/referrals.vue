<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">
      {{ ui("Điều phối giới thiệu") }}
    </h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Theo dõi giới thiệu giữa buyer và supplier. Hai tổ chức phải đồng ý trước khi điều phối viên xác nhận giới thiệu.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="bg-amber-50 p-4 rounded-xl mb-5">
      {{ notice }}
    </p>
    <div class="grid lg:grid-cols-3 gap-6">
      <section
        v-if="user?.role === 'Admin'"
        class="bg-white border rounded-xl p-6"
      >
        <h2 class="font-semibold mb-4">{{ ui("Giao điều phối viên") }}</h2>
        <WorkspaceForm :fields="fields" @submit="assign" />
      </section>
      <section
        class="space-y-4"
        :class="user?.role === 'Admin' ? 'lg:col-span-2' : 'lg:col-span-3'"
      >
        <article
          v-for="a in assignments"
          :key="a._id"
          class="bg-white border rounded-xl p-5"
        >
          <h2 class="font-semibold">
            {{ a.supplier?.name }} → {{ a.buyer?.name }}
          </h2>
          <p class="text-sm text-slate-500 mt-2">
            {{ ui("Trạng thái") }}: {{ a.state }} ·
            {{ ui("Số bên đã đồng ý") }}: {{ a.approvedOrganizations.length }}/2
          </p>
          <p v-if="a.rewardTerms" class="text-sm mt-3">
            {{ ui("Điều kiện thù lao") }}: {{ a.rewardTerms }}
          </p>
          <p v-if="a.notes" class="text-sm whitespace-pre-wrap mt-3">
            {{ ui("Ghi chú nội bộ") }}: {{ a.notes }}
          </p>
          <div
            v-if="user?.role!=='Admin' &amp;&amp; organization &amp;&amp; [a.supplier?._id,a.buyer?._id].includes(organization._id) &amp;&amp; !['won','closed'].includes(a.state)"
            class="flex gap-4 my-4"
          >
            <button
              class="underline text-emerald-700 text-sm"
              @click="consent(a, true)"
            >
              {{ ui("Đồng ý giới thiệu") }}</button
            ><button
              class="underline text-red-700 text-sm"
              @click="consent(a, false)"
            >
              {{ ui("Rút đồng ý") }}
            </button>
          </div>
          <details
            v-if="
              String(a.coordinator?._id || a.coordinator) ===
              String(user?._id || user?.id)
            "
            class="mt-4 border-t pt-4"
          >
            <summary class="cursor-pointer text-sm font-medium">
              {{ ui("Cập nhật tiến độ điều phối") }}
            </summary>
            <div class="mt-4">
              <WorkspaceForm
                :fields="progressFields"
                @submit="progress(a, $event)"
              />
            </div>
          </details>
        </article>
        <p
          v-if="!assignments.length"
          class="p-8 text-slate-500 bg-white border rounded-xl"
        >
          {{ ui("Chưa có phân công giới thiệu.") }}
        </p>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: "workspace", middleware: "auth" });
const { ui } = useWorkspaceText();
const { request, organization } = usePlatform();
const { user } = useAuth();
const assignments = ref<any[]>([]);
const coordinators = ref<any[]>([]);
const organizations = ref<any[]>([]);
const notice = ref("");
const fields = computed(() => [
  {
    key: "coordinator",
    label: ui("Điều phối viên"),
    options: coordinators.value.map((u) => ({
      value: u._id,
      label: u.fullName || u.email,
    })),
    required: true,
  },
  {
    key: "supplier",
    label: "Supplier",
    options: organizations.value
      .filter((o) => o.kind === "Supplier")
      .map((o) => ({ value: o._id, label: o.name })),
    required: true,
  },
  {
    key: "buyer",
    label: "Buyer",
    options: organizations.value
      .filter((o) => o.kind === "Buyer")
      .map((o) => ({ value: o._id, label: o.name })),
    required: true,
  },
  {
    key: "rewardTerms",
    label: ui("Điều kiện thù lao"),
    type: "textarea",
    help: ui(
      "Chỉ ghi điều kiện đã thỏa thuận. Không tự động ghi nhận hoặc chuyển thù lao.",
    ),
  },
]);
const progressFields = computed(() => [
  {
    key: "state",
    label: ui("Trạng thái"),
    options: [
      { value: "contacted", label: ui("Đã liên hệ") },
      { value: "qualified", label: ui("Đã đánh giá phù hợp") },
      { value: "introduced", label: ui("Đã giới thiệu") },
      { value: "won", label: ui("Đã có kết quả") },
      { value: "closed", label: ui("Đóng") },
    ],
    required: true,
  },
  { key: "notes", label: ui("Ghi chú nội bộ"), type: "textarea" },
  { key: "closedReason", label: ui("Lý do đóng") },
]);
async function load() {
  try {
    assignments.value = await request(
      user.value?.role === "Admin"
        ? "/referrals/admin/assignments"
        : "/referrals/assignments",
    );
    if (user.value?.role === "Admin") {
      [coordinators.value, organizations.value] = await Promise.all([
        request("/referrals/admin/coordinators"),
        request("/referrals/admin/organizations"),
      ]);
    }
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function assign(d: any) {
  try {
    await request("/referrals/admin/assignments", "POST", {
      ...d,
      key: crypto.randomUUID(),
    });
    await load();
    notice.value = ui("Đã cập nhật");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function consent(a: any, approved: boolean) {
  try {
    await request(`/referrals/assignments/${a._id}/consent`, "POST", {
      approved,
    });
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function progress(a: any, d: any) {
  try {
    if (!d.closedReason) delete d.closedReason;
    await request(`/referrals/assignments/${a._id}/progress`, "POST", d);
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
</script>
