<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('investor.harvestNotes') }}</h1>

    <BaseCard :padding="false">
      <BaseTable :columns="columns" :data="notes" :loading="loading" :empty-text="$t('investor.noHarvestNotes')">
        <template #noteCode="{ value }">
          <span class="font-mono text-sm font-medium text-gray-900">{{ value }}</span>
        </template>
        <template #principalAmount="{ value }">
          ${{ Number(value).toLocaleString() }}
        </template>
        <template #expectedPayout="{ value }">
          <span class="text-green-600 font-medium">${{ Number(value).toLocaleString() }}</span>
        </template>
        <template #status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #issuedAt="{ value }">
          {{ value ? new Date(value).toLocaleDateString() : '-' }}
        </template>
      </BaseTable>
      <BasePagination
        :page="pagination.page"
        :limit="pagination.limit"
        :total="pagination.total"
        :total-pages="pagination.totalPages"
        @change="(p: number) => { pagination.page = p; fetchNotes(); }"
      />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'investor', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);
const notes = ref<any[]>([]);
const pagination = reactive({ page: 1, limit: 20, total: 0, totalPages: 0 });

const columns = computed(() => [
  { key: 'noteCode', label: t('investor.noteCode') },
  { key: 'campaignId.campaignCode', label: 'Campaign' },
  { key: 'principalAmount', label: t('investor.principal') },
  { key: 'expectedPayout', label: t('investor.expectedPayout') },
  { key: 'status', label: t('common.status') },
  { key: 'issuedAt', label: t('investor.issued') },
]);

const fetchNotes = async () => {
  loading.value = true;
  try {
    const res = await api.get('/investor/harvest-notes', { page: pagination.page, limit: pagination.limit });
    if (res.success) {
      notes.value = res.data;
      const meta = res.pagination || res.meta; if (meta) Object.assign(pagination, meta);
    }
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(fetchNotes);
</script>
