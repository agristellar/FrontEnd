<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">{{ ui("Đối tác & sản phẩm") }}</h1>
    <p class="text-slate-500 mb-6">
      {{ ui("Tìm nguồn cung và nhu cầu mua hàng từ hồ sơ được công bố.") }}
    </p>
    <form class="flex flex-wrap gap-3 mb-6" @submit.prevent="load">
      <input
        v-model="query"
        :placeholder="ui('Tên doanh nghiệp hoặc ngành hàng')"
        class="rounded-lg border-slate-300 flex-1 min-w-48"
        :aria-label="ui('Tìm kiếm')"
      /><select
        v-model="kind"
        class="rounded-lg border-slate-300"
        :aria-label="ui('Loại đối tác')"
      >
        <option value="">{{ ui("Tất cả đối tác") }}</option>
        <option>Buyer</option>
        <option>Supplier</option></select
      ><button class="bg-emerald-700 text-white px-5 rounded-lg">
        {{ ui("Tìm kiếm") }}
      </button>
    </form>
    <p v-if="error" role="alert">{{ error }}</p>
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      <article
        v-for="o in items"
        :key="o._id"
        class="bg-white rounded-xl border p-5"
      >
        <div class="flex justify-between gap-2">
          <span class="text-xs font-medium text-emerald-700"
            >{{ o.kind }} · {{ o.country }}</span
          ><span class="text-xs bg-emerald-50 px-2 py-1 rounded"
            >Level {{ o.tier }}</span
          >
        </div>
        <h2 class="text-lg font-semibold mt-3">{{ o.name }}</h2>
        <p class="text-sm text-slate-500 my-3">
          {{ o.description || ui("Chưa có giới thiệu") }}
        </p>
        <p class="text-sm">{{ o.products?.join(", ") }}</p>
        <div class="flex gap-3 mt-5">
          <button class="text-sm text-emerald-700 underline" @click="view(o)">
            {{ ui("Xem hồ sơ") }}</button
          ><button class="text-sm text-slate-600 underline" @click="lead(o)">
            {{ ui("Lưu tiềm năng") }}
          </button>
        </div>
      </article>
    </div>
    <p
      v-if="!items.length && !error"
      class="p-10 bg-white border rounded-xl text-center text-slate-500"
    >
      {{ ui("Chưa có hồ sơ phù hợp.") }}
    </p>
    <section v-if="profile" class="bg-white border rounded-xl p-6 mt-6">
      <h2 class="text-xl font-semibold">{{ profile.organization.name }}</h2>
      <p class="my-3 text-sm">
        {{ ui("Quyền xem đến Level") }} {{ profile.accessLevel }}
      </p>
      <div v-for="p in profile.profiles" :key="p.id" class="border-t py-4">
        <h3 class="font-medium">{{ ui("Hồ sơ Level") }} {{ p.level }}</h3>
        <dl>
          <div
            v-for="(v, k) in p.values"
            :key="k"
            class="flex gap-4 text-sm mt-2"
          >
            <dt class="text-slate-500">{{ k }}</dt>
            <dd>{{ v }}</dd>
          </div>
        </dl>
        <p class="text-xs text-slate-400 break-all mt-3">
          Commitment {{ p.commitment }}
        </p>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request } = usePlatform();
const query = ref("");
const kind = ref("");
const items = ref<any[]>([]);
const profile = ref<any>(null);
const error = ref("");
async function load() {
  try {
    const q = new URLSearchParams({
      ...(query.value ? { q: query.value } : {}),
      ...(kind.value ? { kind: kind.value } : {}),
    });
    items.value = (await request(`/platform/directory?${q}`)).items;
    error.value = "";
  } catch (e: any) {
    error.value = e.data?.error?.message || e.message;
  }
}
async function view(o: any) {
  try {
    profile.value = await request(`/platform/directory/${o._id}/profile`);
  } catch (e: any) {
    error.value = e.data?.error?.message || e.message;
  }
}
async function lead(o: any) {
  try {
    await request("/platform/leads", "POST", { target: o._id, stage: "new" });
    error.value = ui("Đã lưu đối tác tiềm năng");
  } catch (e: any) {
    error.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
</script>
