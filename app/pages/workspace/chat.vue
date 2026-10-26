<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-semibold">{{ ui("Chat AgriStellar") }}</h1>
      <p class="text-slate-500 mt-2 max-w-3xl">{{ ui("Tra cứu supplier, RFQ, hợp đồng và luồng MoneyGram theo quyền của tổ chức đang chọn.") }}</p>
    </header>
    <p v-if="notice" role="status" class="rounded-xl border border-amber-200 bg-amber-50 p-4 break-words">{{ notice }}</p>

    <form v-if="isAdmin" class="max-w-3xl bg-white border rounded-xl p-6 space-y-5" @submit.prevent="savePolicy">
      <h2 class="text-lg font-semibold">{{ ui("Cấu hình bot chat trên website") }}</h2>
      <p class="text-sm text-slate-500">{{ ui("Cấu hình áp dụng cho tin nhắn mới. Admin quản lý công cụ, không đọc hội thoại riêng của thành viên.") }}</p>
      <fieldset :disabled="busy || !policyLoaded" class="space-y-5">
        <label class="flex gap-3 items-center"><input id="chat-enabled" v-model="settings.enabled" type="checkbox" class="rounded border-slate-300" />{{ ui("Bật bot chat") }}</label>
        <div>
          <h3 class="text-sm font-medium mb-3">{{ ui("Công cụ được phép tra cứu") }}</h3>
          <label v-for="tool in toolOptions" :key="tool.id" class="flex gap-3 items-start py-2">
            <input v-model="settings.tools" :value="tool.id" type="checkbox" class="rounded border-slate-300 mt-1" :data-chat-tool="tool.id" />{{ tool.label }}
          </label>
        </div>
        <label for="chat-max-turns" class="block text-sm font-medium">{{ ui("Số lượt hỏi tối đa mỗi hội thoại") }}</label>
        <input id="chat-max-turns" v-model.number="settings.maxTurns" required type="number" min="1" max="100" class="rounded-lg border-slate-300 w-32" />
        <p class="text-sm text-slate-500">{{ ui("Bot hiện tra cứu theo quy tắc. Không gửi nội dung chat tới model hoặc tự thực hiện thao tác tài chính.") }}</p>
        <button class="block bg-emerald-700 text-white px-5 py-2.5 rounded-lg disabled:opacity-40" :disabled="busy">{{ ui("Lưu cấu hình chat") }}</button>
      </fieldset>
    </form>

    <template v-else>
      <div class="flex flex-wrap gap-3 text-sm items-center">
        <span class="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-3 py-1">{{ ui("Tra cứu theo quy tắc") }}</span>
        <span class="text-slate-500">{{ ui("Hội thoại riêng theo tài khoản và tổ chức") }}</span>
      </div>
      <p v-if="capabilities && !capabilities.enabled" class="text-amber-800 bg-amber-50 border rounded-xl p-4">{{ ui("Bot chat đang tạm dừng. Bạn vẫn có thể xem hoặc xóa lịch sử của mình.") }}</p>
      <div class="grid lg:grid-cols-[17rem_minmax(0,1fr)] gap-5 items-start">
        <aside class="bg-white border rounded-xl p-4 space-y-4 min-w-0">
          <button type="button" :disabled="busy || !capabilities?.enabled" class="w-full bg-emerald-700 text-white rounded-lg px-4 py-2.5 disabled:opacity-40" @click="startNew">{{ ui("Hội thoại mới") }}</button>
          <h2 class="font-semibold text-sm">{{ ui("Lịch sử hội thoại") }}</h2>
          <ul class="space-y-2">
            <li v-for="c in conversations" :key="c._id">
              <button type="button" :disabled="busy" :aria-current="selectedId === c._id ? 'true' : undefined" class="w-full text-left rounded-lg p-3 border hover:bg-emerald-50 disabled:opacity-50" :class="selectedId === c._id ? 'bg-emerald-50 border-emerald-400' : 'border-slate-100'" @click="openConversation(c._id)">
                <span class="block text-sm font-medium break-words">{{ c.title }}</span>
                <span class="block text-xs text-slate-500 mt-1">{{ c.turnCount }} {{ ui("lượt hỏi") }} · {{ formatDate(c.lastMessageAt || c.createdAt) }}</span>
              </button>
            </li>
          </ul>
          <p v-if="!conversations.length" class="text-sm text-slate-500">{{ ui("Chưa có hội thoại.") }}</p>
          <button v-if="nextCursor" type="button" :disabled="busy" class="text-emerald-700 text-sm underline" @click="loadOlder">{{ ui("Xem hội thoại cũ hơn") }}</button>
        </aside>

        <section class="bg-white border rounded-xl min-w-0 overflow-hidden" :aria-busy="busy">
          <div class="border-b p-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-semibold break-words min-w-0">{{ selectedTitle || ui("Hội thoại mới") }}</h2>
            <div v-if="selectedId" class="flex flex-wrap gap-3 text-sm">
              <template v-if="confirmDelete">
                <button type="button" :disabled="busy" class="text-red-700 underline" @click="removeConversation">{{ ui("Xác nhận xóa hội thoại") }}</button>
                <button type="button" :disabled="busy" class="text-slate-600 underline" @click="confirmDelete = false">{{ ui("Giữ lại") }}</button>
              </template>
              <button v-else type="button" :disabled="busy" class="text-slate-500 underline" @click="confirmDelete = true">{{ ui("Xóa hội thoại") }}</button>
            </div>
          </div>
          <div ref="log" role="log" aria-live="polite" :aria-label="ui('Nội dung hội thoại')" tabindex="0" class="p-4 sm:p-6 space-y-6 min-h-72 max-h-[60vh] overflow-y-auto">
            <div v-if="!turns.length" class="py-8 max-w-xl">
              <p class="font-medium">{{ ui("Bạn muốn tìm thông tin gì?") }}</p>
              <p class="text-slate-500 text-sm leading-6 mt-3">{{ ui("Kết quả có đường dẫn nguồn và thời điểm tra cứu. Bot không xem dữ liệu của tổ chức khác khi bạn chưa được cấp quyền.") }}</p>
            </div>
            <article v-for="turn in turns" :key="turn._id" class="space-y-3" :data-chat-turn="turn._id">
              <div class="ml-auto max-w-[92%] sm:max-w-[85%] bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p class="text-xs text-emerald-800 font-semibold mb-2">{{ ui("Bạn") }}</p>
                <p class="text-sm whitespace-pre-wrap break-words">{{ turn.message }}</p>
              </div>
              <div class="max-w-full sm:max-w-[94%] bg-slate-50 border rounded-xl p-4">
                <p class="text-xs text-slate-500 font-semibold mb-2">AgriStellar · {{ toolName(turn.response.tool) }}</p>
                <p class="text-sm leading-6 whitespace-pre-wrap break-words">{{ turn.response.summary }}</p>
                <p v-if="turn.response.query" class="text-xs text-slate-500 mt-3 break-words">{{ ui("Từ khóa") }}: {{ turn.response.query }}</p>
                <p v-if="turn.response.filters?.country" class="text-xs text-slate-500 mt-1">{{ ui("Quốc gia") }}: {{ turn.response.filters.country }}</p>
                <ul v-if="turn.response.items?.length" class="space-y-3 mt-4">
                  <li v-for="(item, i) in turn.response.items" :key="item.id || i" class="bg-white border rounded-lg p-3 min-w-0">
                    <a :href="safeHref(item.href)" class="text-emerald-800 font-medium underline text-sm break-words">{{ item.title }}</a>
                    <p v-for="(line, j) in item.lines" :key="j" class="text-sm text-slate-600 mt-1 break-words">{{ line }}</p>
                  </li>
                </ul>
                <div v-if="turn.response.links?.length" class="flex flex-wrap gap-4 mt-4">
                  <a v-for="link in turn.response.links" :key="link.href" :href="safeHref(link.href)" :target="link.href.startsWith('https:') ? '_blank' : undefined" rel="noopener noreferrer" class="text-sm text-emerald-700 underline">{{ link.title }}</a>
                </div>
                <p class="text-xs text-slate-400 mt-4">{{ ui("Dữ liệu lúc") }} {{ formatDate(turn.response.asOf) }}</p>
              </div>
            </article>
          </div>
          <div class="border-t p-4 sm:p-6 space-y-4">
            <div class="flex flex-wrap gap-2">
              <button v-for="prompt in prompts" :key="prompt.tool" type="button" :disabled="busy || !capabilities?.enabled || !capabilities.tools.includes(prompt.tool)" class="text-xs border rounded-full px-3 py-2 hover:bg-emerald-50 disabled:opacity-35" @click="fillPrompt(prompt.text)">{{ prompt.label }}</button>
            </div>
            <p v-if="atLimit" class="text-sm text-amber-800">{{ ui("Hội thoại đã đạt giới hạn. Tạo hội thoại mới để tiếp tục.") }}</p>
            <form @submit.prevent="send">
              <fieldset :disabled="busy || !capabilities?.enabled || atLimit" class="space-y-3">
                <label for="chat-message" class="text-sm font-medium block">{{ ui("Câu hỏi") }}</label>
                <textarea id="chat-message" ref="composer" v-model="message" required maxlength="2000" rows="3" autocomplete="off" :placeholder="ui('Ví dụ: Tìm nhà cung cấp cà phê ở Việt Nam')" class="w-full rounded-lg border-slate-300 resize-y min-h-24 disabled:bg-slate-50" @keydown.ctrl.enter.prevent="send" @keydown.meta.enter.prevent="send" />
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <p class="text-xs text-slate-500">{{ turns.length }} / {{ capabilities?.maxTurns || '—' }} {{ ui("lượt hỏi") }} · Ctrl/⌘ + Enter</p>
                  <button :disabled="busy || !message.trim()" class="bg-emerald-700 text-white rounded-lg px-5 py-2.5 disabled:opacity-40">{{ busy ? ui("Đang xử lý…") : ui("Gửi câu hỏi") }}</button>
                </div>
              </fieldset>
            </form>
            <p class="text-xs text-slate-500 leading-5">{{ ui("Chat chỉ tra cứu. Bạn thực hiện và xác nhận thao tác tài chính trong mục Ví; không gửi khóa bí mật qua chat.") }}</p>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: "workspace", middleware: "auth" });
