<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">{{ ui("Quản trị nền tảng") }}</h1>
    <p class="text-slate-500 mb-6">
      {{
        ui("Duyệt hồ sơ, điều khoản on-chain, dịch vụ và đối soát tích hợp.")
      }}
    </p>
    <p
      v-if="notice"
      role="status"
      class="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-5"
    >
      {{ notice }}
    </p>
    <nav class="flex flex-wrap gap-2 mb-6" :aria-label="ui('Các mục quản trị')">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="px-3 py-2 rounded-lg text-sm border"
        :class="
          tab === t.key
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-white'
        "
        @click="
          tab = t.key;
          load();
        "
      >
        {{ ui(t.label) }}
      </button>
    </nav>
    <OrderManagement v-if="tab === 'buyer-orders' || tab === 'supplier-orders'" :key="tab" :kind="tab === 'buyer-orders' ? 'Buyer' : 'Supplier'" />
    <div
      v-else-if="['overview', 'operations', 'revenue'].includes(tab)"
      class="grid md:grid-cols-3 gap-4"
    >
      <article
        v-for="(v, k) in summary"
        :key="k"
        class="bg-white border rounded-xl p-5"
      >
        <h2 class="text-sm text-slate-500">
          {{ ui(headings[String(k)] || k) }}
        </h2>
        <p class="font-semibold mt-3 break-words">{{ v }}</p>
      </article>
    </div>
    <div v-else class="grid xl:grid-cols-3 gap-6">
      <div v-if="tab === 'backups'" class="xl:col-span-3">
        <button
          class="bg-emerald-700 text-white px-4 py-2 rounded-lg"
          @click="act('/platform/admin/backups', {})"
        >
          {{ ui("Yêu cầu sao lưu mã hóa") }}
        </button>
        <p class="text-sm mt-2 text-slate-500">
          {{
            ui(
              "Worker sao lưu xử lý riêng. Bản lưu cần khóa giải mã được quản lý ngoài hệ thống.",
            )
          }}
        </p>
      </div>
      <section v-if="formFields.length" class="bg-white border rounded-xl p-6">
        <h2 class="font-semibold mb-4">
          {{ ui("Tạo") }}
          {{
            tab === "schemas"
              ? ui("schema hồ sơ")
              : tab === "templates"
                ? ui("mẫu hợp đồng")
                : ui("nội dung")
          }}
        </h2>
        <WorkspaceForm
          :key="tab"
          :fields="formFields"
          :initial="formInitial"
          @submit="create"
        />
      </section>
      <section
        class="bg-white border rounded-xl p-6 overflow-x-auto"
        :class="formFields.length ? 'xl:col-span-2' : 'xl:col-span-3'"
      >
        <table v-if="items.length" class="w-full text-sm text-left">
          <thead>
            <tr class="bg-slate-50">
              <th
                v-for="c in columns"
                :key="c.key"
                class="p-3 font-medium text-slate-500"
              >
                {{ ui(c.label) }}
              </th>
              <th class="p-3 font-medium">{{ ui("Thao tác") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item._id" class="border-t">
              <td
                v-for="c in columns"
                :key="c.key"
                class="p-3 max-w-72 break-words"
              >
                {{ cell(item, c.key) }}
              </td>
              <td class="p-3 min-w-36">
                <div
                  v-if="tab === 'verifications' && item.state === 'submitted'"
                  class="space-y-2"
                >
                  <button
                    class="block text-emerald-700 underline"
                    @click="
                      act(`/platform/admin/verifications/${item._id}/review`, {
                        approved: true,
                      })
                    "
                  >
                    {{ ui("Duyệt") }}</button
                  ><button
                    class="block text-red-700 underline"
                    @click="
                      reviewItem = item;
                      reviewAction = 'verification';
                    "
                  >
                    {{ ui("Yêu cầu bổ sung") }}
                  </button>
                </div>
                <div
                  v-if="tab === 'trades' && item.state === 'chain_requested'"
                  class="space-y-2"
                >
                  <button
                    v-if="!item.chainApprovedBy"
                    class="text-emerald-700 underline"
                    @click="
                      act(
                        `/platform/admin/trades/${item._id}/approve-chain`,
                        {},
                      )
                    "
                  >
                    {{ ui("Duyệt cấu hình pool") }}</button
                  ><button
                    v-else
                    class="text-emerald-700 underline"
                    @click="
                      reviewItem = item;
                      reviewAction = 'pool';
                    "
                  >
                    {{ ui("Xác nhận pool từ ledger") }}
                  </button>
                </div>
                <button
                  v-if="
                    tab === 'ramps' &&
                    item.status === 'settled' &&
                    item.flow === 'cash-in'
                  "
                  class="text-emerald-700 underline"
                  @click="attest(item)"
                >
                  {{ ui("Ký chứng cứ ramp") }}
                </button>
                <div v-if="tab==='qr' &amp;&amp; item.state==='submitted'">
                  <button
                    class="underline text-emerald-700"
                    @click="verifyQr(item)"
                  >
                    {{ ui("Kiểm tra đối tác & ký xác nhận QR") }}
                  </button>
                </div>
                <div v-if="tab==='backups' &amp;&amp; item.state==='completed'">
                  <button
                    class="underline text-emerald-700"
                    @click="downloadBackup(item)"
                  >
                    {{ ui("Tải bản sao lưu mã hóa") }}
                  </button>
                </div>
                <div
                  v-if="tab==='agent-alerts' &amp;&amp; item.state!=='resolved'"
                >
                  <button
                    class="underline"
                    @click="
                      reviewItem = item;
                      reviewAction = 'alert';
                    "
                  >
                    {{ ui("Xử lý cảnh báo") }}
                  </button>
                </div>
                <div
                  v-if="tab==='agents' &amp;&amp; item.state!=='revoked'"
                  class="space-y-2"
                >
                  <button
                    class="underline block"
                    @click="
                      act(`/platform/admin/agents/${item._id}/control`, {
                        state: item.state === 'paused' ? 'active' : 'paused',
                      })
                    "
                  >
                    {{
                      item.state === "paused" ? ui("Tiếp tục") : ui("Tạm dừng")
                    }}</button
                  ><button
                    class="underline block text-red-700"
                    @click="
                      act(`/platform/admin/agents/${item._id}/control`, {
                        state: 'revoked',
                      })
                    "
                  >
                    {{ ui("Thu hồi agent") }}
                  </button>
                </div>
                <div
                  v-if="tab==='advertisements' &amp;&amp; ['submitted','paused'].includes(item.state)"
                >
                  <button
                    class="underline text-emerald-700"
                    @click="
                      act(`/advertising/admin/campaigns/${item._id}/review`, {
                        approved: true,
                      })
                    "
                  >
                    {{ ui("Duyệt quảng cáo") }}</button
                  ><button
                    class="underline block text-red-700 mt-2"
                    @click="
                      act(`/advertising/admin/campaigns/${item._id}/review`, {
                        approved: false,
                        reason: ui('Nội dung chưa đáp ứng yêu cầu'),
                      })
                    "
                  >
                    {{ ui("Từ chối") }}
                  </button>
                </div>
                <button
                  v-if="tab === 'products'"
                  class="underline text-emerald-700"
                  @click="
                    reviewItem = item;
                    reviewAction = 'product';
                  "
                >
                  {{ ui("Kiểm duyệt sản phẩm") }}
                </button>
                <div
                  v-if="tab==='clients' &amp;&amp; !item.revoked"
                  class="space-y-2"
                >
                  <button
                    class="underline text-red-700 block"
                    @click="
                      act(`/platform/admin/clients/${item._id}/revoke`, {})
                    "
                  >
                    {{ ui("Thu hồi token") }}</button
                  ><button
                    class="underline text-emerald-700 block"
                    @click="
                      reviewItem = item;
                      reviewAction = 'scopes';
                    "
                  >
                    {{ ui("Thu hẹp quyền") }}
                  </button>
                </div>
                <div v-if="tab === 'users'" class="space-y-2">
                  <button
                    class="block text-emerald-700 underline"
                    @click="
                      act(`/platform/admin/users/${item._id}/status`, {
                        status: 'Active',
                      })
                    "
                  >
                    {{ ui("Kích hoạt") }}</button
                  ><button
                    class="block text-red-700 underline"
                    @click="
                      act(`/platform/admin/users/${item._id}/status`, {
                        status: 'Suspended',
                      })
                    "
                  >
                    {{ ui("Tạm khóa") }}
                  </button>
                </div>
                <button
                  v-if="tab === 'complaints' && item.state !== 'resolved'"
                  class="text-emerald-700 underline"
                  @click="
                    reviewItem = item;
                    reviewAction = 'complaint';
                  "
                >
                  {{ ui("Xử lý") }}</button
                ><button
                  v-if="tab === 'subscriptions' && item.state === 'requested'"
                  class="text-emerald-700 underline"
                  @click="
                    reviewItem = item;
                    reviewAction = 'subscription';
                  "
                >
                  {{ ui("Kích hoạt") }}
                </button>
                <div
                  v-if="tab==='verifications' &amp;&amp; item.state==='approved'"
                  class="space-y-2"
                >
                  <button
                    class="underline text-emerald-700"
                    @click="
                      reviewItem = item;
                      reviewAction = 'credential';
                    "
                  >
                    {{ ui("Phát hành chứng thực Stellar") }}</button
                  ><button
                    class="underline block text-red-700"
                    @click="
                      chainAction(
                        `/chain/registry/verifications/${item._id}/revoke`,
                        {},
                      )
                    "
                  >
                    {{ ui("Thu hồi chứng thực Stellar") }}
                  </button>
                </div>
                <button
                  v-if="tab==='trades' &amp;&amp; item.state==='disputed'"
                  class="underline text-emerald-700"
                  @click="
                    reviewItem = item;
                    reviewAction = 'resolve';
                  "
                >
                  {{ ui("Trọng tài phân bổ tiền") }}
                </button>
                <div v-if="tab === 'certificates'" class="space-y-2">
                  <button
                    class="text-emerald-700 underline"
                    @click="
                      act(`/platform/admin/certificates/${item._id}/review`, {
                        state: 'verified',
                      })
                    "
                  >
                    {{ ui("Xác minh") }}</button
                  ><button
                    class="block text-red-700 underline"
                    @click="
                      act(`/platform/admin/certificates/${item._id}/review`, {
                        state: 'revoked',
                      })
                    "
                  >
                    {{ ui("Thu hồi") }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-sm text-slate-500 p-8 text-center">
          {{ ui("Chưa có bản ghi.") }}
        </p>
      </section>
    </div>
    <section
      v-if="reviewItem"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      @click.self="reviewItem = null"
    >
      <div class="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 class="text-lg font-semibold mb-4">
          {{
            reviewAction === "pool"
              ? ui("Đối soát tạo pool")
              : reviewAction === "subscription"
                ? ui("Hiệu lực dịch vụ")
                : ui("Ghi nhận quyết định")
          }}
        </h2>
        <WorkspaceForm :fields="reviewFields" @submit="review" /><button
          class="text-sm underline mt-4"
          @click="reviewItem = null"
        >
          {{ ui("Đóng") }}
        </button>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({
  layout: "workspace",
  middleware: ["auth", "role"],
  roles: ["Admin"],
});
const { request } = usePlatform();
const { sign } = useStellarWallet();
const backupAccess = useCookie("access_token");
const backupBase = String(useRuntimeConfig().public.apiBase);
const tab = ref("overview");
const items = ref<any[]>([]);
const summary = ref<any>({});
const notice = ref("");
const reviewItem = ref<any>(null);
const reviewAction = ref("");
const tabs = [
  { key: "overview", label: ui("Tổng quan") },
  { key: 'buyer-orders', label: ui('Đơn buyer') },
  { key: 'supplier-orders', label: ui('Đơn supplier') },
  { key: "revenue", label: "Doanh thu ledger" },
  { key: "prices", label: ui("Giá thị trường") },
  { key: "users", label: ui("Tài khoản") },
  { key: "clients", label: "API client" },
  { key: "products", label: ui("Sản phẩm") },
  { key: "notifications", label: ui("Gửi thông báo") },
  { key: "admin-grants", label: ui("Phân quyền admin") },
  { key: "contacts", label: ui("Hộp thư liên hệ") },
  { key: "qr", label: ui("Chứng cứ QR") },
  { key: "backups", label: ui("Sao lưu") },
  { key: "agent-alerts", label: ui("Cảnh báo agent") },
  { key: "chain-events", label: ui("Sự kiện blockchain") },
  { key: "organizations", label: ui("Doanh nghiệp") },
  { key: "verifications", label: ui("Thẩm định") },
  { key: "certificates", label: ui("Chứng nhận") },
  { key: "schemas", label: ui("Schema hồ sơ") },
  { key: "templates", label: ui("Mẫu hợp đồng") },
  { key: "trades", label: ui("Hợp đồng") },
  { key: "ramps", label: "MoneyGram" },
  { key: "intents", label: ui("Giao dịch Stellar") },
  { key: "complaints", label: ui("Khiếu nại") },
  { key: "resources", label: ui("Nội dung & cấu hình") },
  { key: "advertisements", label: ui("Quảng cáo supplier") },
  { key: "subscriptions", label: ui("Đăng ký gói") },
  { key: "agents", label: "Agent" },
  { key: "agent-contracts", label: ui("Registry ủy quyền agent") },
  { key: "models", label: "Model AI" },
  { key: "agent-runs", label: ui("Lịch sử agent") },
  { key: "audit", label: ui("Nhật ký") },
  { key: "operations", label: ui("Vận hành") },
];
const headings: Record<string, string> = {
  organizations: ui("Doanh nghiệp"),
  pendingVerifications: ui("Hồ sơ chờ duyệt"),
  pendingChain: ui("Hợp đồng chờ on-chain"),
  pendingComplaints: ui("Khiếu nại đang mở"),
  pendingWebhooks: ui("Webhook chờ đối soát"),
  failedIntents: ui("Giao dịch lỗi"),
  pendingSubscriptions: ui("Gói chờ kích hoạt"),
  database: ui("Cơ sở dữ liệu"),
  network: ui("Mạng Stellar"),
  escrowConfigured: ui("Escrow đã cấu hình"),
  moneygramConfigured: ui("MoneyGram đã cấu hình"),
  outboxPending: ui("Sự kiện chờ xử lý"),
  webhookPending: ui("Webhook chờ"),
  backup: ui("Sao lưu"),
};
const colMap: Record<string, any[]> = {
  "agent-contracts": [
    ["type", "Contract"],
    ["organization.name", ui("Tổ chức")],
    ["agent", "Agent"],
    ["action", ui("Lệnh")],
    ["limit", ui("Hạn mức")],
    ["intent.status", "Ledger"],
  ],
  clients: [
    ["_id", "ID"],
    ["name", ui("Ứng dụng")],
    ["organization.name", ui("Tổ chức")],
    ["scopes", ui("Quyền")],
    ["revoked", ui("Thu hồi")],
  ],
  products: [
    ["name", ui("Sản phẩm")],
    ["organization.name", "Supplier"],
    ["public", ui("Công bố")],
    ["moderationState", ui("Kiểm duyệt")],
  ],
  notifications: [
    ["title", ui("Tiêu đề")],
    ["user.email", ui("Người nhận")],
    ["body", ui("Nội dung")],
    ["createdAt", ui("Thời điểm")],
  ],
  prices: [
    ["product", ui("Sản phẩm")],
    ["price", ui("Giá")],
    ["currency", ui("Tiền tệ")],
    ["market", ui("Thị trường")],
    ["effectiveAt", ui("Thời điểm")],
  ],
  advertisements: [
    ["title", ui("Tiêu đề")],
    ["organization.name", "Supplier"],
    ["state", ui("Trạng thái")],
    ["expiresAt", ui("Kết thúc")],
  ],
  models: [
    ["name", ui("Tên cấu hình")],
    ["providerModel", ui("Model nhà cung cấp")],
    ["costUnits", ui("Đơn vị nội bộ")],
    ["enabled", ui("Bật")],
  ],
  "admin-grants": [
    ["email", "Email"],
    ["adminRestricted", ui("Giới hạn quyền")],
    ["adminScopes", ui("Quyền")],
    ["status", ui("Trạng thái")],
  ],
  contacts: [
    ["name", ui("Họ tên")],
    ["email", "Email"],
    ["subject", ui("Chủ đề")],
    ["body", ui("Nội dung")],
  ],
  qr: [
    ["trade.title", ui("Hợp đồng")],
    ["lotReference", ui("Lô hàng")],
    ["state", ui("Đối tác xác minh")],
    ["expiresAt", ui("Hạn chứng cứ")],
  ],
  backups: [
    ["createdAt", ui("Yêu cầu")],
    ["state", ui("Trạng thái")],
    ["sha256", "SHA-256"],
    ["fileCount", ui("Số tệp")],
  ],
  "agent-alerts": [
    ["code", ui("Mã cảnh báo")],
    ["reason", ui("Chi tiết")],
    ["severity", ui("Mức độ")],
    ["engine", "Engine"],
    ["windowCount", ui("Số lần trong cửa sổ")],
    ["state", ui("Trạng thái")],
    ["createdAt", ui("Thời điểm")],
  ],
  "chain-events": [
    ["type", ui("Sự kiện")],
    ["ledger", "Ledger"],
    ["txHash", ui("Giao dịch")],
    ["poolHash", "Pool"],
  ],
  users: [
    ["_id", "ID"],
    ["email", "Email"],
    ["fullName", ui("Tên")],
    ["role", ui("Vai trò")],
    ["status", ui("Trạng thái")],
  ],
  organizations: [
    ["name", ui("Doanh nghiệp")],
    ["kind", ui("Loại")],
    ["tier", "Level"],
    ["verification", ui("Xác minh")],
  ],
  verifications: [
    ["organization.name", ui("Doanh nghiệp")],
    ["level", "Level"],
    ["state", ui("Trạng thái")],
    ["commitment", "Commitment"],
  ],
  certificates: [
    ["name", ui("Chứng nhận")],
    ["organization.name", ui("Doanh nghiệp")],
    ["state", ui("Trạng thái")],
  ],
  trades: [
    ["title", ui("Hợp đồng")],
    ["buyer.name", "Buyer"],
    ["supplier.name", "Supplier"],
    ["amount", ui("Giá trị")],
    ["state", ui("Trạng thái")],
  ],
  ramps: [
    ["user.email", ui("Tài khoản")],
    ["flow", ui("Luồng tiền")],
    ["amount", "USDC"],
    ["status", ui("Đối soát")],
    ["providerStatus", "MoneyGram"],
  ],
  intents: [
    ["kind", ui("Thao tác")],
    ["amount", ui("Số tiền")],
    ["asset", ui("Tài sản")],
    ["status", ui("Trạng thái")],
  ],
  complaints: [
    ["title", ui("Khiếu nại")],
    ["organization.name", ui("Doanh nghiệp")],
    ["state", ui("Trạng thái")],
  ],
  resources: [
    ["kind", ui("Loại")],
    ["title", ui("Tên")],
    ["enabled", ui("Bật")],
  ],
  subscriptions: [
    ["organization.name", ui("Doanh nghiệp")],
    ["plan.title", ui("Gói")],
    ["state", ui("Trạng thái")],
  ],
  agents: [
    ["name", "Agent"],
    ["organization.name", ui("Doanh nghiệp")],
    ["spentUnits", ui("Đã dùng")],
    ["state", ui("Trạng thái")],
  ],
  "agent-runs": [
    ["tool", ui("Công cụ")],
    ["state", ui("Trạng thái")],
    ["costUnits", ui("Chi phí")],
  ],
  audit: [
    ["action", ui("Hành động")],
    ["entity", ui("Tài nguyên")],
    ["entityId", ui("Mã")],
    ["createdAt", ui("Thời điểm")],
  ],
  schemas: [
    ["level", "Level"],
    ["version", ui("Phiên bản")],
  ],
  templates: [
    ["title", ui("Mẫu")],
    ["version", ui("Phiên bản")],
    ["active", ui("Bật")],
  ],
};
const columns = computed(() =>
  (colMap[tab.value] || []).map(([key, label]) => ({ key, label })),
);
const formFields = computed<any[]>(() =>
  tab.value === "notifications"
    ? [
        {
          key: "users",
          label: ui("ID người nhận, phân cách dấu phẩy"),
          required: true,
        },
        { key: "title", label: ui("Tiêu đề"), required: true },
        {
          key: "body",
          label: ui("Nội dung"),
          type: "textarea",
          required: true,
        },
        { key: "link", label: ui("Đường dẫn /workspace"), required: true },
      ]
    : tab.value === "prices"
      ? [
          { key: "product", label: ui("Sản phẩm"), required: true },
          { key: "market", label: ui("Thị trường"), required: true },
          { key: "unit", label: ui("Đơn vị"), required: true },
          { key: "currency", label: ui("Tiền tệ (3 ký tự)"), required: true },
          { key: "incoterm", label: "Incoterm", required: true },
          { key: "price", label: ui("Giá (chuỗi thập phân)"), required: true },
          {
            key: "source",
            label: ui("Nguồn HTTPS"),
            type: "url",
            required: true,
          },
          {
            key: "effectiveAt",
            label: ui("Thời điểm ghi nhận"),
            type: "datetime-local",
            required: true,
          },
        ]
      : tab.value === "models"
        ? [
            {
              key: "name",
              label: ui("Tên cấu hình dùng khi tạo agent"),
              required: true,
            },
            {
              key: "providerModel",
              label: ui("ID model nhà cung cấp"),
              required: true,
            },
            {
              key: "maxTokens",
              label: ui("Giới hạn token đầu ra"),
              type: "number",
              required: true,
            },
            {
              key: "costUnits",
              label: ui("Đơn vị ngân sách nội bộ mỗi lượt"),
              type: "number",
              required: true,
            },
            {
              key: "dataPolicy",
              label: ui("Chính sách chia sẻ dữ liệu cho nhà cung cấp"),
              type: "textarea",
              required: true,
            },
            { key: "enabled", label: ui("Bật"), type: "checkbox" },
            {
              key: "scopes",
              label: ui("Quyền lợi nâng cao, phân cách dấu phẩy"),
              help: "profile:level3, profile:level4, reports:custom, ai:draft, ads:publish",
            },
          ]
        : tab.value === "admin-grants"
          ? [
              {
                key: "user",
                label: ui("ID tài khoản được cấp quyền"),
                required: true,
              },
              {
                key: "scopes",
                label: ui("Quyền, phân cách bằng dấu phẩy"),
                required: true,
                help: "accounts, kyb, trade, finance, content, agents, operations",
              },
            ]
          : tab.value === "resources"
            ? [
                {
                  key: "kind",
                  label: ui("Loại nội dung"),
                  required: true,
                  options: [
                    "news",
                    "partner",
                    "plan",
                    "promotion",
                    "advertisement",
                    "referral",
                    "api-client",
                    "model",
                    "qr-partner",
                    "fee",
                    "automation",
                    "training",
                    "backup",
                  ],
                },
                { key: "title", label: ui("Tên"), required: true },
                { key: "body", label: ui("Nội dung"), type: "textarea" },
                { key: "url", label: "URL HTTPS" },
                { key: "enabled", label: ui("Bật"), type: "checkbox" },
                {
                  key: "price",
                  label: ui("Giá dịch vụ hoặc phí (chuỗi thập phân)"),
                },
                {
                  key: "currency",
                  label: ui("Tài sản/tiền tệ"),
                  options: ["XLM", "USDC", "USD", "VND"],
                },
                {
                  key: "durationDays",
                  label: ui("Số ngày hiệu lực gói"),
                  type: "number",
                },
              ]
            : tab.value === "templates"
              ? [
                  { key: "title", label: ui("Tên mẫu"), required: true },
                  {
                    key: "body",
                    label: ui("Điều khoản mẫu"),
                    type: "textarea",
                    required: true,
                  },
                  {
                    key: "version",
                    label: ui("Phiên bản"),
                    type: "number",
                    required: true,
                  },
                  { key: "active", label: ui("Bật"), type: "checkbox" },
                ]
              : tab.value === "schemas"
                ? [
                    {
                      key: "level",
                      label: "Level",
                      type: "number",
                      required: true,
                    },
                    {
                      key: "version",
                      label: ui("Phiên bản"),
                      type: "number",
                      required: true,
                    },
                    {
                      key: "fields",
                      label: ui("Các trường hồ sơ"),
                      type: "textarea",
                      required: true,
                      help: ui(
                        "Mỗi dòng key|Nhãn|bắt buộc true hoặc false|riêng tư true hoặc false",
                      ),
                    },
                  ]
                : [],
);
const formInitial = computed(() => ({
  version: 1,
  level: 1,
  active: true,
  enabled: true,
}));
const reviewFields = computed(() =>
  reviewAction.value === "product"
    ? [
        {
          key: "state",
          label: ui("Trạng thái kiểm duyệt"),
          options: ["active", "suspended"],
          required: true,
        },
        { key: "reason", label: ui("Lý do"), type: "textarea", required: true },
      ]
    : reviewAction.value === "scopes"
      ? [
          {
            key: "scopes",
            label: ui("Scope được giữ, phân cách dấu phẩy"),
            required: true,
          },
        ]
      : reviewAction.value === "credential"
        ? [
            {
              key: "tier",
              label: ui("Tier registry (1 pháp lý, 2 năng lực, 3 uy tín)"),
              type: "number",
              required: true,
            },
          ]
        : reviewAction.value === "resolve"
          ? [
              {
                key: "supplierAmount",
                label: ui("Trả supplier (chuỗi thập phân)"),
                required: true,
              },
              {
                key: "buyerAmount",
                label: ui("Hoàn buyer (chuỗi thập phân)"),
                required: true,
              },
            ]
          : reviewAction.value === "pool"
            ? [
                {
                  key: "txHash",
                  label: ui("Hash giao dịch tạo pool đã thành công"),
                  required: true,
                },
              ]
            : reviewAction.value === "subscription"
              ? [
                  {
                    key: "expiresAt",
                    label: ui("Hiệu lực đến"),
                    type: "datetime-local",
                    required: true,
                  },
                ]
              : [
                  {
                    key: "reason",
                    label: ui("Lý do hoặc kết luận"),
                    type: "textarea",
                    required: true,
                  },
                ],
);
const adminPath = () =>
  tab.value === "advertisements"
    ? "/advertising/admin/campaigns"
    : tab.value === "models"
      ? "/ai/admin/models"
      : tab.value === "revenue"
        ? "/billing/admin/revenue"
        : tab.value === "qr"
          ? "/qr/admin"
          : tab.value === "schemas"
            ? "/platform/profile-schemas"
            : `/platform/admin/${tab.value}`;
function cell(o: any, k: string) {
  const v = k.split(".").reduce((v, k) => v?.[k], o);
  return typeof v === "boolean" ? (v ? ui("Có") : ui("Không")) : (v ?? "—");
}
async function load() {
  notice.value = "";
  if (['buyer-orders', 'supplier-orders'].includes(tab.value)) return;
  try {
    const d = await request(adminPath());
    if (["overview", "operations", "revenue"].includes(tab.value))
      summary.value = d;
    else items.value = d;
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
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
async function create(data: any) {
  try {
    const d = { ...data };
    if (tab.value === "notifications")
      d.users = String(d.users)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (tab.value === "prices")
      d.effectiveAt = new Date(d.effectiveAt).toISOString();
    if (tab.value === "models") {
      d.maxTokens = Number(d.maxTokens);
      d.costUnits = Number(d.costUnits);
    }
    if (d.durationDays) d.durationDays = Number(d.durationDays);
    if (["admin-grants", "resources"].includes(tab.value) && d.scopes)
      d.scopes = String(d.scopes)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    for (const k of Object.keys(d))
      if (d[k] === "" || d[k] === undefined) delete d[k];
    if (tab.value === "schemas") {
      d.level = Number(d.level);
      d.version = Number(d.version);
      d.fields = String(d.fields)
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [key, label, required, privateValue] = line.split("|");
          return {
            key: key?.trim(),
            label: label?.trim(),
            required: required?.trim() === "true",
            private: privateValue?.trim() === "true",
          };
        });
    }
    if (tab.value === "templates") {
      d.version = Number(d.version);
      d.requiredFields = [];
    }
    await request(adminPath(), "POST", d);
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function review(d: any) {
  const item = reviewItem.value;
  if (reviewAction.value === "product") {
    reviewItem.value = null;
    await act(`/platform/admin/products/${item._id}/moderate`, d);
    return;
  }
  if (reviewAction.value === "scopes") {
    reviewItem.value = null;
    await act(`/platform/admin/clients/${item._id}/scopes`, {
      scopes: String(d.scopes)
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    });
    return;
  }
  if (reviewAction.value === "credential") {
    reviewItem.value = null;
    await chainAction(`/chain/registry/verifications/${item._id}/issue`, {
      tier: Number(d.tier),
    });
    return;
  }
  if (reviewAction.value === "resolve") {
    reviewItem.value = null;
    await chainAction(`/chain/trades/${item._id}/resolve`, d);
    return;
  }
  let path = "";
  let body: any;
  if (reviewAction.value === "pool") {
    path = `/platform/admin/trades/${item._id}/confirm-pool`;
    body = d;
  }
  if (reviewAction.value === "verification") {
    path = `/platform/admin/verifications/${item._id}/review`;
    body = { approved: false, reason: d.reason };
  }
  if (reviewAction.value === "complaint") {
    path = `/platform/admin/complaints/${item._id}/review`;
    body = { state: "resolved", resolution: d.reason };
  }
  if (reviewAction.value === "subscription") {
    path = `/platform/admin/subscriptions/${item._id}/activate`;
    body = { expiresAt: new Date(d.expiresAt).toISOString() };
  }
  if (reviewAction.value === "alert") {
    path = `/platform/admin/agent-alerts/${item._id}/review`;
    body = { state: "resolved", reason: d.reason };
  }
  reviewItem.value = null;
  await act(path, body);
}
async function attest(item: any) {
  try {
    const i = await request(
      `/finance/moneygram/transactions/${item._id}/attest`,
      "POST",
      {},
      { "Idempotency-Key": crypto.randomUUID() },
    );
    if (i.status === "awaiting_signature") await sign(i);
    notice.value = ui("Đã gửi yêu cầu; kiểm tra xác nhận tại mục Ví.");
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function chainAction(path: string, body: any) {
  try {
    const intent = await request(path, "POST", body, {
      "Idempotency-Key": crypto.randomUUID(),
    });
    if (intent.status === "awaiting_signature") await sign(intent);
    await load();
    notice.value = ui("Theo dõi chữ ký và xác nhận ledger tại mục Ví.");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function verifyQr(item: any) {
  try {
    const intent = await request(
      `/qr/admin/${item._id}/verify`,
      "POST",
      {},
      { "Idempotency-Key": crypto.randomUUID() },
    );
    if (intent.status === "awaiting_signature") await sign(intent);
    await load();
    notice.value = ui(
      "Chứng cứ đối tác hợp lệ; theo dõi xác nhận ledger tại mục Ví.",
    );
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function downloadBackup(item: any) {
  try {
    const response = await fetch(
      `${backupBase}/platform/admin/backups/${item._id}/download`,
      { headers: { Authorization: `Bearer ${backupAccess.value}` } },
    );
    if (!response.ok) throw new Error(ui("Không tải được bản sao lưu"));
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = item.filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (e: any) {
    notice.value = e.message;
  }
}
onMounted(load);
</script>
