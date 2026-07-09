<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/supplier/contracts" class="text-gray-400 hover:text-gray-600">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="page-title">{{ $t('supplier.newContract') }}</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BaseCard :title="$t('supplier.contractInfo')">
        <div class="space-y-4">
          <BaseInput v-model="form.buyerName" :label="$t('supplier.buyerName')" :error="fieldErrors.buyerName" required />
          <BaseInput v-model="form.buyerRegion" :label="$t('supplier.buyerRegion')" :error="fieldErrors.buyerRegion" />
          <BaseInput v-model="form.buyerContactEmail" :label="$t('supplier.buyerContactEmail')" type="email" :error="fieldErrors.buyerContactEmail" />
          <BaseInput v-model="form.product" :label="$t('supplier.productLabel')" :placeholder="$t('supplier.productPlaceholder')" :error="fieldErrors.product" required />
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="form.quantity" :label="$t('supplier.quantity')" type="number" :error="fieldErrors.quantity" required />
            <BaseSelect v-model="form.unit" :label="$t('supplier.unit')" :options="unitOptions" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="form.contractValue" :label="$t('supplier.contractValue')" type="number" :error="fieldErrors.contractValue" required />
            <BaseSelect v-model="form.currency" :label="$t('supplier.currency')" :options="currencyOptions" />
          </div>
          <BaseSelect v-model="form.paymentTerm" :label="$t('supplier.paymentTerm')" :options="paymentTermOptions" :placeholder="$t('supplier.selectPaymentTerm')" />
          <BaseSelect v-model="form.incoterm" :label="$t('supplier.incoterm')" :options="incotermOptions" :placeholder="$t('supplier.selectIncoterm')" />
          <BaseInput v-model="form.deliveryDate" :label="$t('supplier.deliveryDate')" type="date" />
        </div>
      </BaseCard>

      <BaseCard :title="$t('supplier.documents')">
        <div class="space-y-4">
          <FileUploader
            :label="$t('supplier.contractDocuments')"
            accept=".pdf,.jpg,.png"
            :multiple="true"
            hint="PDF, JPG, or PNG up to 5MB"
            @update:model-value="(files: File[]) => contractFiles = files"
          />
        </div>
        <div class="mt-6">
          <BaseButton type="submit" :loading="submitting">
            {{ $t('supplier.createContract') }}
          </BaseButton>
        </div>
      </BaseCard>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'supplier', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const { uploadFiles } = useFileUpload();
const { success, error: notifyError } = useNotification();
const router = useRouter();

const submitting = ref(false);
const contractFiles = ref<File[]>([]);
const fieldErrors = ref<Record<string, string>>({});

const form = reactive({
  buyerName: '',
  buyerRegion: '',
  buyerContactEmail: '',
  product: '',
  quantity: '',
  unit: 'kg',
  contractValue: '',
  currency: 'USD',
  paymentTerm: '',
  incoterm: '',
  deliveryDate: '',
});

const unitOptions = [
  { value: 'kg', label: 'kg' },
  { value: 'ton', label: 'Tons' },
  { value: 'container', label: 'Containers' },
];

const currencyOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'VND', label: 'VND' },
];

const paymentTermOptions = [
  { value: 'LC', label: 'Letter of Credit (L/C)' },
  { value: 'TT', label: 'Telegraphic Transfer (T/T)' },
  { value: 'DP', label: 'Documents against Payment (D/P)' },
  { value: 'DA', label: 'Documents against Acceptance (D/A)' },
];

const incotermOptions = [
  { value: 'FOB', label: 'FOB - Free on Board' },
  { value: 'CIF', label: 'CIF - Cost, Insurance & Freight' },
  { value: 'CFR', label: 'CFR - Cost & Freight' },
  { value: 'EXW', label: 'EXW - Ex Works' },
];

const handleSubmit = async () => {
  submitting.value = true;
  fieldErrors.value = {};
  try {
    const payload: any = {
      buyerName: form.buyerName,
      buyerRegion: form.buyerRegion || undefined,
      buyerContactEmail: form.buyerContactEmail || undefined,
      product: form.product,
      quantity: Number(form.quantity),
      unit: form.unit,
      contractValue: Number(form.contractValue),
      currency: form.currency,
      paymentTerm: form.paymentTerm || undefined,
      incoterm: form.incoterm || undefined,
      deliveryDate: form.deliveryDate || undefined,
    };

    const res = await api.post('/contracts', payload);
    if (res.success) {
      if (contractFiles.value.length) {
        try {
          await uploadFiles(`/contracts/${res.data._id}/documents`, contractFiles.value);
        } catch {
          notifyError('Warning', 'Contract created but document upload failed. You can upload later.');
        }
      }
      success(t('supplier.contractCreated'), t('supplier.contractCreatedDesc'));
      router.push(`/supplier/contracts/${res.data._id}`);
    }
  } catch (err: any) {
    const apiError = err?.data?.error;
    if (apiError?.details?.length) {
      for (const d of apiError.details) {
        fieldErrors.value[d.field] = d.message;
      }
    }
    notifyError('Error', apiError?.message || 'Failed to create contract');
  }
  submitting.value = false;
};
</script>
