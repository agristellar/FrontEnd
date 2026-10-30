<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">{{ ui(config.title) }}</h1>
    <p class="text-slate-500 mb-6">{{ ui(config.description) }}</p>
    <p
      v-if="notice"
      role="status"
      class="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg"
    >
      {{ notice }}
    </p>
    <div class="grid xl:grid-cols-3 gap-6">
      <section
        v-if="config.fields?.length"
        class="bg-white rounded-xl border p-6"
      >
        <h2 class="font-semibold mb-5">
          {{ ui(config.formTitle || ui("Tạo mới")) }}
        </h2>
        <WorkspaceForm
          :key="section"
          :fields="config.fields"
          :busy="busy"
          :initial="config.initial || {}"
          @submit="save"
        />
      </section>
      <section
        class="bg-white rounded-xl border p-6 min-w-0"
        :class="config.fields?.length ? 'xl:col-span-2' : 'xl:col-span-3'"
      >
        <div class="flex justify-between mb-4">
          <h2 class="font-semibold">
            {{ ui(config.listTitle || ui("Danh sách")) }}
          </h2>
          <button class="text-sm underline text-emerald-700" @click="load">
            {{ ui("Cập nhật") }}
          </button>
        </div>
        <div v-if="section === 'settings'">
          <NuxtLink
            to="/workspace/members"
            class="text-emerald-700 underline"
            >{{ ui("Quản lý thành viên và quyền") }}</NuxtLink
          >
          <div class="mt-6 border-t pt-5">
            <h2 class="font-semibold mb-4">{{ ui("Cấu hình thông báo") }}</h2>
            <WorkspaceForm
              :fields="preferenceFields"
              :initial="preferences"
              :submit-label="ui('Lưu thông báo')"
              @submit="savePreferences"
            />
          </div>
          <button class="block mt-5 text-sm underline" @click="logout">
            {{ ui("Đăng xuất") }}
          </button>
        </div>
        <div v-else-if="section === 'reports'" class="space-y-4">
          <details class="border rounded-lg p-4">
            <summary class="font-medium cursor-pointer">
              {{ ui("Bộ lọc báo cáo nâng cao") }}
            </summary>
            <WorkspaceForm
              class="mt-4"
              :fields="reportFields"
              :submit-label="ui('Áp dụng bộ lọc')"
              @submit="filterReport"
            />
            <button class="text-sm underline mt-3" @click="load">
              {{ ui("Xem toàn bộ giao dịch") }}
            </button>
          </details>
          <details class="border rounded-lg p-4">
            <summary class="font-medium cursor-pointer">
              {{ ui("Phân tích biến động giá cùng điều kiện") }}
            </summary>
            <div class="mt-4">
              <WorkspaceForm
                :fields="historyFields"
                :submit-label="ui('Xem chuỗi giá')"
                @submit="loadHistory"
              />
            </div>
            <div v-if="history" class="mt-5">
              <p class="font-medium">
                {{ history.points.length }} {{ ui("mốc giá · thay đổi") }}
                {{ history.changePercent ?? "—" }}%
              </p>
              <p class="text-xs text-slate-500 mt-2">
                {{
                  ui(
                    "Cùng sản phẩm, thị trường, tiền tệ, đơn vị và Incoterm. Không quy đổi tỷ giá.",
                  )
                }}
              </p>
              <svg
                v-if="history.points.length > 1"
                viewBox="0 0 800 220"
                role="img"
                :aria-label="ui('Đồ thị lịch sử giá')"
                class="w-full my-4"
              >
                <line x1="30" y1="190" x2="770" y2="190" stroke="#cbd5e1" />
                <polyline
                  :points="historyCurve"
                  fill="none"
                  stroke="#047857"
                  stroke-width="3"
                />
              </svg>
              <p v-for="p in history.points" :key="p._id" class="text-sm mt-2">
                {{ formatDate(p.effectiveAt) }} · {{ p.price }}
                {{ p.currency }}/{{ p.unit }} ·
                <a
                  :href="p.source"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline text-emerald-700"
                  >{{ ui("Nguồn") }}</a
                >
              </p>
            </div>
          </details>
          <div
            v-for="(totals, asset) in report?.totals"
            :key="asset"
            class="border rounded-lg p-4"
          >
            <h3 class="font-semibold">{{ asset }}</h3>
            <dl class="grid sm:grid-cols-2 gap-3 mt-3">
              <div v-for="(v, k) in totals" :key="k">
                <dt class="text-xs text-slate-500">
                  {{ ui(labels[String(k)] || k) }}
                </dt>
                <dd class="font-medium">{{ v }}</dd>
              </div>
            </dl>
          </div>
          <p class="text-sm text-slate-500">
            {{ ui("Số hợp đồng") }} {{ report?.trades || 0 }}
            {{ ui("· Cập nhật") }}
            {{ formatDate(report?.generatedAt) }}
          </p>
          <a
            :href="downloadUrl"
            download="agristellar-report.json"
            class="inline-block text-emerald-700 underline text-sm"
            >{{ ui("Tải báo cáo") }}</a
          >
          <form
            class="flex flex-wrap gap-2 pt-4 border-t"
            @submit.prevent="loadPrices"
          >
            <input
              v-model="priceProduct"
              :placeholder="ui('Sản phẩm cần xem giá')"
              class="rounded-lg border-slate-300"
              required
              :aria-label="ui('Sản phẩm')"
            /><button class="bg-emerald-700 text-white px-4 rounded-lg">
              {{ ui("Tra giá") }}
            </button>
          </form>
          <div v-for="p in prices" :key="p._id" class="border-t py-3 text-sm">
            <p>
              {{ p.product }} · {{ p.price }} {{ p.currency }}/{{ p.unit }} ·
              {{ p.incoterm }}
            </p>
            <p class="text-slate-500">
              {{ p.market }} · {{ formatDate(p.effectiveAt) }}
            </p>
            <a
              :href="p.source"
              target="_blank"
              rel="noopener noreferrer"
              class="text-emerald-700 underline"
              >{{ ui("Nguồn dữ liệu") }}</a
            >
          </div>
          <p
            v-if="priceSearched && !prices.length"
            class="text-sm text-slate-500"
          >
            {{ ui("Chưa có dữ liệu giá có nguồn cho sản phẩm này.") }}
          </p>
        </div>
        <div v-else class="overflow-x-auto">
          <table v-if="items.length" class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th
                  v-for="c in config.columns"
                  :key="c.key"
                  class="px-3 py-3 font-medium"
                >
                  {{ ui(c.label) }}
                </th>
                <th class="px-3 py-3">{{ ui("Thao tác") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item._id" class="border-t">
                <td
                  v-for="c in config.columns"
                  :key="c.key"
                  class="px-3 py-4 max-w-80 break-words"
                >
                  <ProductPhoto v-if="section === 'products' && c.key === 'name'" :image-id="item.imageId" :name="item.name" photo-class="w-20 h-20 rounded-lg mb-2 border border-slate-100" />
                  {{ cell(item, c.key) }}
                </td>
                <td class="px-3 py-4">
                  <button
                    v-if="section === 'notifications' && !item.readAt"
                    class="text-emerald-700 underline"
                    @click="act(`/platform/notifications/${item._id}/read`, {})"
                  >
                    {{ ui("Đã đọc") }}
                  </button>
                  <div v-if="section === 'agents'" class="flex flex-col gap-2">
                    <button
                      class="text-emerald-700 underline"
                      @click="runAgent(item)"
                    >
                      {{ ui("Chạy tìm kiếm đối tác") }}</button
                    ><button
                      class="text-amber-700 underline"
                      @click="
                        act(`/platform/agents/${item._id}/control`, {
                          state: item.state === 'active' ? 'paused' : 'active',
                        })
                      "
                    >
                      {{
                        item.state === "active" ? ui("Tạm dừng") : ui("Bật")
                      }}</button
                    ><button
                      class="text-red-700 underline"
                      @click="
                        act(`/platform/agents/${item._id}/control`, {
                          state: 'revoked',
                        })
                      "
                    >
                      {{ ui("Thu hồi") }}
                    </button>
                  </div>
                  <button
                    v-if="section === 'members' && item.role !== 'owner'"
                    class="text-red-700 underline"
                    @click="removeMember(item)"
                  >
                    {{ ui("Thu hồi quyền") }}</button
                  ><button
                    v-if="section === 'services'"
                    class="text-emerald-700 underline"
                    @click="act('/platform/subscriptions', { plan: item._id })"
                  >
                    {{ ui("Đăng ký gói") }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-sm text-slate-500 py-8 text-center">
            {{ ui("Chưa có dữ liệu.") }}
          </p>
        </div>
      </section>
    </div>
    <section v-if="agentResult" class="bg-white border rounded-xl p-6 mt-6">
      <h2 class="font-semibold">{{ ui("Kết quả agent") }}</h2>
      <p class="text-sm mt-2">
        {{ agentResult.state }} {{ ui("· Chi phí nội bộ") }}
        {{ agentResult.costUnits }} {{ ui("đơn vị") }}
      </p>
      <ul class="mt-4 space-y-2">
        <li v-for="r in parsedAgent" :key="r._id" class="border-t py-2 text-sm">
          {{ r.name }} · {{ r.kind }} · Level {{ r.tier }}
        </li>
      </ul>
    </section>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const route = useRoute();
const section = computed(() => String(route.params.section));
const { request } = usePlatform();
const { logout } = useAuth();
const items = ref<any[]>([]);
const report = ref<any>(null);
const reportFields = [
  { key: "from", label: ui("Từ ngày"), type: "datetime-local" },
  { key: "to", label: ui("Đến ngày"), type: "datetime-local" },
  { key: "asset", label: ui("Tài sản"), options: ["XLM", "USDC"] },
  {
    key: "state",
    label: ui("Trạng thái"),
    options: [
      "draft",
      "offered",
      "accepted",
      "chain_requested",
      "active",
      "disputed",
      "settled",
      "cancelled",
    ],
  },
];
async function filterReport(data: Record<string, string>) {
  try {
    const filters = Object.fromEntries(
      Object.entries(data).filter(([, v]) => !!v),
    );
    for (const key of ["from", "to"])
      if (filters[key]) filters[key] = new Date(filters[key]).toISOString();
    report.value = await request(
      `/platform/reports?${new URLSearchParams(filters)}`,
    );
    notice.value = "";
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
const notice = ref("");
const preferences = ref<any>({
  email: false,
  orders: true,
  messages: true,
  language: "vi",
});
const preferenceFields = [
  { key: "email", label: ui("Thông báo qua email"), type: "checkbox" },
  { key: "orders", label: ui("Cập nhật giao dịch"), type: "checkbox" },
  { key: "messages", label: ui("Tin nhắn cộng tác"), type: "checkbox" },
  {
    key: "language",
    label: ui("Ngôn ngữ thông báo"),
    options: [
      { value: "vi", label: ui("Tiếng Việt") },
      { value: "en", label: "English" },
    ],
    required: true,
  },
];
async function savePreferences(d: any) {
  try {
    preferences.value = await request("/platform/preferences", "PUT", {
      email: !!d.email,
      orders: !!d.orders,
      messages: !!d.messages,
      language: d.language,
    });
    notice.value = ui("Đã lưu cấu hình thông báo");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
const busy = ref(false);
const agentResult = ref<any>(null);
const priceProduct = ref("");
const prices = ref<any[]>([]);
const history = ref<any>(null);
const historyFields = [
  { key: "product", label: ui("Sản phẩm"), required: true },
  { key: "market", label: ui("Thị trường"), required: true },
  { key: "unit", label: ui("Đơn vị"), required: true },
  { key: "currency", label: ui("Tiền tệ"), required: true },
  { key: "incoterm", label: "Incoterm", required: true },
];
const historyCurve = computed(() => {
  const points = history.value?.points || [];
  if (points.length < 2) return "";
  const unit = (s: string) => {
    const [w, f = ""] = s.split(".");
    return BigInt(w) * 10000000n + BigInt(f.padEnd(7, "0"));
  };
  const values = points.map((p: any) => unit(p.price));
  const min = values.reduce((a: bigint, b: bigint) => (a < b ? a : b));
  const max = values.reduce((a: bigint, b: bigint) => (a > b ? a : b));
  return values
    .map(
      (v: bigint, i: number) =>
        `${30 + (i * 740) / (values.length - 1)},${max === min ? 110 : 190 - Number(((v - min) * 16000n) / (max - min)) / 100}`,
    )
    .join(" ");
});
async function loadHistory(d: any) {
  try {
    history.value = await request(
      `/platform/prices/history?${new URLSearchParams(d)}`,
    );
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
const priceSearched = ref(false);
const labels: Record<string, string> = {
  contracted: ui("Giá trị hợp đồng"),
  deposited: ui("Đã nạp escrow"),
  released: ui("Đã giải ngân"),
  refunded: ui("Đã hoàn tiền"),
};
const dictionary: Record<string, any> = {
  delegations: {
    title: ui("Registry ủy quyền agent"),
    description: ui(
      "Lịch sử ý định ủy quyền và trạng thái ledger. Quyền hiện tại phải đọc từ contract của từng hợp đồng hoặc phiên đấu giá.",
    ),
    endpoint: "/platform/agent-contracts",
    columns: [
      { key: "type", label: "Contract" },
      { key: "agent", label: "Agent" },
      { key: "action", label: ui("Thao tác") },
      { key: "limit", label: ui("Hạn mức") },
      { key: "intent.status", label: "Ledger" },
    ],
  },
  products: {
    title: ui("Danh mục sản phẩm"),
    description: ui("Quản lý sản phẩm và mức công bố cho buyer."),
    endpoint: "/platform/products",
    fields: [
      { key: "name", label: ui("Tên sản phẩm"), required: true },
      { key: "imageId", label: ui("Ảnh sản phẩm"), type: "product-image" },
      { key: "category", label: ui("Ngành hàng") },
      { key: "description", label: ui("Mô tả"), type: "textarea" },
      { key: "unit", label: ui("Đơn vị"), required: true },
      {
        key: "minimumQuantity",
        label: ui("Số lượng tối thiểu"),
        required: true,
      },
      { key: "origin", label: ui("Xuất xứ") },
      { key: "public", label: ui("Công khai"), type: "checkbox" },
    ],
    columns: [
      { key: "name", label: ui("Sản phẩm") },
      { key: "unit", label: ui("Đơn vị") },
      { key: "minimumQuantity", label: ui("Tối thiểu") },
      { key: "public", label: ui("Công khai") },
    ],
  },
  leads: {
    title: ui("Đối tác tiềm năng"),
    description: ui("Lưu đối tác từ danh bạ và theo dõi cơ hội thương mại."),
    endpoint: "/platform/leads",
    columns: [
      { key: "target.name", label: ui("Đối tác") },
      { key: "target.kind", label: ui("Vai trò") },
      { key: "stage", label: ui("Giai đoạn") },
      { key: "notes", label: ui("Ghi chú") },
    ],
  },
  complaints: {
    title: ui("Khiếu nại"),
    description: ui(
      "Gửi và theo dõi xử lý. Khiếu nại nghiệp vụ được tách với thao tác khóa tiền trên escrow.",
    ),
    endpoint: "/platform/complaints",
    fields: [
      { key: "title", label: ui("Tiêu đề"), required: true },
      {
        key: "body",
        label: ui("Mô tả và bằng chứng"),
        type: "textarea",
        required: true,
      },
      { key: "trade", label: ui("Mã hợp đồng liên quan") },
    ],
    columns: [
      { key: "title", label: ui("Tiêu đề") },
      { key: "state", label: ui("Trạng thái") },
      { key: "resolution", label: ui("Phản hồi") },
    ],
  },
  notifications: {
    title: ui("Thông báo"),
    description: ui("Thông báo thuộc tài khoản của bạn."),
    endpoint: "/platform/notifications",
    columns: [
      { key: "title", label: ui("Tiêu đề") },
      { key: "body", label: ui("Nội dung") },
      { key: "readAt", label: ui("Đã đọc lúc") },
    ],
  },
  members: {
    title: ui("Thành viên & phân quyền"),
    description: ui(
      "Mời tài khoản đã đăng ký. Quyền được kiểm tra tại API theo từng tổ chức.",
    ),
    endpoint: "/platform/members",
    fields: [
      {
        key: "email",
        label: ui("Email thành viên"),
        type: "email",
        required: true,
      },
      {
        key: "role",
        label: ui("Vai trò"),
        required: true,
        options: ["manager", "trader", "viewer"],
      },
    ],
    columns: [
      { key: "user.email", label: "Email" },
      { key: "role", label: ui("Vai trò") },
      { key: "active", label: ui("Đang hoạt động") },
    ],
  },
  services: {
    title: ui("Gói dịch vụ"),
    description: ui(
      "Yêu cầu đăng ký gói. Admin kích hoạt sau khi kiểm tra điều kiện thanh toán.",
    ),
    endpoint: "/platform/content/plan",
    columns: [
      { key: "title", label: ui("Gói dịch vụ") },
      { key: "body", label: ui("Quyền lợi") },
      { key: "price", label: ui("Giá") },
      { key: "currency", label: ui("Tiền tệ") },
    ],
  },
  agents: {
    title: ui("AI agent có kiểm soát"),
    description: ui(
      "Cấp quyền công cụ, hạn mức và thời hạn. Các công cụ hiện tại dùng quy tắc xác định; không tự ký hoặc chuyển tiền.",
    ),
    endpoint: "/platform/agents",
    fields: [
      { key: "name", label: ui("Tên agent"), required: true },
      {
        key: "publicKey",
        label: ui("Khóa công khai Stellar của agent"),
        required: true,
      },
      {
        key: "tools",
        label: ui("Công cụ cho phép"),
        help: ui(
          "Phân cách bằng dấu phẩy. directory.search, kyb.status, rfq.list, quote.draft, contract.review, language.draft",
        ),
        required: true,
      },
      {
        key: "budgetUnits",
        label: ui("Ngân sách nội bộ"),
        type: "number",
        required: true,
      },
      {
        key: "dailyBudgetUnits",
        label: ui("Hạn mức mỗi ngày UTC"),
        type: "number",
        required: true,
      },
      {
        key: "maxPerRun",
        label: ui("Tối đa mỗi lần chạy"),
        type: "number",
        required: true,
      },
      {
        key: "expiresAt",
        label: ui("Hiệu lực đến"),
        type: "datetime-local",
        required: true,
      },
      { key: "model", label: ui("Model hoặc engine"), required: true },
    ],
    initial: {
      tools: "directory.search, kyb.status, rfq.list",
      budgetUnits: 100,
      dailyBudgetUnits: 100,
      maxPerRun: 10,
      model: "rules-v1",
    },
    columns: [
      { key: "name", label: "Agent" },
      { key: "state", label: ui("Trạng thái") },
      { key: "spentUnits", label: ui("Đã phân bổ") },
      { key: "budgetUnits", label: ui("Hạn mức") },
    ],
  },
  reports: {
    title: ui("Báo cáo & giá thị trường"),
    description: ui(
      "Tổng hợp riêng từng tài sản; không cộng USDC với XLM hoặc tự giả định tỷ giá.",
    ),
    endpoint: "/platform/reports",
    columns: [],
  },
  settings: {
    title: ui("Bảo mật tài khoản"),
    description: ui("Đổi mật khẩu sẽ thu hồi các phiên đăng nhập hiện có."),
    fields: [
      {
        key: "currentPassword",
        label: ui("Mật khẩu hiện tại"),
        type: "password",
        required: true,
      },
      {
        key: "newPassword",
        label: ui("Mật khẩu mới"),
        type: "password",
        required: true,
      },
    ],
    columns: [],
  },
};
const config = computed(
  () =>
    dictionary[section.value] || {
      title: ui("Không tìm thấy tính năng"),
      description: ui("Chọn tính năng từ menu."),
      columns: [],
    },
);
const parsedAgent = computed(() => {
  try {
    const d = JSON.parse(agentResult.value?.result || "[]");
    return Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
});
const formatDate = (v: any) => (v ? new Date(v).toLocaleString("vi-VN") : "—");
const downloadUrl = computed(
  () =>
    `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report.value, null, 2))}`,
);
function cell(item: any, key: string) {
  const v = key.split(".").reduce((o, k) => o?.[k], item);
  return typeof v === "boolean" ? (v ? ui("Có") : ui("Không")) : v || "—";
}
async function load() {
  notice.value = "";
  try {
    if (section.value === "settings")
      preferences.value =
        (await request("/platform/preferences")) || preferences.value;
    if (!config.value.endpoint) return;
    const d = await request(config.value.endpoint);
    if (section.value === "reports") report.value = d;
    else items.value = d;
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function save(data: any) {
  busy.value = true;
  try {
    const d = { ...data };
    for (const key of Object.keys(d))
      if (d[key] === "" || d[key] === undefined) delete d[key];
    if (section.value === "agents") {
      d.tools = String(d.tools)
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean);
      d.budgetUnits = Number(d.budgetUnits);
      d.dailyBudgetUnits = Number(d.dailyBudgetUnits);
      d.maxPerRun = Number(d.maxPerRun);
      d.expiresAt = new Date(d.expiresAt).toISOString();
    }
    if (section.value === "settings") {
      await request("/auth/change-password", "POST", d);
      await logout();
      return;
    }
    await request(config.value.endpoint, "POST", d);
    await load();
    notice.value = ui("Đã lưu");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  } finally {
    busy.value = false;
  }
}
async function act(path: string, body: any) {
  try {
    await request(path, "POST", body);
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function removeMember(item: any) {
  try {
    await request(`/platform/members/${item._id}`, "DELETE");
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function runAgent(item: any) {
  try {
    agentResult.value = await request(
      `/platform/agents/${item._id}/runs`,
      "POST",
      {
        tool: "directory.search",
        input: { query: "" },
        key: crypto.randomUUID(),
      },
    );
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function loadPrices() {
  try {
    prices.value = await request(
      `/platform/prices?product=${encodeURIComponent(priceProduct.value)}`,
    );
    priceSearched.value = true;
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
watch(section, () => {
  items.value = [];
  load();
});
</script>
