<template>
  <div class="border rounded-lg p-4 space-y-3">
    <label :for="inputId" class="block text-sm font-medium">{{
      ui("Tải bằng chứng vào kho riêng")
    }}</label
    ><input
      :id="inputId"
      type="file"
      accept="application/pdf,image/png,image/jpeg"
      class="block w-full text-sm"
      :disabled="busy"
      @change="upload"
    />
    <p class="text-xs text-slate-500">
      {{ ui("PDF, PNG hoặc JPEG, tối đa 10 MB. Tệp thuộc tổ chức đang chọn.") }}
    </p>
    <p v-if="notice" role="status" class="text-sm text-amber-700">
      {{ notice }}
    </p>
    <div v-if="file" class="text-xs space-y-2">
      <p class="font-medium">{{ file.name }}</p>
      <p class="break-all text-slate-500">{{ file.reference }}</p>
      <p class="break-all text-slate-500">SHA256 {{ file.sha256 }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

const emit = defineEmits(["uploaded"]);
const { request } = usePlatform();
const inputId = useId();
const busy = ref(false);
const notice = ref("");
const file = ref<any>(null);
async function upload(event: Event) {
  const input = event.target as HTMLInputElement;
  const picked = input.files?.[0];
  if (!picked) return;
  busy.value = true;
  notice.value = "";
  try {
    const form = new FormData();
    form.append("file", picked);
    file.value = await request("/platform/files", "POST", form);
    emit("uploaded", file.value);
    notice.value = ui("Đã mã hóa và lưu bằng chứng");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  } finally {
    busy.value = false;
  }
}
</script>
