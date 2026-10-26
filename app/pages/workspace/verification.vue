<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">
      {{ ui("Xác minh & chứng nhận") }}
    </h1>
    <p class="text-slate-500 mb-6">
      {{
        ui(
          "Nộp từng cấp hồ sơ theo schema admin công bố. Chấp thuận trong ứng dụng và chứng thực trên Stellar có trạng thái riêng.",
        )
      }}
    </p>
    <p v-if="notice" role="status" class="bg-amber-50 p-4 rounded-lg mb-5">
      {{ notice }}
    </p>
    <button class="text-emerald-700 underline mb-5" @click="anchorProfile">
      {{ ui("Ký neo hồ sơ tổ chức vào registry Stellar") }}
    </button>
    <PrivateEvidenceUploader
      class="mb-6 bg-white"
      @uploaded="uploaded = $event"
    />
    <div class="grid lg:grid-cols-2 gap-6">
      <section class="bg-white border rounded-xl p-6">
        <h2 class="font-semibold mb-4">{{ ui("Nộp hồ sơ") }}</h2>
        <label for="schema" class="block text-sm mb-2">{{
          ui("Cấp hồ sơ")
        }}</label
        ><select
          id="schema"
          v-model="schemaId"
          class="w-full rounded-lg border-slate-300 mb-5"
        >
          <option value="">{{ ui("Chọn schema đang áp dụng") }}</option>
          <option v-for="s in schemas" :key="s._id" :value="s._id">
            Level {{ s.level }} {{ ui("· phiên bản") }} {{ s.version }}
          </option></select
        ><WorkspaceForm
          v-if="schema"
          :key="schemaId"
          :fields="profileFields"
          @submit="submitProfile"
        />
        <p v-if="!schemas.length" class="text-sm text-slate-500">
          {{ ui("Admin chưa công bố schema.") }}
        </p>
      </section>
      <section class="bg-white border rounded-xl p-6">
        <h2 class="font-semibold mb-4">{{ ui("Lịch sử thẩm định") }}</h2>
        <article v-for="v in submissions" :key="v._id" class="border-t py-4">
          <p class="font-medium">Level {{ v.level }} · {{ v.state }}</p>
          <p class="text-sm text-slate-500 mt-2">{{ v.reason }}</p>
          <p class="text-xs text-slate-400 break-all mt-2">
            Commitment {{ v.commitment }}
          </p>
        </article>
        <p v-if="!submissions.length" class="text-sm text-slate-500">
          {{ ui("Chưa nộp hồ sơ.") }}
        </p>
      </section>
      <section class="bg-white border rounded-xl p-6">
        <h2 class="font-semibold mb-4">{{ ui("Thêm chứng nhận") }}</h2>
        <WorkspaceForm
          :fields="certificateFields"
          :initial="
            uploaded
              ? { evidence: uploaded.reference, hash: uploaded.sha256 }
              : {}
          "
          @submit="submitCertificate"
        />
      </section>
      <section class="bg-white border rounded-xl p-6">
        <h2 class="font-semibold mb-4">{{ ui("Chứng nhận doanh nghiệp") }}</h2>
        <article
          v-for="c in certificates"
          :key="c._id"
          class="border-t py-4 text-sm"
        >
          <p class="font-medium">{{ c.name }} · {{ c.state }}</p>
          <p class="text-slate-500 mt-2">{{ c.issuer }} · {{ c.reference }}</p>
          <p class="text-xs mt-2">
            {{ ui("Hết hạn") }}
            {{ new Date(c.expiresAt).toLocaleDateString("vi-VN") }}
          </p>
        </article>
      </section>
      <section class="bg-white border rounded-xl p-6">
        <h2 class="font-semibold mb-3">{{ ui("Chia sẻ quyền xem hồ sơ") }}</h2>
        <p class="text-sm text-slate-500 mb-4">
          {{
            ui(
              "Chỉ cấp quyền cho đối tác đã chọn, theo cấp hồ sơ và thời hạn. Có thể thu hồi bất cứ lúc nào.",
            )
          }}
        </p>
        <WorkspaceForm
          :fields="grantFields"
          :submit-label="ui('Cấp quyền xem')"
          @submit="shareProfile"
        />
      </section>
      <section class="bg-white border rounded-xl p-6">
        <h2 class="font-semibold mb-4">{{ ui("Quyền xem đã cấp") }}</h2>
        <article v-for="g in grants" :key="g._id" class="border-t py-4 text-sm">
          <p>{{ g.grantee?.name }} · Level {{ g.level }}</p>
          <p class="text-slate-500 mt-2">
            {{ ui("Hết hạn") }}: {{ new Date(g.expiresAt).toLocaleString() }}
          </p>
          <button
            v-if="!g.revoked"
            class="text-red-700 underline mt-2"
            @click="revokeGrant(g)"
          >
            {{ ui("Thu hồi quyền") }}
          </button>
          <p v-else class="text-slate-500">{{ ui("Đã thu hồi") }}</p>
        </article>
        <p v-if="!grants.length" class="text-sm text-slate-500">
          {{ ui("Chưa cấp quyền xem hồ sơ.") }}
        </p>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

