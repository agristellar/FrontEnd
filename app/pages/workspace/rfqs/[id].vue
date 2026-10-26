<template>
  <div>
    <NuxtLink to="/workspace/rfqs" class="text-sm text-emerald-700">← RFQ</NuxtLink>
    <h1 class="text-2xl font-semibold mt-4 mb-5">{{ rfq?.title || ui('Báo giá') }}</h1>
    <p v-if="notice" role="status" class="p-3 bg-amber-50 rounded-lg mb-5 break-words">{{ ui(notice) }}</p>
    <section v-if="rfq" class="bg-white border rounded-xl p-5 mb-6 space-y-3">
      <h2 class="font-semibold">{{ ui('Dòng hàng yêu cầu') }}</h2>
      <ul class="text-sm space-y-2"><li v-for="line in requestedLines" :key="line.lineId" class="break-words"><strong>{{ line.product }}</strong> · {{ line.quantity }} {{ line.unit }}<p v-if="line.specifications" class="text-slate-500 mt-1 whitespace-pre-wrap">{{ line.specifications }}</p></li></ul>
      <p class="text-sm text-slate-500">{{ rfq.currency }} · {{ rfq.incoterm }} · {{ rfq.destination }} · {{ rfq.state }}</p>
      <p v-if="rfq.requirements" class="text-sm whitespace-pre-wrap break-words">{{ rfq.requirements }}</p>
      <p class="text-xs text-slate-500">{{ ui('Cơ sở so sánh giá') }}: {{ basisLabel(rfq.comparisonBasis) }}</p>
      <p v-if="rfq.quoteIntakeState === 'paused'" role="status" class="text-sm text-amber-800">{{ ui('RFQ đang tạm dừng nhận báo giá. Bạn vẫn có thể xem lịch sử và các hợp đồng đã tạo.') }}</p>
    </section>
    <div class="grid lg:grid-cols-3 gap-6 items-start">
      <section v-if="rfq && !own && rfq.state === 'open' && rfq.quoteIntakeState !== 'paused'" class="bg-white border rounded-xl p-6 min-w-0">
        <h2 class="font-semibold mb-4">{{ editing ? ui('Tạo phiên bản báo giá mới') : ui('Gửi báo giá') }}</h2>
        <p v-if="editing" class="text-sm text-slate-500 mb-4">{{ ui('Đang sửa phiên bản') }} {{ editing.version || 1 }}. {{ ui('Phiên bản trước vẫn được lưu trong lịch sử.') }}</p>
        <p v-if="ownQuote && !editing" class="text-sm text-slate-500">{{ ui('Bạn đã gửi báo giá. Chọn sửa để tạo phiên bản mới.') }}</p>
        <WorkspaceForm v-else :fields="fields" :initial="initial" :busy="busy" @submit="submitQuote">
          <template #before-submit>
            <fieldset v-if="requestedLines.length > 1" :disabled="busy" class="space-y-4">
              <legend class="font-medium mb-3">{{ ui('Báo giá từng dòng hàng') }}</legend>
              <article v-for="(line, index) in lineDrafts" :key="line.lineId" class="border rounded-lg p-3 space-y-3">
                <label class="flex gap-2 text-sm font-medium"><input v-model="line.included" :data-quote-line-include="index" type="checkbox" />{{ line.product }}</label>
                <p class="text-xs text-slate-500 break-words">{{ line.specifications }}</p>
                <template v-if="line.included">
                  <label class="text-sm block">{{ ui('Đơn giá') }}<input :id="`quote-line-${index}-price`" v-model="line.price" required inputmode="decimal" class="w-full rounded-lg border-slate-300 mt-1" /></label>
                  <label class="text-sm block">{{ ui('Số lượng') }}<input :id="`quote-line-${index}-quantity`" v-model="line.quantity" required inputmode="decimal" class="w-full rounded-lg border-slate-300 mt-1" /></label>
                  <label class="text-sm block">{{ ui('Đơn vị') }}<input :id="`quote-line-${index}-unit`" v-model="line.unit" required maxlength="30" class="w-full rounded-lg border-slate-300 mt-1" /></label>
                  <label class="text-sm block">{{ ui('Khác biệt quy cách') }}<textarea :id="`quote-line-${index}-deviations`" v-model="line.deviations" rows="2" maxlength="1000" class="w-full rounded-lg border-slate-300 mt-1" /></label>
                </template>
              </article>
              <p class="text-xs text-slate-500">{{ ui('Báo giá thiếu dòng hoặc khai khác quy cách được giữ riêng, không xếp hạng cùng báo giá đủ điều kiện.') }}</p>
            </fieldset>
          </template>
        </WorkspaceForm>
        <button v-if="editing" type="button" :disabled="busy" class="text-sm underline mt-4" @click="cancelEdit">{{ ui('Hủy sửa báo giá') }}</button>
      </section>
      <section class="bg-white border rounded-xl p-6 min-w-0" :class="own ? 'lg:col-span-3' : 'lg:col-span-2'">
        <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
          <h2 class="font-semibold">{{ own ? ui('Báo giá nhận được') : ui('Báo giá của bạn') }}</h2>
          <button v-if="own" :disabled="busy" class="underline text-emerald-700 text-sm" @click="compare">{{ ui('So sánh cùng điều kiện') }}</button>
          <button :disabled="busy" class="underline text-sm text-slate-600" @click="load">{{ ui('Cập nhật') }}</button>
        </div>
        <article v-for="q in quotes" :key="q._id" class="border-t py-4 space-y-3 min-w-0" :data-quote-id="q._id">
          <p class="text-sm font-semibold">{{ ui('Phiên bản báo giá') }} {{ q.version || 1 }} · {{ q.state }}<span v-if="q.acceptedVersion"> · {{ ui('Phiên bản đã chấp thuận') }} {{ q.acceptedVersion }}</span></p>
          <template v-if="(q.lines?.length || 1) === 1"><p class="font-medium">{{ q.price }} {{ q.currency }}/{{ q.unit }} · {{ q.incoterm }}</p><p class="text-sm text-slate-500">{{ q.quantity }} {{ q.unit }}</p></template>
          <ul v-else class="text-sm space-y-2"><li v-for="line in q.lines" :key="line.lineId" class="break-words">{{ line.product }} · {{ line.quantity }} {{ line.unit }} · {{ line.price }} {{ q.currency }}/{{ line.unit }}<p v-if="line.deviations" class="text-amber-800 mt-1">{{ ui('Khác biệt quy cách') }}: {{ line.deviations }}</p></li></ul>
          <p v-if="q.lineSubtotal" class="text-sm">{{ ui('Tổng giá hàng') }}: {{ q.lineSubtotal }} {{ q.currency }}<span v-if="q.chargesDeclared"> · {{ ui('Tổng khoản đã khai') }}: {{ q.quotedTotal }} {{ q.currency }}</span></p>
          <p v-if="q.terms" class="text-sm whitespace-pre-wrap break-words">{{ q.terms }}</p>
          <div class="flex flex-wrap gap-4 text-sm">
            <NuxtLink v-if="own && q.state === 'submitted'" :to="`/workspace/trades?quote=${q._id}&quoteVersion=${q.version || 1}&counterparty=${q.organization}`" class="text-emerald-700 underline">{{ ui('Tạo hợp đồng') }}</NuxtLink>
            <button v-if="!own && ['submitted','withdrawn'].includes(q.state) && rfq?.state === 'open' && rfq.quoteIntakeState !== 'paused'" :disabled="busy" class="underline text-emerald-700" @click="edit(q)">{{ ui('Sửa báo giá') }}</button>
            <button v-if="!own && q.state === 'submitted'" :disabled="busy" class="underline text-amber-800" @click="withdrawConfirm = q._id">{{ ui('Rút lại báo giá') }}</button>
            <button :disabled="busy" class="underline text-slate-600" @click="showHistory(q)">{{ ui('Lịch sử báo giá') }}</button>
          </div>
          <div v-if="withdrawConfirm === q._id" class="flex flex-wrap gap-4 text-sm"><button :disabled="busy" class="underline text-red-700" @click="withdraw(q)">{{ ui('Xác nhận rút báo giá') }}</button><button :disabled="busy" class="underline" @click="withdrawConfirm = ''">{{ ui('Giữ lại') }}</button></div>
        </article>
        <p v-if="!quotes.length" class="text-sm text-slate-500">{{ ui('Chưa có báo giá.') }}</p>
        <section v-if="history" class="mt-5 border-t pt-5 space-y-4">
          <div class="flex flex-wrap gap-3 justify-between"><h3 class="font-semibold">{{ ui('Lịch sử báo giá') }}</h3><button class="underline text-sm" @click="history = null">{{ ui('Đóng lịch sử') }}</button></div>
          <details v-for="(v, index) in history" :key="v.version" :open="index === 0" class="border rounded-lg p-4"><summary class="cursor-pointer text-sm font-medium">{{ ui('Phiên bản') }} {{ v.version }}</summary><p v-if="v.legacyDerived" class="text-xs text-amber-800 mt-3">{{ ui('Chưa có bản lưu lịch sử; nội dung này được lấy từ bản ghi báo giá hiện tại.') }}</p><QuoteSnapshot class="mt-4" :snapshot="v.payload" /></details>
        </section>
        <section v-if="comparison" class="mt-6 border-t pt-5 space-y-3">
          <h3 class="font-semibold">{{ ui('Bảng so sánh') }} {{ comparison.currency }} · {{ comparison.incoterm }}</h3>
          <p class="text-sm text-slate-500">{{ basisLabel(comparison.basis) }}</p>
          <p class="text-xs text-slate-500">{{ ui('Chỉ xếp hạng đủ dòng, cùng quy cách, khối lượng, tiền tệ và Incoterm. Không quy đổi tỷ giá; không làm tròn tổng giá.') }}</p>
          <ol class="space-y-3"><li v-for="(q, index) in comparison.compatible" :key="q._id" class="text-sm border rounded-lg p-3 break-words">{{ index + 1 }}. {{ q.comparisonTotal }} {{ q.currency }} · {{ ui('Phiên bản') }} {{ q.version || 1 }}<p v-if="(q.lines?.length || 1) === 1" class="mt-1 text-slate-500">{{ q.price }} {{ q.currency }}/{{ q.unit }} · {{ q.quantity }} {{ q.unit }}</p></li></ol>
          <article v-for="q in comparison.excluded" :key="q.id" class="text-xs text-amber-800 border border-amber-100 p-3 rounded-lg"><p>{{ ui(q.reason) }}</p><ul class="mt-2 space-y-1"><li v-for="code in q.reasonCodes" :key="code">{{ reasonLabel(code) }}</li></ul></article>
        </section>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { rfqLines, localDatetime } from '~/lib/quotations';
