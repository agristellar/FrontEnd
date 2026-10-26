<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">
      {{
        ui(
          isAdmin
            ? "Dashboard năng lực supplier"
            : "Phân tích buyer & lịch sử giao dịch",
        )
      }}
    </h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Các tín hiệu có nguồn và thời điểm. Không suy ra khả năng thanh toán hoặc năng lực thực tế từ trạng thái hồ sơ.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="bg-amber-50 p-4 rounded-xl mb-5">
      {{ notice }}
    </p>
    <template v-if="isAdmin">
      <form class="flex gap-3 mb-5" @submit.prevent="loadCapacity">
        <input
          v-model="query"
          :aria-label="ui('Tên doanh nghiệp')"
          :placeholder="ui('Tìm supplier')"
          class="border-slate-300 rounded-lg flex-1 min-w-0"
        /><button class="bg-emerald-700 text-white px-5 rounded-lg">
          {{ ui("Tìm kiếm") }}
        </button>
      </form>
      <p class="text-sm text-slate-500 mb-4">
        {{
          ui(
            "Năng lực là thông tin supplier khai báo. Chỉ quy đổi số lượng khi có đơn vị và kỳ đo được xác minh.",
          )
        }}
      </p>
      <div class="grid xl:grid-cols-2 gap-5">
        <article
          v-for="row in capacity?.rows"
          :key="row.organization._id"
          class="bg-white border rounded-xl p-6"
        >
          <h2 class="font-semibold text-lg">{{ row.organization.name }}</h2>
          <p class="text-sm mt-2">
            {{ ui("Năng lực khai báo") }}:
            {{ row.declaredCapacity || ui("Chưa cung cấp") }}
          </p>
          <dl class="grid sm:grid-cols-2 gap-4 mt-5">
            <div>
              <dt class="text-xs text-slate-500">
                {{ ui("Cấp hồ sơ đã duyệt còn hạn") }}
              </dt>
              <dd>{{ row.approvedLevels.join(", ") || "—" }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">
                {{ ui("Chứng nhận còn hạn") }}
              </dt>
              <dd>{{ row.validCertificates }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">{{ ui("Sản phẩm") }}</dt>
              <dd>{{ row.products }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">
                {{ ui("Lần thẩm định gần nhất") }}
              </dt>
              <dd>{{ date(row.lastReview) }}</dd>
            </div>
          </dl>
          <p class="text-sm mt-5">
            {{ ui("Hợp đồng theo trạng thái") }}:
            <span
              v-for="(count, state) in row.tradeStates"
              :key="state"
              class="inline-block mr-3"
              >{{ state }} {{ count }}</span
            >
          </p>
        </article>
      </div>
      <p v-if="capacity?.truncated" class="text-sm mt-4">
        {{ ui("Danh sách giới hạn. Hãy lọc tên để xem thêm.") }}
      </p>
    </template>
    <template v-else>
      <form class="flex flex-wrap gap-3 mb-6" @submit.prevent="analyze">
        <select
          v-model="buyerId"
          :aria-label="ui('Buyer cần phân tích')"
          class="border-slate-300 rounded-lg flex-1 min-w-48"
          required
        >
          <option value="">{{ ui("Chọn buyer") }}</option>
          <option v-for="b in buyers" :key="b._id" :value="b._id">
            {{ b.name }}
          </option></select
        ><button
          :disabled="busy"
          class="bg-emerald-700 text-white px-5 py-3 rounded-lg disabled:opacity-50"
        >
          {{ ui(busy ? "Đang phân tích…" : "Phân tích và lưu bằng chứng") }}
        </button>
      </form>
      <section v-if="analysis" class="bg-white border rounded-xl p-6">
        <h2 class="text-xl font-semibold">{{ analysis.buyer.name }}</h2>
        <p class="text-xs text-slate-500 mt-2">
          {{ analysis.method }} · {{ date(analysis.observedAt) }}
        </p>
        <div class="grid md:grid-cols-2 gap-4 my-5">
          <article
            v-for="s in analysis.signals"
            :key="s.code"
            class="border rounded-lg p-4"
          >
            <h3 class="text-sm text-slate-500">
              {{ ui(signalLabels[s.code] || s.code) }}
            </h3>
            <p class="font-semibold mt-2">{{ s.value }}</p>
            <p class="text-xs text-slate-500 mt-2">
              {{ ui("Nguồn") }}: {{ ui(sourceLabels[s.code] || s.code) }} ·
              {{ date(s.observedAt) }}
            </p>
          </article>
        </div>
        <h3 class="font-semibold mt-6">
          {{ ui("Cơ hội mua hàng được phép xem") }}
        </h3>
        <article
          v-for="r in analysis.opportunities"
          :key="r.id"
          class="border-t mt-3 py-3"
        >
          <NuxtLink
            :to="`/workspace/rfqs/${r.id}`"
            class="text-emerald-700 underline"
            >{{ r.title }}</NuxtLink
          >
          <p class="text-sm mt-2">
            {{ r.product }} · {{ r.quantity }} {{ r.unit }} · {{ r.incoterm }} ·
            {{
              ui(
                r.productMatch
                  ? "Khớp ngành hàng đã khai báo"
                  : "Cần đánh giá sản phẩm phù hợp",
              )
            }}
          </p>
        </article>
        <h3 class="font-semibold mt-6">
          {{ ui("Lịch sử giao dịch với tổ chức của bạn") }}
        </h3>
        <p class="text-sm text-slate-500 mt-2">
          {{
            ui(
              "Chỉ hiển thị hợp đồng hai bên cùng tham gia. Trạng thái ứng dụng và số dư đã đối soát ledger là các thông tin riêng. Không bao gồm lịch sử tín dụng bên ngoài.",
            )
          }}
        </p>
        <article
          v-for="t in analysis.history"
          :key="t._id"
          class="border-t mt-3 py-3"
        >
          <NuxtLink
            :to="`/workspace/trades/${t._id}`"
            class="underline text-emerald-700"
            >{{ t.title }}</NuxtLink
          >
          <p class="text-sm mt-2">
            {{ t.state }} · {{ t.amount }} {{ t.asset }} ·
            {{ ui("Đã nạp escrow") }} {{ t.deposited }} ·
            {{ date(t.updatedAt) }}
          </p>
        </article>
        <p v-if="!analysis.history.length" class="text-sm mt-4 text-slate-500">
          {{
            ui(
              "Chưa có lịch sử giao dịch chung. Thiếu lịch sử không phải kết luận buyer có rủi ro.",
            )
          }}
        </p>
        <p
          v-if="analysis.historyTruncated || analysis.rfqsTruncated"
          class="text-sm mt-4"
        >
          {{ ui("Kết quả có giới hạn; không phải toàn bộ lịch sử.") }}
        </p>
      </section>
      <section class="bg-white border rounded-xl p-6 mt-6">
        <h2 class="font-semibold mb-4">{{ ui("Bản phân tích đã lưu") }}</h2>
        <button
          v-for="s in snapshots"
          :key="s._id"
          class="block text-emerald-700 underline text-sm mt-3 text-left"
          @click="openSnapshot(s)"
        >
          {{ s.buyer?.name }} · {{ date(s.observedAt) }} · {{ s.method }}
        </button>
        <p v-if="!snapshots.length" class="text-sm text-slate-500">
          {{ ui("Chưa có bản phân tích.") }}
        </p>
      </section>
    </template>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: "workspace", middleware: "auth" });
const { ui } = useWorkspaceText();
const { locale } = useI18n();
const { request } = usePlatform();
const { user } = useAuth();
const isAdmin = computed(() => user.value?.role === "Admin");
const notice = ref("");
const busy = ref(false);
const query = ref("");
const capacity = ref<any>(null);
const buyers = ref<any[]>([]);
const buyerId = ref("");
const analysis = ref<any>(null);
const snapshots = ref<any[]>([]);
const sourceLabels: Record<string, string> = {
  public_profile: "Hồ sơ doanh nghiệp",
  visible_open_requests: "RFQ công khai hoặc được mời",
  matching_products: "Ngành hàng khai báo và nhu cầu mua",
  shared_trade_history: "Hợp đồng hai bên cùng tham gia",
};
const signalLabels: Record<string, string> = {
  public_profile: "Trạng thái hồ sơ ứng dụng",
  visible_open_requests: "Nhu cầu mua đang mở được phép xem",
  matching_products: "Nhu cầu khớp ngành hàng",
  shared_trade_history: "Số hợp đồng chung được ghi nhận",
};
const date = (v: any) =>
  v
    ? new Date(v).toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US")
    : "—";
async function loadCapacity() {
  try {
    capacity.value = await request(
      `/insights/admin/supplier-capacity?${new URLSearchParams({ q: query.value })}`,
    );
    notice.value = "";
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function load() {
  if (isAdmin.value) return loadCapacity();
  try {
    buyers.value = (await request("/platform/directory?kind=Buyer")).items;
    snapshots.value = await request("/insights/snapshots");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function analyze() {
  busy.value = true;
  try {
    const row: any = await request(
      `/insights/buyers/${buyerId.value}/analyze`,
      "POST",
      {},
    );
    analysis.value = row.data;
    await load();
    notice.value = ui("Đã lưu bản phân tích có thời điểm và nguồn dữ liệu.");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  } finally {
    busy.value = false;
  }
}
async function openSnapshot(s: any) {
  try {
    analysis.value = (await request(`/insights/snapshots/${s._id}`)).data;
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
</script>