definePageMeta({ layout: "workspace", middleware: "auth" });
const { request, organization } = usePlatform();
const grants = ref<any[]>([]);
const partners = ref<any[]>([]);
const grantFields = computed(() => [
  {
    key: "grantee",
    label: ui("Đối tác nhận quyền"),
    required: true,
    options: partners.value
      .filter((p) => p._id !== organization.value?._id)
      .map((p) => ({ value: p._id, label: p.name })),
  },
  {
    key: "level",
    label: ui("Cấp hồ sơ"),
    required: true,
    options: [1, 2, 3, 4].map((n) => ({
      value: String(n),
      label: `Level ${n}`,
    })),
  },
  {
    key: "expiresAt",
    label: ui("Hiệu lực đến"),
    type: "datetime-local",
    required: true,
  },
]);
async function shareProfile(d: any) {
  try {
    await request("/platform/grants", "POST", {
      ...d,
      level: Number(d.level),
      expiresAt: new Date(d.expiresAt).toISOString(),
    });
    await load();
    notice.value = ui("Đã cấp quyền xem hồ sơ");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function revokeGrant(g: any) {
  try {
    await request(`/platform/grants/${g._id}`, "DELETE");
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
const notice = ref("");
const { sign } = useStellarWallet();
async function anchorProfile() {
  try {
    const i = await request(
      "/chain/registry/register",
      "POST",
      {},
      { "Idempotency-Key": crypto.randomUUID() },
    );
    if (i.status === "awaiting_signature") await sign(i);
    notice.value = ui("Đã chuẩn bị neo hồ sơ; theo dõi tại mục Ví.");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
const uploaded = ref<any>(null);
const schemas = ref<any[]>([]);
const schemaId = ref("");
const submissions = ref<any[]>([]);
const certificates = ref<any[]>([]);
const schema = computed(() =>
  schemas.value.find((s) => s._id === schemaId.value),
);
const profileFields = computed(
  () =>
    schema.value?.fields.map((f: any) => ({
      key: f.key,
      label: `${f.label}${f.private ? ui(" · riêng tư") : ""}`,
      required: f.required,
    })) || [],
);
const certificateFields = [
  { key: "name", label: ui("Tên chứng nhận"), required: true },
  { key: "issuer", label: ui("Đơn vị cấp"), required: true },
  { key: "reference", label: ui("Số tham chiếu"), required: true },
  { key: "expiresAt", label: ui("Ngày hết hạn"), type: "date", required: true },
  { key: "evidence", label: ui("Tham chiếu tệp bằng chứng"), required: true },
  { key: "hash", label: ui("SHA256 bằng chứng"), required: true },
];
async function load() {
  try {
    schemas.value = await request("/platform/profile-schemas");
    submissions.value = await request("/platform/verifications");
    certificates.value = await request("/platform/certificates");
    grants.value = await request("/platform/grants");
    partners.value = (await request("/platform/directory")).items;
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function submitProfile(values: any) {
  try {
    await request("/platform/verifications", "POST", {
      schema: schemaId.value,
      values,
      evidence: uploaded.value
        ? [
            {
              label: uploaded.value.name,
              file: uploaded.value.reference,
              hash: uploaded.value.sha256,
            },
          ]
        : [],
    });
    await load();
    notice.value = ui("Đã nộp hồ sơ để thẩm định");
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
async function submitCertificate(d: any) {
  try {
    await request("/platform/certificates", "POST", {
      ...d,
      expiresAt: new Date(d.expiresAt).toISOString(),
    });
    await load();
  } catch (e: any) {
    notice.value = e.data?.error?.message || e.message;
  }
}
onMounted(load);
</script>
