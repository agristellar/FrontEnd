<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">{{ ui("Không gian cộng tác") }}</h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Mỗi workspace chỉ hiển thị cho thành viên của các tổ chức được chọn.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="bg-amber-50 p-3 rounded-lg mb-4">
      {{ notice }}
    </p>
    <div class="grid lg:grid-cols-3 gap-6">
      <aside class="bg-white border rounded-xl p-5">
        <h2 class="font-semibold mb-4">Workspace</h2>
        <button
          v-for="w in workspaces"
          :key="w._id"
          class="block text-left w-full p-3 rounded-lg hover:bg-emerald-50"
          :class="{ 'bg-emerald-50': selected === w._id }"
          @click="select(w._id)"
        >
          {{ w.title }}
        </button>
        <form class="border-t mt-5 pt-5 space-y-3" @submit.prevent="create">
          <h3 class="font-medium text-sm">{{ ui("Tạo workspace") }}</h3>
          <input
            v-model="title"
            :placeholder="ui('Tên nhóm')"
            required
            class="w-full rounded-lg border-slate-300"
            :aria-label="ui('Tên workspace')"
          /><select
            v-model="partner"
            class="w-full rounded-lg border-slate-300"
            :aria-label="ui('Đối tác')"
          >
            <option value="">{{ ui("Chọn đối tác") }}</option>
            <option v-for="p in partners" :key="p._id" :value="p._id">
              {{ p.name }}
            </option></select
          ><button class="bg-emerald-700 text-white py-2 px-4 rounded-lg">
            {{ ui("Tạo nhóm") }}
          </button>
        </form>
      </aside>
      <section class="lg:col-span-2 bg-white border rounded-xl p-5">
        <div class="flex justify-between">
          <h2 class="font-semibold">{{ ui("Trao đổi") }}</h2>
          <button
            v-if="selected"
            class="text-sm text-emerald-700 underline"
            @click="loadMessages"
          >
            {{ ui("Cập nhật") }}
          </button>
        </div>
        <div class="min-h-64 py-4 space-y-4">
          <article
            v-for="m in messages"
            :key="m._id"
            class="bg-slate-50 p-4 rounded-lg"
          >
            <p class="text-xs text-slate-500 mb-2">
              {{ m.author?.fullName || ui("Thành viên") }} ·
              {{ new Date(m.createdAt).toLocaleString("vi-VN") }}
            </p>
            <p class="text-sm whitespace-pre-wrap">{{ m.body }}</p>
          </article>
          <p v-if="!messages.length" class="text-sm text-slate-500">
            {{
              selected
                ? ui("Chưa có tin nhắn.")
                : ui("Chọn workspace để trao đổi.")
            }}
          </p>
        </div>
        <form
          v-if="selected"
          class="space-y-3 border-t pt-4"
          @submit.prevent="send"
        >
          <textarea
            v-model="body"
            rows="3"
            required
            :placeholder="ui('Nội dung trao đổi')"
            :aria-label="ui('Tin nhắn')"
            class="w-full rounded-lg border-slate-300"
          /><button class="bg-emerald-700 text-white px-4 py-2 rounded-lg">
            {{ ui("Gửi tin nhắn") }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request, organization } = usePlatform();
const workspaces = ref<any[]>([]);
const partners = ref<any[]>([]);
const messages = ref<any[]>([]);
const selected = ref("");
const title = ref("");
const partner = ref("");
const body = ref("");
const notice = ref("");
async function load() {
  try {
    workspaces.value = await request("/platform/workspaces");
    partners.value = (await request("/platform/directory")).items.filter(
      (p: any) => p._id !== organization.value?._id,
    );
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function select(id: string) {
  selected.value = id;
  await loadMessages();
}
async function loadMessages() {
  try {
    messages.value = (
      await request(`/platform/workspaces/${selected.value}/messages`)
    ).reverse();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function create() {
  try {
    const w = await request("/platform/workspaces", "POST", {
      title: title.value,
      organizations: partner.value ? [partner.value] : [],
    });
    title.value = "";
    await load();
    await select(w._id);
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function send() {
  try {
    await request(`/platform/workspaces/${selected.value}/messages`, "POST", {
      body: body.value,
    });
    body.value = "";
    await loadMessages();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
</script>
