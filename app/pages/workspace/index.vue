<template>
  <div>
    <p class="text-sm font-medium text-emerald-700 mb-2">
      {{ ui("NỀN TẢNG GIAO DỊCH NÔNG SẢN") }}
    </p>
    <h1 class="text-3xl font-semibold tracking-tight mb-3">
      {{ ui("Từ đối tác tin cậy đến giao dịch minh bạch") }}
    </h1>
    <p class="text-slate-600 max-w-3xl mb-8">
      {{
        ui(
          "Tìm đối tác, trao đổi báo giá và chấp thuận điều khoản. Dùng USDC trên Stellar để đặt cọc vào escrow, theo dõi giải ngân và hoàn tiền.",
        )
      }}
    </p>
    <p
      v-if="error"
      role="alert"
      class="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6"
    >
      {{ error }}
      <NuxtLink to="/workspace/organization" class="underline">{{
        ui("Tạo hồ sơ doanh nghiệp")
      }}</NuxtLink>
    </p>
    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      <div
        v-for="s in stats"
        :key="s.label"
        class="p-5 bg-white border border-slate-200 rounded-xl"
      >
        <div class="text-sm text-slate-500">{{ ui(s.label) }}</div>
        <div class="text-3xl font-semibold mt-3">{{ s.value }}</div>
      </div>
    </div>
    <div class="grid md:grid-cols-3 gap-5">
      <NuxtLink
        v-for="c in cards"
        :key="c.to"
        :to="c.to"
        class="bg-white border border-slate-200 p-6 rounded-xl hover:border-emerald-500"
        ><h2 class="font-semibold text-lg">{{ c.title }}</h2>
        <p class="text-sm text-slate-600 mt-2 leading-6">{{ c.body }}</p>
        <span class="inline-block mt-5 text-sm text-emerald-700">{{
          ui("Mở tính năng →")
        }}</span></NuxtLink
      >
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request } = usePlatform();
const data = ref<any>({});
const error = ref("");
const stats = computed(() => [
  { label: ui("Yêu cầu báo giá"), value: data.value.rfqs || 0 },
  { label: ui("Hợp đồng"), value: data.value.trades || 0 },
  { label: ui("Sản phẩm"), value: data.value.products || 0 },
  { label: ui("Agent đang hoạt động"), value: data.value.agents || 0 },
]);
const cards = [
  {
    to: "/workspace/directory",
    title: ui("Khám phá đối tác"),
    body: ui(
      "Tìm buyer và supplier theo sản phẩm, thị trường và cấp xác minh.",
    ),
  },
  {
    to: "/workspace/trades",
    title: ui("Quản lý giao dịch"),
    body: ui(
      "Lưu phiên bản hợp đồng và chấp thuận cùng một bộ điều khoản trước khi đặt cọc.",
    ),
  },
  {
    to: "/workspace/wallet",
    title: "MoneyGram & Stellar",
    body: ui(
      "Nạp tiền mặt thành USDC qua MoneyGram rồi ký giao dịch vào escrow của hợp đồng.",
    ),
  },
];
onMounted(async () => {
  try {
    data.value = await request("/platform/dashboard");
  } catch (e: any) {
    error.value = e.data?.error?.message || ui("Chưa có hồ sơ doanh nghiệp");
  }
});
</script>
