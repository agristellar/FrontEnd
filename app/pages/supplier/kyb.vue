<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('supplier.kybVerification') }}</h1>

    <!-- Status Banner -->
    <div v-if="profile" class="mb-6">
      <div v-if="profile.verificationStatus === 'Verified'" class="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
        <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p class="text-sm font-medium text-green-800">{{ $t('supplier.businessVerified') }}</p>
      </div>
      <div v-else-if="profile.verificationStatus === 'Rejected'" class="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p class="text-sm font-medium text-red-800">{{ $t('supplier.verificationRejected') }}</p>
        <p v-if="profile.rejectionReason" class="text-sm text-red-700 mt-1">{{ $t('supplier.rejectionReason') }}: {{ profile.rejectionReason }}</p>
      </div>
      <div v-else class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
        <svg class="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p class="text-sm font-medium text-yellow-800">{{ $t('supplier.verificationPending') }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Business Info -->
      <BaseCard :title="$t('supplier.businessInfo')">
        <form @submit.prevent="submitKYB" class="space-y-4">
          <BaseInput v-model="form.legalName" :label="$t('supplier.legalName')" :error="fieldErrors.legalName" required />
          <BaseInput v-model="form.taxId" :label="$t('supplier.taxId')" :error="fieldErrors.taxId" required />
          <BaseInput v-model="form.representativeName" :label="$t('supplier.representative')" :error="fieldErrors.representativeName" required />
          <BaseInput v-model="form.growingArea" :label="$t('supplier.growingArea')" :error="fieldErrors.growingArea" />
          <BaseInput v-model="form.areaSize" :label="$t('supplier.areaSize')" :error="fieldErrors.areaSize" type="number" />
          <BaseInput v-model="form.estimatedCapacity" :label="$t('supplier.estimatedCapacity')" :error="fieldErrors.estimatedCapacity" type="number" />
          <BaseInput v-model="form.season" :label="$t('supplier.mainSeason')" :error="fieldErrors.season" :placeholder="$t('supplier.seasonPlaceholder')" />

          <div>
            <label class="label">{{ $t('supplier.productTypes') }}</label>
            <div :class="['grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border', fieldErrors.productTypes ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-gray-50/50']">
              <label
                v-for="pt in availableProductTypes"
                :key="pt.value"
                :class="['flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors', form.productTypes.includes(pt.value) ? 'bg-primary-100 text-primary-800 font-medium' : 'bg-white text-gray-700 hover:bg-gray-100']"
              >
                <input
                  type="checkbox"
                  :value="pt.value"
                  :checked="form.productTypes.includes(pt.value)"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  @change="toggleProduct(pt.value)"
                />
                {{ pt.label }}
              </label>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <input
                v-model="productInput"
                :placeholder="$t('supplier.productTypesCustom')"
                class="input-field flex-1 text-sm"
                @keydown.enter.prevent="addProduct"
              />
              <button type="button" class="px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors" @click="addProduct">
                + {{ $t('common.add') }}
              </button>
            </div>
            <div v-if="customProducts.length" class="flex flex-wrap gap-2 mt-2">
              <span v-for="(p, i) in customProducts" :key="i" class="inline-flex items-center gap-1 bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-sm">
                {{ p }}
                <button type="button" @click="removeProduct(p)" class="hover:text-red-600">&times;</button>
              </span>
            </div>
            <p v-if="fieldErrors.productTypes" class="mt-1 text-sm text-red-600">{{ fieldErrors.productTypes }}</p>
          </div>

          <BaseButton type="submit" :loading="submitting" :disabled="profile?.verificationStatus === 'Verified'">
            {{ profile ? $t('supplier.updateKyb') : $t('supplier.submitKyb') }}
          </BaseButton>
        </form>
      </BaseCard>

      <!-- Documents -->
      <BaseCard :title="$t('supplier.documents')">
        <div class="space-y-4">
          <FileUploader
            :label="$t('supplier.businessLicense')"
            accept=".pdf,.jpg,.png"
            hint="PDF, JPG, or PNG up to 5MB"
            @update:model-value="(files: File[]) => licenseFiles = files"
          />
          <FileUploader
            :label="$t('supplier.certificates')"
            accept=".pdf,.jpg,.png"
            :multiple="true"
            :hint="$t('supplier.uploadCertHint')"
            @update:model-value="(files: File[]) => certFiles = files"
          />
          <BaseButton v-if="licenseFiles.length || certFiles.length" :loading="uploading" @click="uploadDocuments">
            {{ $t('supplier.uploadDocuments') }}
          </BaseButton>
        </div>

        <!-- Existing certificates -->
        <div v-if="profile?.certificates?.length" class="mt-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('supplier.uploadedCerts') }}</h4>
          <ul class="space-y-2">
            <li v-for="cert in profile.certificates" :key="cert.name" class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <span>{{ cert.name }} <span class="text-gray-400">- {{ cert.issuedBy }}</span></span>
              <StatusBadge v-if="cert.expiredAt" :status="new Date(cert.expiredAt) > new Date() ? 'Active' : 'Expired'" />
            </li>
          </ul>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'supplier', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const { uploadFiles } = useFileUpload();
