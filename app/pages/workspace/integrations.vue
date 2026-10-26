<template>
  <div class="max-w-5xl">
    <h1 class="text-2xl font-semibold mb-2">
      {{ ui("Tích hợp và SDK đối tác") }}
    </h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Cấp token riêng cho tổ chức. Token này không có quyền ký ví hoặc chuyển tiền.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="bg-amber-50 p-3 rounded-lg mb-5">
      {{ notice }}
    </p>
    <section
      v-if="newToken"
      class="bg-white border border-emerald-400 rounded-xl p-6 mb-6"
    >
      <h2 class="font-semibold">{{ ui("Token mới") }}</h2>
      <p class="text-sm text-slate-500 mt-2">
        {{
          ui(
            "Lưu token vào secret manager của đối tác. Hệ thống chỉ trả giá trị tại thời điểm cấp.",
          )
        }}
      </p>
      <textarea
        readonly
        :value="newToken"
        class="w-full text-xs font-mono rounded-lg border-slate-300 mt-4"
        rows="5"
        :aria-label="ui('Token SDK mới')"
      /><button class="text-sm underline mt-3" @click="newToken = ''">
        {{ ui("Đã lưu và ẩn") }}
      </button>
    </section>
    <div class="grid md:grid-cols-2 gap-6">
      <section class="bg-white border p-6 rounded-xl">
        <h2 class="font-semibold mb-4">{{ ui("Cấp quyền truy cập") }}</h2>
        <WorkspaceForm :fields="fields" @submit="create" />
      </section>
      <section class="bg-white border p-6 rounded-xl">
        <h2 class="font-semibold mb-4">{{ ui("Client đang quản lý") }}</h2>
        <article v-for="c in clients" :key="c._id" class="py-4 border-t">
          <p class="font-medium">
            {{ c.name }} ·
            {{ c.revoked ? ui("Đã thu hồi") : ui("Đang hiệu lực") }}
          </p>
          <p class="text-xs text-slate-500 mt-2">{{ c.scopes.join(", ") }}</p>
          <p class="text-xs text-slate-500 mt-2">
            {{ ui("Hết hạn") }}
            {{ new Date(c.expiresAt).toLocaleString("vi-VN") }}
          </p>
          <button
            v-if="!c.revoked"
            class="text-red-700 underline text-sm mt-3"
            @click="revoke(c)"
          >
            {{ ui("Thu hồi ngay") }}
          </button>
        </article>
        <p v-if="!clients.length" class="text-sm text-slate-500">
          {{ ui("Chưa cấp client.") }}
        </p>
      </section>
    </div>
    <section class="bg-white border p-6 rounded-xl mt-6">
      <h2 class="font-semibold mb-4">{{ ui("Các khả năng SDK") }}</h2>
      <ul class="text-sm text-slate-600 space-y-3">
        <li>{{ ui("KYB SDK đọc trạng thái hồ sơ được phép xem.") }}</li>
        <li>
          {{
            ui(
              "Order Notification SDK đọc sự kiện RFQ, báo giá và hợp đồng của tổ chức.",
            )
          }}
        </li>
        <li>
          {{
            ui(
              "MCP dùng endpoint /api/integrations/mcp với token có scope tương ứng.",
            )
          }}
        </li>
      </ul>
    </section>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request } = usePlatform();
const notice = ref("");
const clients = ref<any[]>([]);
const newToken = ref("");
const fields = [
  { key: "name", label: ui("Tên ứng dụng đối tác"), required: true },
  {
    key: "scopes",
    label: ui("Quyền được cấp"),
    help: ui("Phân cách dấu phẩy: kyb:read, rfq:read, notifications:read"),
    required: true,
  },
  {
    key: "expiresAt",
    label: ui("Hiệu lực đến tối đa 30 ngày"),
    type: "datetime-local",
    required: true,
  },
];
async function load() {
  try {
    clients.value = await request("/integrations/clients");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function create(d: any) {
  try {
    const r = await request("/integrations/clients", "POST", {
      ...d,
      scopes: String(d.scopes)
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      expiresAt: new Date(d.expiresAt).toISOString(),
    });
    newToken.value = r.token;
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function revoke(c: any) {
  try {
    await request(`/integrations/clients/${c._id}`, "DELETE");
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
</script>
