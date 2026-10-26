<template>
  <main class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <section class="max-w-md bg-white rounded-xl border p-8">
      <h1 class="text-2xl font-semibold mb-4">Hủy đăng ký email</h1>
      <p class="text-slate-600 mb-5">{{ message }}</p>
      <button
        v-if="!done"
        :disabled="busy"
        class="px-4 py-2 bg-emerald-700 text-white rounded-lg"
        @click="unsubscribe"
      >
        {{ busy ? "Đang xử lý…" : "Xác nhận ngừng nhận thư" }}
      </button>
    </section>
  </main>
</template>
<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const done = ref(false);
const busy = ref(false);
const message = ref(
  "Xác nhận để ngừng nhận email tiếp thị từ doanh nghiệp này.",
);
async function unsubscribe() {
  busy.value = true;
  try {
    await $fetch(`${config.public.apiBase}/marketing/unsubscribe`, {
      method: "POST",
      body: { token: route.query.token },
    });
    message.value = "Đã ghi nhận hủy đăng ký nhận email.";
    done.value = true;
  } catch {
    message.value =
      "Đường dẫn không hợp lệ hoặc dịch vụ tạm thời không sẵn sàng.";
  } finally {
    busy.value = false;
  }
}
</script>