const { success, error: notifyError } = useNotification();
const supplierStore = useSupplierStore();

const profile = computed(() => supplierStore.profile);
const loading = ref(true);
const submitting = ref(false);
const uploading = ref(false);
const productInput = ref('');
const licenseFiles = ref<File[]>([]);
const certFiles = ref<File[]>([]);

const form = reactive({
  legalName: '',
  taxId: '',
  representativeName: '',
  growingArea: '',
  areaSize: null as number | null,
  estimatedCapacity: null as number | null,
  season: '',
  productTypes: [] as string[],
});

const fieldErrors = ref<Record<string, string>>({});

const availableProductTypes = computed(() => [
  { value: 'Coffee', label: t('supplier.products.coffee') },
  { value: 'Pepper', label: t('supplier.products.pepper') },
  { value: 'Cashew', label: t('supplier.products.cashew') },
  { value: 'Rice', label: t('supplier.products.rice') },
  { value: 'Dragon Fruit', label: t('supplier.products.dragonFruit') },
  { value: 'Rubber', label: t('supplier.products.rubber') },
  { value: 'Tea', label: t('supplier.products.tea') },
  { value: 'Coconut', label: t('supplier.products.coconut') },
  { value: 'Shrimp', label: t('supplier.products.shrimp') },
]);

const predefinedValues = computed(() => availableProductTypes.value.map((p) => p.value));
const customProducts = computed(() => form.productTypes.filter((p) => !predefinedValues.value.includes(p)));

const toggleProduct = (value: string) => {
  const idx = form.productTypes.indexOf(value);
  if (idx >= 0) form.productTypes.splice(idx, 1);
  else form.productTypes.push(value);
};

const addProduct = () => {
  const val = productInput.value.trim();
  if (val && !form.productTypes.includes(val)) {
    form.productTypes.push(val);
  }
  productInput.value = '';
};

const removeProduct = (value: string) => {
  const idx = form.productTypes.indexOf(value);
  if (idx >= 0) form.productTypes.splice(idx, 1);
};

const submitKYB = async () => {
  submitting.value = true;
  fieldErrors.value = {};
  try {
    const res = await api.post('/suppliers/kyb', form);
    if (res.success) {
      supplierStore.setProfile(res.data);
      await loadProfile();
      success(t('supplier.kybSubmitted'), t('supplier.kybSubmittedDesc'));
    }
  } catch (err: any) {
    const apiError = err?.data?.error;
    if (apiError?.details?.length) {
      for (const d of apiError.details) {
        fieldErrors.value[d.field] = d.message;
      }
    }
    notifyError('Error', apiError?.message || t('supplier.kybSubmittedDesc'));
  }
  submitting.value = false;
};

const uploadDocuments = async () => {
  uploading.value = true;
  try {
    const allFiles = [...licenseFiles.value, ...certFiles.value];
    if (allFiles.length) {
      await uploadFiles('/suppliers/kyb/documents', allFiles);
      success(t('supplier.uploaded'), t('supplier.uploadedDesc'));
    }
  } catch (err: any) {
    notifyError('Upload Failed', err?.data?.error?.message || 'Failed to upload documents');
  }
  uploading.value = false;
};

const fillForm = (data: any) => {
  if (!data) return;
  form.legalName = data.legalName || '';
  form.taxId = data.taxId || '';
  form.representativeName = data.representativeName || '';
  form.growingArea = data.growingArea || '';
  form.areaSize = data.areaSize || null;
  form.estimatedCapacity = data.estimatedCapacity || null;
  form.season = data.season || '';
  form.productTypes.splice(0, form.productTypes.length, ...(data.productTypes || []));
};

const loadProfile = async () => {
  try {
    const res = await api.get('/suppliers/me');
    if (res.success && res.data) {
      supplierStore.setProfile(res.data);
      fillForm(res.data);
    }
  } catch (err: any) {
    if (err?.response?.status !== 404 && err?.status !== 404) {
      notifyError('Error', err?.data?.error?.message || t('common.loadError'));
    }
  }
};

watch(
  () => profile.value,
  (next) => {
    if (next) fillForm(next);
  },
  { immediate: true }
);

onMounted(async () => {
  loading.value = true;
  try {
    await loadProfile();
  } finally {
    loading.value = false;
  }
});
</script>