definePageMeta({ layout: 'workspace', middleware: 'auth' });
const { ui } = useWorkspaceText(), route = useRoute();
const { request, organization, loadOrganizations } = usePlatform();
const quotes = ref<any[]>([]), rfq = ref<any>(null), notice = ref(''), comparison = ref<any>(null), busy = ref(false), editing = ref<any>(null), history = ref<any[] | null>(null), lineDrafts = ref<any[]>([]);
const own = computed(() => rfq.value?.organization === organization.value?._id);
const ownQuote = computed(() => quotes.value.find(q => q.organization === organization.value?._id));
const withdrawConfirm = ref('');
const requestedLines = computed(() => rfqLines(rfq.value));
const basisLabel = (basis: string) => ui(basis === 'declared_total' ? 'Tổng giá hàng cùng thuế và cước đã khai' : 'Giá hàng hóa riêng');
const reasonLabel = (code: string) => ui(({ CURRENCY: 'Khác tiền tệ', INCOTERM: 'Khác Incoterm', EXPIRED: 'Báo giá hết hiệu lực', CHARGES_UNKNOWN: 'Chưa khai đầy đủ thuế và cước', MISSING_LINES: 'Thiếu dòng hàng yêu cầu', UNKNOWN_LINE: 'Dòng hàng không thuộc RFQ', SPECIFICATION_DEVIATION: 'Có khác biệt quy cách', UNIT: 'Đơn vị không tương thích', QUANTITY: 'Khác khối lượng yêu cầu', INVALID_LINE: 'Dữ liệu dòng hàng không hợp lệ' } as Record<string,string>)[code] || code);
const initial = computed(() => ({ unit: rfq.value?.unit || 'kg', currency: rfq.value?.currency || 'USD', incoterm: rfq.value?.incoterm || 'FOB', quantity: rfq.value?.quantity || '', taxAmount: '0', freightAmount: '0', ...(editing.value ? { price: editing.value.price, quantity: editing.value.quantity, unit: editing.value.unit, currency: editing.value.currency, incoterm: editing.value.incoterm, validUntil: localDatetime(editing.value.validUntil), terms: editing.value.terms || '', taxAmount: editing.value.taxAmount || '0', freightAmount: editing.value.freightAmount || '0' } : {}) }));
const fields = computed(() => [
  ...((requestedLines.value.length <= 1) ? [{ key: 'price', label: ui('Đơn giá'), required: true }, { key: 'quantity', label: ui('Số lượng'), required: true }, { key: 'unit', label: ui('Đơn vị'), required: true }] : []),
  { key: 'currency', label: ui('Tiền tệ'), required: true }, { key: 'incoterm', label: 'Incoterm', options: ['EXW','FOB','CIF','CFR','DAP','DDP'], required: true }, { key: 'validUntil', label: ui('Hiệu lực đến'), type: 'datetime-local', required: true },
  { key: 'taxAmount', label: ui('Thuế đã khai'), required: true }, { key: 'freightAmount', label: ui('Cước đã khai'), required: true }, { key: 'terms', label: ui('Điều khoản'), type: 'textarea' },
]);
function resetLines(quote?: any) { lineDrafts.value = requestedLines.value.map((line: any) => { const current = quote?.lines?.find((l: any) => l.lineId === line.lineId); return { ...line, price: current?.price || '', quantity: current?.quantity || line.quantity, unit: current?.unit || line.unit, deviations: current?.deviations || '', included: quote ? !!current : true }; }); }
function edit(q: any) { if (busy.value) return; editing.value = q; resetLines(q); }
function cancelEdit() { editing.value = null; resetLines(); }
async function load() {
  if (busy.value) return; busy.value = true; notice.value = '';
  try { await loadOrganizations(); if (!organization.value) { await navigateTo('/workspace/organization?rfq=' + encodeURIComponent(String(route.params.id))); return; } rfq.value = await request(`/platform/rfqs/${route.params.id}`); quotes.value = await request(`/platform/rfqs/${route.params.id}/quotes`); comparison.value = null; if (!editing.value) resetLines(); }
  catch (e: any) { notice.value = e.data?.error?.message || e.message; } finally { busy.value = false; }
}
async function submitQuote(data: any) {
  if (busy.value) return; busy.value = true; notice.value = '';
  try {
    const payload = { ...data, validUntil: new Date(data.validUntil).toISOString() };
    if (requestedLines.value.length > 1) { for (const key of ['price','quantity','unit']) delete payload[key]; payload.lines = lineDrafts.value.filter(l => l.included).map(({ lineId, price, quantity, unit, deviations }) => ({ lineId, price, quantity, unit, deviations })); }
    if (editing.value) payload.expectedVersion = editing.value.version || 1;
    await request(`/platform/rfqs/${route.params.id}/quotes` + (editing.value ? '/' + editing.value._id : ''), editing.value ? 'PUT' : 'POST', payload);
    editing.value = null; history.value = null; comparison.value = null;
    quotes.value = await request(`/platform/rfqs/${route.params.id}/quotes`); resetLines(); notice.value = ui('Đã lưu phiên bản báo giá.');
  } catch (e: any) { notice.value = e.data?.error?.message || e.message; } finally { busy.value = false; }
}
async function compare() { if (busy.value) return; busy.value = true; try { comparison.value = await request(`/platform/rfqs/${route.params.id}/comparison`); } catch (e: any) { notice.value = e.data?.error?.message || e.message; } finally { busy.value = false; } }
async function showHistory(q: any) { if (busy.value) return; busy.value = true; try { history.value = await request(`/platform/rfqs/${route.params.id}/quotes/${q._id}/versions`); } catch (e: any) { notice.value = e.data?.error?.message || e.message; } finally { busy.value = false; } }
async function withdraw(q: any) { if (busy.value) return; busy.value = true; try { await request(`/platform/rfqs/${route.params.id}/quotes/${q._id}/withdraw`, 'POST', { expectedVersion: q.version || 1 }); quotes.value = await request(`/platform/rfqs/${route.params.id}/quotes`); editing.value = null; history.value = null; comparison.value = null; withdrawConfirm.value = ''; } catch (e: any) { notice.value = e.data?.error?.message || e.message; } finally { busy.value = false; } }
onMounted(load);
</script>
