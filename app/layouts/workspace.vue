<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AppNotifications />
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div
        class="max-w-screen-2xl mx-auto px-5 py-3 sm:py-0 sm:h-16 flex flex-wrap items-center justify-between gap-3 min-w-0"
      >
        <NuxtLink
          to="/workspace"
          class="font-bold text-xl tracking-tight text-emerald-800 whitespace-nowrap"
          >AgriStellar<span
            class="ml-2 text-xs text-slate-500 font-normal hidden sm:inline"
            >TRADE WORKSPACE</span
          ></NuxtLink
        >
        <div class="flex items-center gap-2 min-w-0 w-full sm:w-auto">
          <select
            v-if="organizations.length"
            v-model="organizationId"
            class="rounded-lg border-slate-200 text-sm min-w-0 max-w-full flex-1 sm:flex-none sm:max-w-72"
            :aria-label="ui('Tổ chức')"
            @change="reload"
          >
            <option v-for="o in organizations" :key="o._id" :value="o._id">
              {{ o.name }}
            </option></select
          ><LangSwitcher /><NuxtLink
            to="/workspace/settings"
            class="text-sm hidden md:block"
            >{{ user?.fullName || user?.email }}</NuxtLink
          >
        </div>
      </div>
    </header>
    <div class="max-w-screen-2xl mx-auto flex flex-col lg:flex-row">
      <aside
        class="lg:w-60 shrink-0 p-4 lg:min-h-[calc(100vh-4rem)] bg-white border-r border-slate-200"
      >
        <nav
          class="flex lg:flex-col gap-1 overflow-x-auto lg:sticky lg:top-20"
          :aria-label="ui('Chức năng chính')"
        >
          <NuxtLink
            v-for="item in nav"
            :key="item[0]"
            :to="item[0]"
            class="whitespace-nowrap px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-emerald-50"
            :class="{
              'bg-emerald-50 text-emerald-800 font-semibold':
                route.path === item[0],
            }"
            >{{ ui(item[1]) }}</NuxtLink
          >
        </nav>
      </aside>
      <main class="min-w-0 flex-1 p-5 md:p-8"><slot /></main>
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

const route = useRoute();
const { organizations, organizationId, loadOrganizations } = usePlatform();
const { user } = useAuth();
const nav = computed(() => [
  ["/workspace", ui("Tổng quan")],
  ["/workspace/directory", ui("Đối tác & sản phẩm")],
  ["/workspace/organization", ui("Hồ sơ doanh nghiệp")],
  ["/workspace/verification", ui("Xác minh & chứng nhận")],
  ["/workspace/products", ui("Danh mục sản phẩm")],
  ["/workspace/rfqs", ui("RFQ & báo giá")],
  ["/workspace/trades", ui("Hợp đồng & escrow")],
  ["/workspace/wallet", ui("Ví & MoneyGram")],
  ["/workspace/leads", ui("Đối tác tiềm năng")],
  ["/workspace/referrals", ui("Điều phối giới thiệu")],
  ["/workspace/insights", ui("Phân tích đối tác")],
  ["/workspace/marketing", "CRM & email"],
  ...(user.value?.role === "Supplier"
    ? [["/workspace/advertising", ui("Quảng cáo nguồn cung")]]
    : []),
  ["/workspace/auctions", ui("Đấu giá nông sản")],
  ["/workspace/messages", ui("Không gian cộng tác")],
  ["/workspace/agents", "AI agent"],
  ["/workspace/chat", ui("Chat AgriStellar")],
  ["/workspace/agent-costs", ui("Ngân sách agent")],
  ["/workspace/delegations", ui("Ủy quyền trên chain")],
  ["/workspace/assistant", ui("Trợ lý soạn thảo")],
  ["/workspace/reports", ui("Báo cáo & giá thị trường")],
  ["/workspace/notifications", ui("Thông báo")],
  ["/workspace/complaints", ui("Khiếu nại")],
  ["/workspace/services", ui("Dịch vụ")],
  ["/workspace/billing", ui("Thanh toán & phí")],
  ["/workspace/integrations", ui("SDK & tích hợp")],
  ...(user.value?.role === "Admin"
    ? [["/workspace/admin", ui("Quản trị nền tảng")]]
    : []),
]);
const reload = () => reloadNuxtApp();
onMounted(async () => {
  try {
    await loadOrganizations();
  } catch {
    /* Admin does not need an organization. */
  }
});
</script>
