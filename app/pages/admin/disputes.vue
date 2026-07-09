<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('admin.disputeManagement') }}</h1>

    <BaseCard :padding="false">
      <BaseTable :columns="columns" :data="disputes" :loading="loading" :empty-text="$t('admin.noDisputes')">
        <template #campaignId.campaignCode="{ value }">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>
        <template #type="{ value }">
          <BaseBadge :color="value === 'Fraud' ? 'red' : 'yellow'">{{ value }}</BaseBadge>
        </template>
        <template #status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #createdAt="{ value }">
          {{ new Date(value).toLocaleDateString() }}
        </template>
        <template #actions="{ row }">
          <BaseButton v-if="row.status === 'Open'" size="sm" @click="openResolve(row)">
            {{ $t('admin.resolve') }}
          </BaseButton>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- Resolve Modal -->
    <BaseModal v-model="showModal" :title="$t('admin.resolveDispute')">
      <div class="space-y-4">
        <div class="p-3 bg-gray-50 rounded-lg">
          <p class="text-sm font-medium text-gray-900">{{ selectedDispute?.type }}</p>
          <p class="text-sm text-gray-600 mt-1">{{ selectedDispute?.description }}</p>
        </div>
        <BaseSelect
          v-model="resolution.outcome"
          :label="$t('admin.outcome')"
          :options="outcomeOptions"
          required
        />
        <BaseTextarea v-model="resolution.notes" :label="$t('admin.resolutionNotes')" rows="3" required />
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false">{{ $t('common.cancel') }}</BaseButton>
        <BaseButton :loading="processing" @click="resolveDispute">{{ $t('admin.resolve') }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const { success, error: notifyError } = useNotification();

const loading = ref(true);
const processing = ref(false);
const disputes = ref<any[]>([]);
const showModal = ref(false);
const selectedDispute = ref<any>(null);
const resolution = reactive({ outcome: '', notes: '' });

const columns = computed(() => [
  { key: 'campaignId.campaignCode', label: t('common.campaign') },
  { key: 'type', label: t('admin.type') },
  { key: 'description', label: t('admin.description') },
  { key: 'status', label: t('common.status') },
  { key: 'createdAt', label: t('common.date') },
  { key: 'actions', label: '' },
]);

const outcomeOptions = computed(() => [
  { value: 'Resolved', label: t('admin.outcomeResolved') },
  { value: 'Dismissed', label: t('admin.outcomeDismissed') },
  { value: 'Escalated', label: t('admin.outcomeEscalated') },
]);

const openResolve = (dispute: any) => {
  selectedDispute.value = dispute;
  resolution.outcome = '';
  resolution.notes = '';
  showModal.value = true;
};

const resolveDispute = async () => {
  processing.value = true;
  try {
    await api.post(`/admin/disputes/${selectedDispute.value._id}/resolve`, resolution);
    success(t('admin.resolve'), t('admin.disputeResolved'));
    showModal.value = false;
    fetchDisputes();
  } catch (err: any) { notifyError('Error', err?.data?.error?.message || 'Failed'); }
  processing.value = false;
};

const fetchDisputes = async () => {
  loading.value = true;
  try {
    const res = await api.get('/admin/disputes');
    if (res.success) disputes.value = res.data;
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(fetchDisputes);
</script>
