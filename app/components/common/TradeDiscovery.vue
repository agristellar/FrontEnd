<template>
  <section id="trade-hub" class="bg-stone-50 border-y border-stone-200 py-16" data-trade-discovery>
    <div class="max-w-7xl mx-auto px-5 space-y-10">
      <div class="max-w-3xl"><p class="text-xs tracking-widest font-semibold text-emerald-700 mb-3">AGRISTELLAR MARKETPLACE</p><h2 class="text-3xl font-semibold text-slate-900">{{ ui('Khám phá thị trường nông sản') }}</h2><p class="text-slate-600 mt-4 leading-7">{{ ui('Tìm sản phẩm, đối tác và RFQ được công bố. Xem nhu cầu trước khi bắt đầu trao đổi và thỏa thuận trong workspace.') }}</p></div>
      <form class="bg-white border border-slate-200 rounded-xl p-4 grid sm:grid-cols-[minmax(0,1fr)_auto_auto] gap-3" @submit.prevent="explore">
        <input id="home-market-query" v-model="query" maxlength="100" :aria-label="ui('Sản phẩm hoặc nhu cầu cần tìm')" :placeholder="ui('Sản phẩm hoặc nhu cầu cần tìm')" class="min-w-0 rounded-lg border-slate-300" />
        <select id="home-market-category" v-model="category" :aria-label="ui('Phạm vi tìm kiếm')" class="rounded-lg border-slate-300"><option value="products">{{ ui('Sản phẩm') }}</option><option value="suppliers">{{ ui('Nhà cung cấp') }}</option><option value="buy-orders">{{ ui('Nhu cầu mua') }}</option><option value="sell-orders">{{ ui('Chào bán') }}</option></select>
        <button class="bg-emerald-800 text-white px-5 py-2 rounded-lg">{{ ui('Khám phá') }}</button>
      </form>
      <div class="flex flex-wrap gap-3 text-sm"><NuxtLink v-for="link in links" :key="link.tab" :to="{path:'/marketplace',query:{tab:link.tab}}" class="bg-white border rounded-full px-4 py-2 hover:border-emerald-700">{{ ui(link.label) }}</NuxtLink></div>
      <p v-if="loading" role="status" class="text-sm text-slate-500">{{ ui('Đang tải dữ liệu công khai') }}</p>
      <div v-else-if="failed" class="border rounded-xl bg-white p-5 text-sm"><p role="status">{{ ui('Không tải được dữ liệu công khai. Bạn có thể thử lại.') }}</p><button class="underline text-emerald-700 mt-3" @click="load">{{ ui('Thử lại') }}</button></div>
      <template v-else-if="data">
        <section v-for="feed in feeds" :key="feed.direction" class="space-y-5"><div class="flex flex-wrap gap-3 justify-between items-end"><div><h3 class="text-2xl font-semibold">{{ ui(feed.label) }}</h3><p class="text-xs text-slate-500 mt-2">{{ feed.data.total }} {{ ui('RFQ công khai còn hạn') }}</p></div><NuxtLink :to="{path:'/marketplace',query:{tab:feed.tab}}" class="text-sm underline text-emerald-700">{{ ui('Xem tất cả') }}</NuxtLink></div><div class="grid md:grid-cols-3 gap-5"><PublicOrderCard v-for="order in feed.data.items" :key="order._id" :order="order" /><p v-if="!feed.data.items.length" class="text-sm text-slate-500 bg-white border rounded-xl p-5 md:col-span-3">{{ ui('Chưa có RFQ công khai còn hạn trong nhóm này.') }}</p></div></section>
        <div class="grid lg:grid-cols-2 gap-10">
          <section class="space-y-5"><div class="flex gap-3 justify-between items-center"><h3 class="text-2xl font-semibold">{{ ui('Tin từ AgriStellar') }}</h3><NuxtLink to="/marketplace?tab=news" class="text-sm underline text-emerald-700">{{ ui('Xem tất cả') }}</NuxtLink></div><article v-for="news in data.news.items" :key="news._id" class="bg-white border rounded-xl p-5"><h4 class="font-semibold break-words">{{ news.title }}</h4><p class="text-sm text-slate-600 mt-2 whitespace-pre-wrap break-words line-clamp-3">{{ news.body }}</p><a v-if="publicHttpsUrl(news.url)" :href="publicHttpsUrl(news.url)" target="_blank" rel="noopener noreferrer" class="text-sm text-emerald-700 underline inline-block mt-3">{{ ui('Đọc nguồn') }}</a></article><p v-if="!data.news.items.length" class="bg-white border rounded-xl p-5 text-sm text-slate-500">{{ ui('Chưa có bản tin được công bố.') }}</p></section>
          <section class="space-y-5"><div class="flex gap-3 justify-between items-center"><h3 class="text-2xl font-semibold">{{ ui('Đối tác và tài nguyên') }}</h3><NuxtLink to="/marketplace?tab=partner" class="text-sm underline text-emerald-700">{{ ui('Xem tất cả') }}</NuxtLink></div><article v-for="partner in data.partners.items" :key="partner._id" class="bg-white border rounded-xl p-5"><h4 class="font-semibold break-words">{{ partner.title }}</h4><p class="text-sm text-slate-600 mt-2 whitespace-pre-wrap break-words line-clamp-3">{{ partner.body }}</p><a v-if="publicHttpsUrl(partner.url)" :href="publicHttpsUrl(partner.url)" target="_blank" rel="noopener noreferrer" class="text-sm text-emerald-700 underline inline-block mt-3">{{ ui('Xem tài nguyên') }}</a></article><p v-if="!data.partners.items.length" class="bg-white border rounded-xl p-5 text-sm text-slate-500">{{ ui('Chưa có đối tác hoặc tài nguyên được công bố.') }}</p></section>
        </div>
      </template>
    </div>
  </section>
</template>
<script setup lang="ts">
import {publicHttpsUrl} from '~/lib/public-market';
const {ui}=useWorkspaceText(),{request}=usePlatform(),router=useRouter();
const query=ref(''),category=ref('products'),data=ref<any>(null),loading=ref(true),failed=ref(false);
const links=[{tab:'buy-orders',label:'Nhu cầu mua'},{tab:'sell-orders',label:'Chào bán'},{tab:'suppliers',label:'Nhà cung cấp'},{tab:'buyers',label:'Bên mua'},{tab:'news',label:'Tin tức'},{tab:'partner',label:'Đối tác và tài nguyên'}];
const feeds=computed(()=>data.value?[{direction:'buy',tab:'buy-orders',label:'Nhu cầu mua mới công bố',data:data.value.buy},{direction:'sell',tab:'sell-orders',label:'Chào bán mới công bố',data:data.value.sell}]:[]);
async function load(){loading.value=true;failed.value=false;try{data.value=await request('/platform/public/home');}catch{failed.value=true;}finally{loading.value=false;}}
function explore(){router.push({path:'/marketplace',query:{tab:category.value,...(query.value.trim()?{q:query.value.trim()}: {})}});}
onMounted(load);
</script>
