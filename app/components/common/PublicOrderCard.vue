<template>
  <article class="bg-white border border-slate-200 rounded-xl p-5 flex flex-col min-w-0" :data-public-order="order._id">
    <p class="text-xs font-medium text-emerald-700">{{ ui(order.direction === 'buy' ? 'Nhu cầu mua' : 'Chào bán') }}</p>
    <h3 class="text-lg font-semibold mt-2 break-words"><NuxtLink :to="`/orders/${order._id}`" class="hover:text-emerald-800">{{ order.title }}</NuxtLink></h3>
    <p v-if="order.quoteIntakeState === 'paused'" class="text-xs text-amber-800 mt-2">{{ ui('Đang tạm dừng nhận báo giá') }}</p>
    <ul class="space-y-1 text-sm text-slate-600 mt-3"><li v-for="line in rfqLines(order).slice(0,3)" :key="line.lineId" class="break-words">{{ line.product }} · {{ line.quantity }} {{ line.unit }}</li></ul>
    <p v-if="rfqLines(order).length > 3" class="text-xs text-slate-500 mt-2">{{ rfqLines(order).length }} {{ ui('dòng hàng') }}</p>
    <p class="text-sm text-slate-500 mt-3 break-words">{{ order.currency }} · {{ order.incoterm }} · {{ order.destination }}</p>
    <p class="text-xs text-slate-500 mt-2">{{ ui('Hạn phản hồi') }} {{ new Date(order.deadline).toLocaleString(locale === 'en' ? 'en-GB' : 'vi-VN') }}</p>
    <NuxtLink :to="`/orders/${order._id}`" class="text-sm text-emerald-700 underline mt-4">{{ ui('Xem RFQ công khai') }}</NuxtLink>
  </article>
</template>
<script setup lang="ts">
import { rfqLines } from '~/lib/quotations';
defineProps<{order:any}>();
const {ui}=useWorkspaceText(),{locale}=useI18n();
</script>
