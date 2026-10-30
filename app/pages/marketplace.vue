<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b"><div class="max-w-7xl mx-auto p-5 flex flex-wrap justify-between items-center gap-4"><NuxtLink to="/" class="text-xl font-bold text-emerald-800">AgriStellar</NuxtLink><div class="flex gap-4 items-center text-sm"><NuxtLink to="/register">{{ ui('Tạo tài khoản') }}</NuxtLink><NuxtLink to="/login">{{ ui('Đăng nhập') }}</NuxtLink><LangSwitcher /></div></div></header>
    <main class="max-w-7xl mx-auto px-5 py-10">
      <p class="text-sm text-emerald-700 font-medium mb-3">AGRISTELLAR MARKETPLACE</p><h1 class="text-3xl md:text-4xl font-semibold tracking-tight">{{ ui('Tìm nguồn hàng và cơ hội thương mại') }}</h1><p class="text-slate-500 mt-4 max-w-2xl">{{ ui('Khám phá hồ sơ, sản phẩm và RFQ công khai, rồi trao đổi trong workspace của doanh nghiệp.') }}</p>
      <section v-if="ads.length" class="grid md:grid-cols-2 gap-4 mt-8"><article v-for="ad in ads" :key="ad.id" class="bg-white border rounded-xl p-5"><p class="text-xs text-slate-500 mb-2">{{ ui('Được tài trợ') }} · {{ ad.sponsor }}</p><h2 class="font-semibold">{{ ad.title }}</h2><p class="text-sm text-slate-500 mt-2">{{ ad.body }}</p><a v-if="publicHttpsUrl(ad.url)" :href="publicHttpsUrl(ad.url)" target="_blank" rel="noopener noreferrer sponsored" class="text-sm underline text-emerald-700 inline-block mt-3">{{ ui('Xem nguồn cung') }}</a></article></section>
      <nav class="flex flex-wrap gap-2 my-7" :aria-label="ui('Danh mục thị trường')"><button v-for="item in tabs" :key="item.key" :aria-pressed="tab===item.key" class="px-4 py-2.5 rounded-lg border text-sm" :class="tab===item.key?'bg-emerald-700 text-white':'bg-white'" @click="navigate(item.key,query,1)">{{ ui(item.label) }}</button></nav>
      <p v-if="notice" role="status" class="bg-amber-50 p-4 rounded-lg mb-5">{{ ui(notice) }}</p>
      <form v-if="tab!=='contact'" class="flex gap-3 mb-6" @submit.prevent="navigate(tab,query,1)"><input id="market-query" v-model="query" maxlength="100" :placeholder="ui('Tìm theo sản phẩm, tiêu đề hoặc nơi giao')" :aria-label="ui('Tìm kiếm')" class="flex-1 min-w-0 rounded-lg border-slate-300" /><button :disabled="loading" class="bg-emerald-700 text-white rounded-lg px-5 disabled:opacity-50">{{ ui('Tìm kiếm') }}</button></form>
      <template v-if="tab!=='contact'">
        <p v-if="loading" role="status" class="text-sm text-slate-500 mb-5">{{ ui('Đang tải dữ liệu công khai') }}</p>
        <p v-if="total!==null && !loading" class="text-sm text-slate-500 mb-5" data-market-total>{{ ui('Tổng bản ghi') }}: {{ total }}</p>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <template v-if="isOrders"><PublicOrderCard v-for="item in items" :key="item._id" :order="item" /></template>
          <template v-else><article v-for="item in items" :key="item._id" class="bg-white border rounded-xl p-6 min-w-0"><ProductPhoto v-if="tab === 'products'" :image-id="item.imageId" :name="item.name" photo-class="aspect-[4/3] rounded-lg mb-5" /><p class="text-xs text-emerald-700">{{ item.kind || item.category || 'AgriStellar' }}<span v-if="item.tier!==undefined"> · Level {{ item.tier }}</span></p><h2 class="text-lg font-semibold mt-3 break-words">{{ item.name || item.title }}</h2><p class="text-sm text-slate-500 mt-3 whitespace-pre-wrap break-words">{{ item.description || item.body }}</p><p v-if="item.products" class="text-sm mt-3">{{ item.products.join(', ') }}</p><a v-if="['news','partner'].includes(tab) && publicHttpsUrl(item.url)" :href="publicHttpsUrl(item.url)" target="_blank" rel="noopener noreferrer" class="inline-block text-sm text-emerald-700 underline mt-5">{{ ui('Đọc nguồn') }}</a><NuxtLink v-else-if="!['news','partner'].includes(tab)" to="/workspace/directory" class="inline-block text-sm text-emerald-700 underline mt-5">{{ ui('Trao đổi trong workspace') }}</NuxtLink></article></template>
          <p v-if="!items.length && !loading" class="text-slate-500 bg-white border rounded-xl p-8 md:col-span-2 lg:col-span-3">{{ ui('Không có kết quả phù hợp trong dữ liệu công khai hiện tại.') }}</p>
        </div>
        <nav class="flex flex-wrap items-center gap-5 mt-7 text-sm" :aria-label="ui('Phân trang thị trường')"><span>{{ ui('Trang') }} {{ page }}<template v-if="pages!==null"> / {{ pages || 1 }}</template></span><button :disabled="loading || page<=1" class="underline disabled:opacity-40" @click="navigate(tab,appliedQuery,page-1)">{{ ui('Trang trước') }}</button><button :disabled="loading || !hasNext" class="underline disabled:opacity-40" @click="navigate(tab,appliedQuery,page+1)">{{ ui('Trang sau') }}</button></nav>
      </template>
      <section v-else class="max-w-2xl bg-white border rounded-xl p-6"><h2 class="font-semibold text-lg mb-5">{{ ui('Liên hệ AgriStellar') }}</h2><WorkspaceForm :fields="contactFields" :busy="contactBusy" :submit-label="ui('Gửi yêu cầu liên hệ')" @submit="sendContact" /></section>
    </main>
    <footer class="border-t bg-white py-8 mt-8"><div class="max-w-7xl mx-auto px-5 text-sm text-slate-500 flex flex-wrap justify-between gap-4"><NuxtLink to="/">AgriStellar · Stellar trade infrastructure</NuxtLink><a href="https://stellar.org/products-and-tools/moneygram" target="_blank" rel="noopener noreferrer" class="underline">{{ ui('Tìm hiểu MoneyGram trên Stellar') }}</a></div></footer>
  </div>
