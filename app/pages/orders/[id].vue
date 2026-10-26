<template>
  <main class="max-w-5xl mx-auto px-5 py-8 min-w-0">
    <header class="flex flex-wrap gap-4 justify-between items-center mb-8"><NuxtLink to="/" class="text-xl font-bold text-emerald-800">AgriStellar</NuxtLink><div class="flex gap-5 items-center text-sm"><NuxtLink :to="{path:'/marketplace',query:{tab:order?.direction==='sell'?'sell-orders':'buy-orders'}}" class="underline text-emerald-700">{{ ui('Danh sách RFQ') }}</NuxtLink><LangSwitcher /></div></header>
    <p v-if="loading" role="status">{{ ui('Đang tải dữ liệu công khai') }}</p>
    <section v-else-if="notice" class="bg-white border rounded-xl p-6"><h1 class="text-xl font-semibold">{{ ui('RFQ không còn được công bố') }}</h1><p role="status" class="text-slate-600 mt-3">{{ ui('Đơn có thể đã đóng, hết hạn hoặc được chuyển về chế độ riêng tư.') }}</p><NuxtLink to="/marketplace?tab=buy-orders" class="inline-block mt-4 underline text-emerald-700">{{ ui('Khám phá RFQ khác') }}</NuxtLink></section>
    <article v-else-if="order" class="bg-white border rounded-xl p-5 sm:p-8 space-y-6" data-public-order-detail>
      <div><p class="text-sm text-emerald-700">{{ ui(order.direction==='buy'?'Nhu cầu mua':'Chào bán') }}</p><h1 class="text-3xl font-semibold mt-3 break-words">{{ order.title }}</h1><p class="text-sm text-slate-500 mt-3">{{ order.currency }} · {{ order.incoterm }} · {{ order.destination }}</p></div>
      <p v-if="order.quoteIntakeState==='paused'" role="status" class="text-sm bg-amber-50 text-amber-900 p-3 rounded-lg">{{ ui('RFQ đang tạm dừng nhận báo giá. Bạn vẫn có thể xem lịch sử và các hợp đồng đã tạo.') }}</p>
      <section><h2 class="font-semibold mb-3">{{ ui('Dòng hàng yêu cầu') }}</h2><ul class="space-y-3"><li v-for="line in rfqLines(order)" :key="line.lineId" class="border rounded-lg p-4 break-words"><p class="font-medium">{{ line.product }} · {{ line.quantity }} {{ line.unit }}</p><p v-if="line.specifications" class="mt-2 text-sm whitespace-pre-wrap text-slate-600">{{ line.specifications }}</p></li></ul></section>
      <p v-if="order.requirements" class="whitespace-pre-wrap break-words text-sm">{{ order.requirements }}</p>
      <p class="text-sm text-slate-600">{{ ui('Hạn phản hồi') }}: {{ new Date(order.deadline).toLocaleString(locale==='en'?'en-GB':'vi-VN') }}</p>
      <section class="border-t pt-5 space-y-3"><p class="text-sm text-slate-600">{{ ui('Đăng nhập bằng tài khoản doanh nghiệp để xem và phản hồi RFQ trong workspace.') }}</p><NuxtLink :to="`/workspace/rfqs/${order._id}`" class="inline-block bg-emerald-800 text-white px-5 py-3 rounded-lg">{{ ui('Mở RFQ trong workspace') }}</NuxtLink></section>
    </article>
  </main>
</template>
<script setup lang="ts">
import {rfqLines} from '~/lib/quotations';
const {ui}=useWorkspaceText(),{locale}=useI18n(),{request}=usePlatform(),route=useRoute();
const order=ref<any>(null),loading=ref(true),notice=ref(false);
useSeoMeta({title:()=>order.value?order.value.title+' | AgriStellar':'AgriStellar RFQ'});
let generation=0;
async function load(){const key=++generation;loading.value=true;notice.value=false;order.value=null;try{const data=await request('/platform/public/orders/'+encodeURIComponent(String(route.params.id)));if(key===generation)order.value=data;}catch{if(key===generation)notice.value=true;}finally{if(key===generation)loading.value=false;}}
onMounted(load);watch(()=>route.params.id,load);
</script>