const { ui } = useWorkspaceText();
const { locale } = useI18n();
const { user } = useAuth();
const { request, loadOrganizations } = usePlatform();
const router = useRouter(), route = useRoute();
const isAdmin = computed(() => user.value?.role === "Admin");
const busy = ref(false), notice = ref(""), confirmDelete = ref(false);
const policyLoaded = ref(false);
const capabilities = ref<any>(null);
const settings = reactive({ enabled: true, tools: [] as string[], maxTurns: 60 });
const conversations = ref<any[]>([]), turns = ref<any[]>([]);
const nextCursor = ref<string | null>(null), selectedId = ref(""), selectedTitle = ref(""), message = ref("");
const composer = ref<HTMLTextAreaElement | null>(null), log = ref<HTMLElement | null>(null);
let creationKey = "", creationTitle = "", pendingMessage: { text: string; language: string; key: string } | undefined;
const atLimit = computed(() => !!capabilities.value && turns.value.length >= capabilities.value.maxTurns);
const toolOptions = computed(() => [
  { id: "directory.search", label: ui("Danh bạ công khai") },
  { id: "rfq.list", label: ui("RFQ được phép xem") },
  { id: "trade.status", label: ui("Hợp đồng của tổ chức") },
  { id: "kyb.own", label: ui("Hồ sơ tổ chức đang chọn") },
  { id: "moneygram.help", label: ui("Hướng dẫn MoneyGram") },
]);
const prompts = computed(() => [
  { tool: "directory.search", label: ui("Tìm supplier"), text: ui("Tìm nhà cung cấp cà phê ở Việt Nam") },
  { tool: "rfq.list", label: "RFQ", text: ui("Xem các RFQ") },
  { tool: "trade.status", label: ui("Hợp đồng"), text: ui("Xem hợp đồng của tôi") },
  { tool: "kyb.own", label: ui("Hồ sơ"), text: ui("Xem hồ sơ tổ chức của tôi") },
  { tool: "moneygram.help", label: "MoneyGram", text: ui("Nạp tiền qua MoneyGram như thế nào?") },
]);
const toolName = (name: string) => toolOptions.value.find(t => t.id === name)?.label || ui("Hướng dẫn");
const formatDate = (value: string) => value && !Number.isNaN(Date.parse(value)) ? new Intl.DateTimeFormat(locale.value === "en" ? "en-GB" : "vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—";
function safeHref(value: unknown) {
  if (typeof value !== "string") return undefined;
  if (/^\/workspace\/(directory|rfqs(?:\/[a-f0-9]{24})?|trades(?:\/[a-f0-9]{24})?|verification|wallet|assistant)$/.test(value) || value === "https://stellar.org/products-and-tools/moneygram") return value;
  return undefined;
}
async function run(work: () => Promise<void>) {
  if (busy.value) return;
  busy.value = true; notice.value = "";
  try { await work(); }
  catch (e: any) {
    notice.value = e.data?.error?.message || ui("Không kết nối được. Lịch sử đã lưu vẫn được giữ; bạn có thể thử lại.");
    if (!isAdmin.value && ["CHAT_DISABLED", "CHAT_TOOL_DISABLED", "CHAT_HISTORY_LIMIT"].includes(e.data?.error?.code)) {
      try { capabilities.value = await request("/chat/capabilities"); } catch { /* Keep the previous view when offline. */ }
    }
  }
  finally { busy.value = false; }
}
async function list(append = false) {
  const page = await request("/chat/conversations" + (append && nextCursor.value ? "?before=" + nextCursor.value : ""));
  conversations.value = append ? [...conversations.value, ...page.items.filter((c: any) => !conversations.value.some(old => old._id === c._id))] : page.items;
  nextCursor.value = page.nextCursor;
}
async function scrollBottom() { await nextTick(); if (log.value) log.value.scrollTop = log.value.scrollHeight; }
function clearSelection() { selectedId.value = ""; selectedTitle.value = ""; turns.value = []; confirmDelete.value = false; creationKey = ""; creationTitle = ""; pendingMessage = undefined; }
async function startNew() {
  if (busy.value) return;
  clearSelection(); notice.value = "";
  await router.replace({ query: { ...route.query, conversation: undefined } });
  await nextTick(); composer.value?.focus();
}
async function openConversation(id: string) {
  return run(async () => {
    clearSelection();
    const data = await request("/chat/conversations/" + id);
    selectedId.value = data.conversation._id; selectedTitle.value = data.conversation.title; turns.value = data.turns;
    await router.replace({ query: { ...route.query, conversation: id } }); await scrollBottom();
  });
}
function fillPrompt(text: string) { if (!busy.value) { message.value = text; composer.value?.focus(); } }
async function send() {
  const text = message.value.trim();
  if (busy.value || !text || !capabilities.value?.enabled || atLimit.value) return;
  if (/\bS[A-Z2-7]{55}\b/.test(text)) { notice.value = ui("Không gửi khóa bí mật Stellar qua chat."); return; }
  return run(async () => {
    const language = locale.value === "en" ? "en" : "vi";
    if (!selectedId.value) {
      if (!creationKey) { creationKey = crypto.randomUUID(); creationTitle = text.slice(0, 100); }
      const conversation = await request("/chat/conversations", "POST", { title: creationTitle, key: creationKey });
      selectedId.value = conversation._id; selectedTitle.value = conversation.title;
      await router.replace({ query: { ...route.query, conversation: conversation._id } });
    }
    if (!pendingMessage || pendingMessage.text !== text || pendingMessage.language !== language) pendingMessage = { text, language, key: crypto.randomUUID() };
    const turn = await request(`/chat/conversations/${selectedId.value}/messages`, "POST", { message: text, language, key: pendingMessage.key });
    if (!turns.value.some(t => t._id === turn._id)) turns.value.push(turn);
    pendingMessage = undefined; message.value = ""; await list(); await scrollBottom();
  });
}
async function removeConversation() {
  return run(async () => {
    await request("/chat/conversations/" + selectedId.value, "DELETE"); clearSelection();
    await router.replace({ query: { ...route.query, conversation: undefined } }); await list();
  });
}
const loadOlder = () => run(() => list(true));
async function savePolicy() {
  return run(async () => { const p = await request("/chat/admin/policy", "PUT", { enabled: settings.enabled, tools: settings.tools, maxTurns: settings.maxTurns }); Object.assign(settings, p); notice.value = ui("Đã lưu cấu hình bot chat."); });
}
onMounted(async () => {
  await run(async () => {
    if (isAdmin.value) { Object.assign(settings, await request("/chat/admin/policy")); policyLoaded.value = true; return; }
    await loadOrganizations(); capabilities.value = await request("/chat/capabilities"); await list();
    const id = route.query.conversation;
    if (typeof id === "string" && /^[a-f0-9]{24}$/.test(id)) { const data = await request("/chat/conversations/" + id); selectedId.value = id; selectedTitle.value = data.conversation.title; turns.value = data.turns; await scrollBottom(); }
  });
});
</script>
