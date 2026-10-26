<template>
  <span class="inline-flex flex-col items-start gap-1 max-w-full min-w-0" data-legacy-document-download>
    <button v-if="target" type="button" :disabled="busy" :aria-label="ui('Tải tài liệu') + ': ' + (name || target.filename)" class="text-sm text-emerald-700 underline font-medium disabled:opacity-50" @click="download">{{ ui(busy ? 'Đang tải tài liệu' : 'Tải tài liệu') }}</button>
    <span v-else class="text-xs text-slate-500 break-words">{{ ui('Tài liệu cũ cần được đối chiếu trước khi tải.') }}</span>
    <span v-if="failed" role="status" class="text-xs text-red-700 break-words">{{ ui('Không thể tải tài liệu. Hãy kiểm tra quyền truy cập hoặc thử lại.') }}</span>
  </span>
</template>
<script setup lang="ts">
import { legacyDownloadName, legacyDownloadTarget } from '~/lib/legacy-download';
const props = defineProps<{ fileUrl: unknown; name?: string }>();
const { ui } = useWorkspaceText(), { $api } = useNuxtApp(), config = useRuntimeConfig();
const busy = ref(false), failed = ref(false);
const target = computed(() => legacyDownloadTarget(props.fileUrl, String(config.public.apiBase), import.meta.client ? window.location.origin : 'http://localhost'));
watch(() => props.fileUrl, () => { failed.value = false; });
async function download() {
  const destination = target.value;
  if (!destination || busy.value) return;
  busy.value = true; failed.value = false;
  try {
    const blob = await $api<Blob>(destination.url, { method: 'GET', responseType: 'blob', retry: 0, credentials: 'omit' });
    const localUrl = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = localUrl; anchor.download = legacyDownloadName(props.name, destination.filename);
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(localUrl), 1000);
  } catch { failed.value = true; }
  finally { busy.value = false; }
}
</script>
