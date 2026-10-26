<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">
      {{ ui("Ngân sách & chi phí agent") }}
    </h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Đơn vị ngân sách nội bộ theo biểu phí đã cấu hình, không phải hóa đơn USD của nhà cung cấp. Ngày ngân sách bắt đầu lúc 00:00 UTC.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="bg-amber-50 rounded-xl p-4 mb-5">
      {{ notice }}
    </p>
    <template v-if="!isAdmin">
      <div class="grid md:grid-cols-3 gap-4 mb-6">
        <article class="bg-white border rounded-xl p-5">
          <h2 class="text-sm text-slate-500">
            {{ ui("Hạn mức tổ chức mỗi ngày") }}
          </h2>
          <p class="text-2xl font-semibold mt-2">
            {{ summary?.dailyBudgetUnits ?? "—" }}
          </p>
        </article>
        <article class="bg-white border rounded-xl p-5">
          <h2 class="text-sm text-slate-500">
            {{ ui("Đã giữ và ghi nhận hôm nay") }}
          </h2>
          <p class="text-2xl font-semibold mt-2">
            {{ today?.allocatedUnits || 0 }}
          </p>
        </article>
        <article class="bg-white border rounded-xl p-5">
          <h2 class="text-sm text-slate-500">
            {{ ui("Đã đối soát hôm nay") }}
          </h2>
          <p class="text-2xl font-semibold mt-2">
            {{ today?.spentUnits || 0 }}
          </p>
        </article>
      </div>
      <div class="grid lg:grid-cols-2 gap-6 mb-6">
        <section
          v-if="summary?.canManageOrganizationBudget"
          class="bg-white border rounded-xl p-6"
        >
          <h2 class="font-semibold mb-4">
            {{ ui("Cấu hình hạn mức tổ chức") }}
          </h2>
          <WorkspaceForm
            :key="summary.dailyBudgetUnits"
            :fields="budgetFields"
            :initial="{ dailyBudgetUnits: summary.dailyBudgetUnits }"
            :submit-label="ui('Lưu hạn mức tổ chức')"
            @submit="saveOrganization"
          />
        </section>
        <section
          v-if="summary?.canManageAgents"
          class="bg-white border rounded-xl p-6"
        >
          <h2 class="font-semibold mb-4">{{ ui("Cấu hình hạn mức agent") }}</h2>
          <label for="agent-policy" class="block text-sm mb-2">Agent</label
          ><select
            id="agent-policy"
            v-model="agentId"
            class="rounded-lg border-slate-300 w-full mb-4"
          >
            <option value="">{{ ui("Chọn agent") }}</option>
            <option v-for="a in agents" :key="a._id" :value="a._id">
              {{ a.name }}
            </option></select
          ><WorkspaceForm
            v-if="selectedAgent"
            :key="`${selectedAgent._id}:${selectedAgent.dailyBudgetUnits}`"
            :fields="budgetFields"
            :initial="{ dailyBudgetUnits: selectedAgent.dailyBudgetUnits }"
            :submit-label="ui('Lưu hạn mức agent')"
            @submit="saveAgent"
          />
        </section>
      </div>
      <p class="text-sm text-slate-500 mb-5">
        {{
          ui(
            "Hạ hạn mức áp dụng cho yêu cầu mới; khoản đã giữ vẫn được theo dõi. Tạm dừng hoặc thu hồi agent để ngăn yêu cầu đã duyệt chưa thực thi.",
          )
        }}
      </p>
      <section class="bg-white border rounded-xl p-6 mb-6">
        <h2 class="font-semibold mb-4">
          {{ ui("Tổng tổ chức trong 31 ngày gần nhất") }}
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead>
              <tr class="border-b">
                <th class="p-3">{{ ui("Ngày UTC") }}</th>
                <th class="p-3">{{ ui("Đã phân bổ") }}</th>
                <th class="p-3">{{ ui("Đang giữ") }}</th>
                <th class="p-3">{{ ui("Đã đối soát") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in organizationDays" :key="d._id" class="border-b">
                <td class="p-3">{{ d.day }}</td>
                <td class="p-3">{{ d.allocatedUnits }}</td>
                <td class="p-3">{{ d.allocatedUnits - d.spentUnits }}</td>
                <td class="p-3">{{ d.spentUnits }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!organizationDays.length" class="text-sm text-slate-500 mt-3">
          {{ ui("Chưa có phát sinh ngân sách.") }}
        </p>
      </section>
    </template>
    <section
      v-if="reconcileItem"
      class="bg-white border border-amber-300 rounded-xl p-6 mb-6"
    >
      <h2 class="font-semibold mb-3">
        {{ ui("Đối soát khoản chưa rõ kết quả") }}
      </h2>
      <p class="text-sm text-slate-500 mb-4">
        {{
          ui(
            "Chỉ cập nhật sau khi có chứng từ hoặc usage đáng tin cậy. Chi phí ghi nhận không được vượt khoản đã giữ; không gọi lại model từ thao tác này.",
          )
        }}
      </p>
      <WorkspaceForm
        :key="reconcileItem._id"
        :fields="reconcileFields"
        :initial="{ chargedUnits: reconcileItem.reservedUnits }"
        :submit-label="ui('Ghi nhận đối soát')"
        @submit="reconcile"
      /><button class="text-sm underline mt-3" @click="reconcileItem = null">
        {{ ui("Đóng") }}
      </button>
    </section>
    <section class="bg-white border rounded-xl p-6">
      <div class="flex justify-between gap-3 mb-4">
        <h2 class="font-semibold">
          {{ ui("Lịch sử giữ và đối soát ngân sách") }}
        </h2>
        <button class="underline text-sm text-emerald-700" @click="load">
          {{ ui("Cập nhật") }}
        </button>
      </div>
      <p class="text-sm text-slate-500 mb-4">
        {{
          ui(
            isAdmin
              ? "Hiển thị tối đa 200 bản ghi mới nhất trên nền tảng."
              : "Hiển thị tối đa 100 bản ghi mới nhất của tổ chức.",
          )
        }}
      </p>
      <div class="overflow-x-auto">
        <table v-if="allocations.length" class="w-full text-left text-sm">
          <thead>
            <tr class="bg-slate-50">
              <th class="p-3">Agent</th>
              <th v-if="isAdmin" class="p-3">{{ ui("Tổ chức") }}</th>
              <th class="p-3">{{ ui("Ngày UTC") }}</th>
              <th class="p-3">{{ ui("Khoản giữ ban đầu") }}</th>
              <th class="p-3">{{ ui("Đã ghi nhận") }}</th>
              <th class="p-3">{{ ui("Trạng thái") }}</th>
              <th class="p-3">{{ ui("Thao tác") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in allocations" :key="r._id" class="border-t">
              <td class="p-3">{{ r.agent?.name }}</td>
              <td v-if="isAdmin" class="p-3">{{ r.organization?.name }}</td>
              <td class="p-3 whitespace-nowrap">{{ r.day }}</td>
              <td class="p-3">{{ r.reservedUnits }}</td>
              <td class="p-3">{{ r.chargedUnits ?? "—" }}</td>
              <td class="p-3">{{ ui(stateLabels[r.state] || r.state) }}</td>
              <td class="p-3">
                <button
                  v-if="isAdmin && r.state === 'unknown'"
                  class="text-emerald-700 underline"
                  @click="reconcileItem = r"
                >
                  {{ ui("Đối soát bằng chứng") }}</button
                ><span v-else>—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!allocations.length" class="text-sm text-slate-500">
        {{ ui("Chưa có phát sinh ngân sách.") }}
      </p>
      <p class="text-sm text-slate-500 mt-5">
        {{
          ui(
            "Khoản chưa rõ kết quả vẫn chiếm hạn mức. Yêu cầu chờ duyệt qua ngày UTC được hủy và trả ngân sách trước khi gọi nhà cung cấp.",
          )
        }}
      </p>
    </section>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: "workspace", middleware: "auth" });
const { ui } = useWorkspaceText();
const { request } = usePlatform();
const { user } = useAuth();
const isAdmin = computed(() => user.value?.role === "Admin");
const summary = ref<any>(null);
const allocations = ref<any[]>([]);
const agents = ref<any[]>([]);
const agentId = ref("");
const notice = ref("");
const reconcileItem = ref<any>(null);
const today = computed(() =>
  summary.value?.days.find(
    (d: any) =>
      d.scope === "organization" &&
      d.day === new Date().toISOString().slice(0, 10),
  ),
);
const organizationDays = computed(
  () =>
    summary.value?.days.filter((d: any) => d.scope === "organization") || [],
);
const selectedAgent = computed(() =>
  agents.value.find((a) => a._id === agentId.value),
);
const budgetFields = computed(() => [
  {
    key: "dailyBudgetUnits",
    label: ui("Hạn mức mỗi ngày UTC"),
    type: "number",
    required: true,
    help: ui("Số nguyên từ 0 đến 1000000. Đặt 0 để chặn phân bổ mới."),
  },
]);
const reconcileFields = computed(() => [
  {
    key: "chargedUnits",
    label: ui("Đơn vị chi phí được xác nhận"),
    type: "number",
    required: true,
  },
  {
    key: "evidenceHash",
    label: ui("SHA256 chứng từ hoặc usage đã kiểm tra"),
    required: true,
  },
  {
    key: "reason",
    label: ui("Lý do đối soát"),
    type: "textarea",
    required: true,
  },
]);
const stateLabels: Record<string, string> = {
  reserved: "Đang giữ",
  settled: "Đã đối soát",
  released: "Đã trả ngân sách",
  unknown: "Chưa rõ kết quả",
};
async function load() {
  try {
    if (isAdmin.value)
      allocations.value = await request("/agent-costs/admin/allocations");
    else {
      summary.value = await request("/agent-costs/summary");
      allocations.value = summary.value.allocations;
      agents.value = await request("/platform/agents");
    }
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function saveOrganization(d: any) {
  try {
    await request("/agent-costs/policy", "PATCH", {
      dailyBudgetUnits: Number(d.dailyBudgetUnits),
    });
    await load();
    notice.value = ui("Đã cập nhật hạn mức ngân sách.");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function saveAgent(d: any) {
  try {
    await request(`/agent-costs/agents/${agentId.value}/policy`, "PATCH", {
      dailyBudgetUnits: Number(d.dailyBudgetUnits),
    });
    await load();
    notice.value = ui("Đã cập nhật hạn mức ngân sách.");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function reconcile(d: any) {
  try {
    await request(
      `/agent-costs/admin/allocations/${reconcileItem.value._id}/reconcile`,
      "POST",
      { ...d, chargedUnits: Number(d.chargedUnits) },
    );
    reconcileItem.value = null;
    await load();
    notice.value = ui("Đã ghi nhận đối soát có bằng chứng.");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
</script>
