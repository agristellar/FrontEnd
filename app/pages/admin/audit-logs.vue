<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('admin.auditLogsTitle') }}</h1>

    <div class="flex flex-wrap gap-3 mb-4">
      <BaseInput v-model="filters.action" :placeholder="$t('admin.filterByAction')" class="w-48" @keyup.enter="fetchLogs" />
      <BaseSelect v-model="filters.entityType" :options="entityTypes" :placeholder="$t('admin.allEntities')" class="w-44" @update:model-value="fetchLogs" />
      <BaseButton variant="outline" size="sm" @click="fetchLogs">{{ $t('common.search') }}</BaseButton>
    </div>

    <BaseCard :padding="false">
      <BaseTable :columns="columns" :data="logs" :loading="loading" :empty-text="$t('admin.noAuditLogs')">
        <template #actorId.fullName="{ value }">
          <span class="font-medium text-gray-900">{{ value || $t('admin.system') }}</span>
        </template>
        <template #action="{ value }">
          <BaseBadge color="blue">{{ value }}</BaseBadge>
        </template>
        <template #entityType="{ value }">
          <span class="text-sm text-gray-600">{{ value }}</span>
        </template>
        <template #createdAt="{ value }">
          <span class="text-xs text-gray-500">{{ new Date(value).toLocaleString() }}</span>
        </template>
        <template #details="{ row }">
          <button @click="viewDetails(row)" class="text-primary-600 hover:text-primary-700 text-sm">
            {{ $t('common.details') }}
          </button>
        </template>
      </BaseTable>
      <BasePagination :page="pagination.page" :limit="pagination.limit" :total="pagination.total" :total-pages="pagination.totalPages" @change="(p: number) => { pagination.page = p; fetchLogs(); }" />
    </BaseCard>

    <!-- Details Modal -->
    <BaseModal v-model="showModal" :title="$t('admin.auditLogDetails')" size="lg">
      <div v-if="selectedLog" class="space-y-4">
        <dl class="grid grid-cols-2 gap-3">
          <div><dt class="text-sm text-gray-500">{{ $t('admin.actor') }}</dt><dd class="text-sm font-medium">{{ selectedLog.actorId?.fullName || $t('admin.system') }}</dd></div>
          <div><dt class="text-sm text-gray-500">{{ $t('admin.action') }}</dt><dd class="text-sm font-medium">{{ selectedLog.action }}</dd></div>
          <div><dt class="text-sm text-gray-500">{{ $t('admin.entity') }}</dt><dd class="text-sm font-medium">{{ selectedLog.entityType }} / {{ selectedLog.entityId }}</dd></div>
          <div><dt class="text-sm text-gray-500">{{ $t('admin.time') }}</dt><dd class="text-sm">{{ new Date(selectedLog.createdAt).toLocaleString() }}</dd></div>
        </dl>
        <div v-if="selectedLog.oldValue || selectedLog.newValue" class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-700 mb-1">{{ $t('admin.oldValue') }}</p>
            <pre class="text-xs bg-red-50 p-3 rounded-lg overflow-auto max-h-60">{{ JSON.stringify(selectedLog.oldValue, null, 2) }}</pre>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700 mb-1">{{ $t('admin.newValue') }}</p>
            <pre class="text-xs bg-green-50 p-3 rounded-lg overflow-auto max-h-60">{{ JSON.stringify(selectedLog.newValue, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);
const logs = ref<any[]>([]);
const showModal = ref(false);
const selectedLog = ref<any>(null);
const filters = reactive({ action: '', entityType: '' });
const pagination = reactive({ page: 1, limit: 20, total: 0, totalPages: 0 });

const columns = computed(() => [
  { key: 'actorId.fullName', label: t('admin.actor') },
  { key: 'action', label: t('admin.action') },
  { key: 'entityType', label: t('admin.entity') },
  { key: 'createdAt', label: t('admin.time') },
  { key: 'details', label: '' },
]);

const entityTypes = computed(() => [
  { value: '', label: t('admin.allEntities') },
  { value: 'SupplierProfile', label: t('admin.supplier') },
  { value: 'FinancingApplication', label: 'Application' },
  { value: 'FundingCampaign', label: 'Campaign' },
  { value: 'Milestone', label: 'Milestone' },
  { value: 'Repayment', label: 'Repayment' },
  { value: 'HarvestNote', label: 'Harvest Note' },
  { value: 'DisputeCase', label: 'Dispute' },
]);

const viewDetails = (log: any) => {
  selectedLog.value = log;
  showModal.value = true;
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const params: any = { page: pagination.page, limit: pagination.limit };
    if (filters.action) params.action = filters.action;
    if (filters.entityType) params.entityType = filters.entityType;
    const res = await api.get('/audit-logs', params);
    if (res.success) {
      logs.value = res.data;
      const meta = res.pagination || res.meta; if (meta) Object.assign(pagination, meta);
    }
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(fetchLogs);
</script>
