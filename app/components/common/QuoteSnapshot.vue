<template>
  <section class="space-y-3 min-w-0" :data-quote-snapshot="snapshot.version">
    <p class="font-semibold break-words">{{ snapshot.rfqTitle }} · {{ ui('Phiên bản báo giá') }} {{ snapshot.version }}</p>
    <p class="text-sm text-slate-500 break-words">{{ snapshot.currency }} · {{ snapshot.incoterm }} · {{ snapshot.destination }}</p>
    <p v-if="snapshot.requestedLines && snapshot.lines.length < snapshot.requestedLines.length" class="text-sm text-amber-800">{{ ui('Báo giá chỉ gồm một phần dòng hàng RFQ. Hai bên cần xác nhận rõ phạm vi hợp đồng.') }}</p>
    <ul class="space-y-3">
      <li v-for="line in snapshot.lines" :key="line.lineId" class="border rounded-lg p-3 text-sm break-words">
        <p class="font-medium">{{ line.product }} · {{ line.quantity }} {{ line.unit }}</p>
        <p class="mt-1">{{ line.price }} {{ snapshot.currency }}/{{ line.unit }}</p>
        <p v-if="line.specifications" class="mt-1 whitespace-pre-wrap">{{ line.specifications }}</p>
        <p v-if="line.deviations" class="mt-1 text-amber-800 whitespace-pre-wrap">{{ ui('Khác biệt quy cách') }}: {{ line.deviations }}</p>
      </li>
    </ul>
    <dl class="text-sm grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 break-words">
      <dt>{{ ui('Tổng giá hàng') }}</dt><dd>{{ snapshot.lineSubtotal }} {{ snapshot.currency }}</dd>
      <template v-if="snapshot.chargesDeclared"><dt>{{ ui('Thuế đã khai') }}</dt><dd>{{ snapshot.taxAmount }} {{ snapshot.currency }}</dd><dt>{{ ui('Cước đã khai') }}</dt><dd>{{ snapshot.freightAmount }} {{ snapshot.currency }}</dd><dt>{{ ui('Tổng khoản đã khai') }}</dt><dd>{{ snapshot.quotedTotal }} {{ snapshot.currency }}</dd></template>
    </dl>
    <p v-if="!snapshot.chargesDeclared" class="text-xs text-amber-800">{{ ui('Thuế và cước chưa được khai đầy đủ; không coi tổng này là giá trọn gói.') }}</p>
    <p class="text-xs text-slate-500">{{ ui('Hiệu lực đến') }} {{ new Date(snapshot.validUntil).toLocaleString(locale === 'en' ? 'en-GB' : 'vi-VN') }}</p>
    <p v-if="snapshot.terms" class="text-sm whitespace-pre-wrap break-words">{{ snapshot.terms }}</p>
    <p v-if="snapshot.rfqRequirements" class="text-sm whitespace-pre-wrap break-words">{{ ui('Yêu cầu RFQ') }}: {{ snapshot.rfqRequirements }}</p>
    <p class="text-xs text-slate-500 break-all">{{ ui('Hash bản chụp báo giá') }}: {{ snapshot.snapshotHash }}</p>
  </section>
</template>
<script setup lang="ts">
defineProps<{ snapshot: any }>();
const { ui } = useWorkspaceText();
const { locale } = useI18n();
</script>