</template>
<script setup lang="ts">
import {publicHttpsUrl} from '~/lib/public-market';
const {ui}=useWorkspaceText(),{request}=usePlatform(),route=useRoute(),router=useRouter();
const tabs=[{key:'suppliers',label:'Nhà cung cấp'},{key:'buyers',label:'Bên mua'},{key:'products',label:'Sản phẩm'},{key:'buy-orders',label:'Nhu cầu mua'},{key:'sell-orders',label:'Chào bán'},{key:'news',label:'Tin tức'},{key:'partner',label:'Đối tác và tài nguyên'},{key:'contact',label:'Liên hệ'}];
const tab=computed(()=>tabs.some(t=>t.key===route.query.tab)?String(route.query.tab):'suppliers');
const page=computed(()=>{const n=Number(route.query.page);return Number.isInteger(n)&&n>=1&&n<=100000?n:1;});
const appliedQuery=computed(()=>typeof route.query.q==='string'?route.query.q.slice(0,100):'');
const query=ref(appliedQuery.value),items=ref<any[]>([]),ads=ref<any[]>([]),total=ref<number|null>(null),pages=ref<number|null>(null),hasNext=ref(false),loading=ref(false),notice=ref(''),contactBusy=ref(false);
const isOrders=computed(()=>['buy-orders','sell-orders'].includes(tab.value));
const contactFields=computed(()=>[{key:'name',label:ui('Họ tên'),required:true},{key:'email',label:'Email',type:'email',required:true},{key:'subject',label:ui('Chủ đề'),required:true},{key:'body',label:ui('Nội dung'),type:'textarea',required:true},{key:'consent',label:ui('Tôi đồng ý để AgriStellar sử dụng thông tin này để phản hồi yêu cầu'),type:'checkbox',required:true}]);
let generation=0;
async function load(){const key=++generation;query.value=appliedQuery.value;items.value=[];total.value=null;pages.value=null;hasNext.value=false;notice.value='';if(tab.value==='contact'){loading.value=false;return;}loading.value=true;
  try{const params=new URLSearchParams({page:String(page.value),...(appliedQuery.value?{q:appliedQuery.value}:{})});let data:any;
    if(isOrders.value){params.set('direction',tab.value==='buy-orders'?'buy':'sell');data=await request('/platform/public/orders?'+params);}
    else if(['news','partner'].includes(tab.value))data=await request('/platform/public/content/'+tab.value+'?'+params);
    else if(['suppliers','buyers'].includes(tab.value)){params.set('kind',tab.value==='suppliers'?'Supplier':'Buyer');data=await request('/platform/directory?'+params);data={...data,page:page.value,limit:24,pages:Math.ceil(data.total/24)};}
    else data=await request('/platform/products/public?'+params);
    if(key!==generation)return;if(Array.isArray(data)){items.value=data;hasNext.value=data.length===24;}else{items.value=data.items;total.value=data.total;pages.value=data.pages;hasNext.value=data.page<data.pages;}
  }catch{if(key===generation)notice.value='Không tải được dữ liệu công khai. Bạn có thể thử lại.';}finally{if(key===generation)loading.value=false;}}
async function navigate(nextTab:string,q:string,nextPage:number){const target={path:'/marketplace',query:{tab:nextTab,...(q.trim()?{q:q.trim()}:{}),...(nextPage>1?{page:String(nextPage)}:{})}};if(router.resolve(target).fullPath===route.fullPath)await load();else await router.push(target);}
async function sendContact(data:any){if(contactBusy.value)return;contactBusy.value=true;notice.value='';try{await request('/platform/contact','POST',data);notice.value='Đã tiếp nhận yêu cầu liên hệ.';}catch{notice.value='Không gửi được yêu cầu. Bạn có thể thử lại.';}finally{contactBusy.value=false;}}
watch(()=>route.fullPath,load);onMounted(async()=>{await load();try{ads.value=await request('/advertising/public');}catch{}});
</script>
