<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">
      {{ ui("CRM & chiến dịch email") }}
    </h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Lưu nguồn đồng ý nhận thư, chọn người nhận và xác nhận lịch gửi. Mỗi email có đường dẫn hủy đăng ký.",
        )
      }}
    </p>
    <p v-if="notice" class="p-4 bg-amber-50 rounded-xl mb-5" role="status">
      {{ notice }}
    </p>
    <div class="grid lg:grid-cols-2 gap-6">
      <section class="bg-white p-6 border rounded-xl">
        <h2 class="font-semibold mb-4">{{ ui("Thêm liên hệ") }}</h2>
        <WorkspaceForm :fields="contactFields" @submit="addContact" />
        <div class="border-t mt-6 pt-4 space-y-3">
          <div v-for="c in contacts" :key="c._id" class="text-sm flex gap-3">
            <input
              v-model="selected"
              :value="c._id"
              :disabled="c.state !== 'subscribed'"
              type="checkbox"
              :aria-label="ui('Chọn ') + c.email + ''"
              class="rounded border-slate-300 mt-1"
            />
            <div class="min-w-0">
              <p class="break-words">{{ c.name }} · {{ c.email }}</p>
              <p class="text-slate-500">{{ c.state }}</p>
              <button
                v-if="c.state === 'subscribed'"
                class="underline text-red-700"
                @click="unsubscribe(c)"
              >
                {{ ui("Ngừng nhận thư") }}
              </button>
            </div>
          </div>
        </div>
      </section>
      <section class="bg-white p-6 border rounded-xl">
        <h2 class="font-semibold mb-4">{{ ui("Soạn chiến dịch") }}</h2>
        <WorkspaceForm :fields="campaignFields" @submit="createCampaign" />
        <article v-for="c in campaigns" :key="c._id" class="border-t pt-4 mt-5">
          <h3 class="font-medium">{{ c.title }}</h3>
          <p class="text-sm text-slate-500">
            {{ c.state }} {{ ui("· Đã gửi") }} {{ c.sent }} {{ ui("· Lỗi") }}
            {{ c.failed }}
          </p>
          <p class="text-sm mt-2">{{ c.subject }}</p>
          <div class="flex gap-4 text-sm mt-3">
            <button
              v-if="c.state === 'draft'"
              class="underline text-emerald-700"
              @click="queue(c)"
            >
              {{ ui("Lên lịch gửi cho") }} {{ selected.length }}
              {{ ui("liên hệ đã chọn") }}</button
            ><button
              v-if="['draft', 'queued', 'sending'].includes(c.state)"
              class="underline text-red-700"
              @click="cancel(c)"
            >
              {{ ui("Hủy chiến dịch") }}
            </button>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request } = usePlatform();
const contacts = ref<any[]>([]);
const campaigns = ref<any[]>([]);
const selected = ref<string[]>([]);
const notice = ref("");
const contactFields = [
  { key: "name", label: ui("Tên liên hệ"), required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "company", label: ui("Doanh nghiệp") },
  { key: "consentSource", label: ui("Nguồn đồng ý nhận thư"), required: true },
  {
    key: "consentedAt",
    label: ui("Thời điểm đồng ý"),
    type: "datetime-local",
    required: true,
  },
];
const campaignFields = [
  { key: "title", label: ui("Tên chiến dịch"), required: true },
  { key: "subject", label: ui("Tiêu đề email"), required: true },
  {
    key: "text",
    label: ui("Nội dung email"),
    type: "textarea",
    required: true,
  },
  {
    key: "startsAt",
    label: ui("Thời điểm gửi (để trống để gửi ngay)"),
    type: "datetime-local",
  },
];
async function load() {
  try {
    [contacts.value, campaigns.value] = await Promise.all([
      request("/marketing/contacts"),
      request("/marketing/campaigns"),
    ]);
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function post(path: string, body: any) {
  try {
    await request(path, "POST", body);
    await load();
    notice.value = ui("Đã cập nhật");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function addContact(d: any) {
  if (!d.company) delete d.company;
  await post("/marketing/contacts", {
    ...d,
    consentedAt: new Date(d.consentedAt).toISOString(),
  });
}
async function createCampaign(d: any) {
  if (d.startsAt) d.startsAt = new Date(d.startsAt).toISOString();
  else delete d.startsAt;
  await post("/marketing/campaigns", d);
}
async function queue(c: any) {
  await post(`/marketing/campaigns/${c._id}/queue`, {
    contacts: selected.value,
  });
}
async function cancel(c: any) {
  await post(`/marketing/campaigns/${c._id}/cancel`, {});
}
async function unsubscribe(c: any) {
  await post(`/marketing/contacts/${c._id}/unsubscribe`, {});
}
onMounted(load);
</script>
