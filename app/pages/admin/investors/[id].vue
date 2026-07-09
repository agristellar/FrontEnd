<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/investors" class="text-gray-400 hover:text-gray-600">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="page-title">{{ $t('admin.investorReview') }}</h1>
      <StatusBadge v-if="investor" :status="investor.verificationStatus" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="investor" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Account Info -->
        <BaseCard :title="$t('admin.accountInfo')">
          <dl class="grid grid-cols-2 gap-4">
            <div><dt class="text-sm text-gray-500">{{ $t('common.name') }}</dt><dd class="text-sm font-medium mt-1">{{ investor.userId?.fullName }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.email') }}</dt><dd class="text-sm font-medium mt-1">{{ investor.userId?.email }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.phone') }}</dt><dd class="text-sm font-medium mt-1">{{ investor.userId?.phone || '-' }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.joined') }}</dt><dd class="text-sm font-medium mt-1">{{ investor.userId?.createdAt ? new Date(investor.userId.createdAt).toLocaleDateString() : '-' }}</dd></div>
          </dl>
        </BaseCard>

        <!-- Wallet & Investment Summary -->
        <BaseCard :title="$t('admin.investmentSummary')">
          <dl class="grid grid-cols-2 gap-4">
            <div><dt class="text-sm text-gray-500">{{ $t('admin.walletAddress') }}</dt><dd class="text-sm font-medium mt-1 break-all">{{ investor.stellarWalletAddress || '-' }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.totalInvested') }}</dt><dd class="text-sm font-medium mt-1">${{ Number(investor.totalInvested || 0).toLocaleString() }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.totalPayout') }}</dt><dd class="text-sm font-medium mt-1 text-green-600">${{ Number(investor.totalPayout || 0).toLocaleString() }}</dd></div>
          </dl>
        </BaseCard>

        <!-- KYC Documents -->
        <BaseCard :title="$t('admin.kycDocuments')">
          <div v-if="!investor.kycDocuments?.length" class="text-sm text-gray-500 text-center py-4">{{ $t('admin.noKycDocs') }}</div>
          <ul v-else class="space-y-3">
            <li v-for="doc in investor.kycDocuments" :key="doc._id || doc.docType" class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ formatDocType(doc.docType) }}</p>
                <p class="text-xs text-gray-500">{{ $t('admin.uploaded') }}: {{ doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-' }}</p>
              </div>
              <a v-if="doc.fileUrl" :href="doc.fileUrl" target="_blank" class="text-sm text-primary-600 font-medium">{{ $t('common.view') }}</a>
            </li>
          </ul>
        </BaseCard>
      </div>

      <!-- Action Sidebar -->
      <div class="space-y-6">
        <BaseCard :title="$t('admin.reviewActions')">
          <div class="space-y-4">
            <!-- Status Summary -->
            <div class="text-center pb-4 border-b">
              <div :class="[
                'inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold',
                investor.verificationStatus === 'Verified' ? 'bg-green-100 text-green-700' :
                investor.verificationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              ]">
                {{ investor.verificationStatus === 'Verified' ? '✓' : investor.verificationStatus === 'Rejected' ? '✗' : '?' }}
              </div>
              <p class="text-sm text-gray-500 mt-2">{{ investor.verificationStatus }}</p>
            </div>

            <!-- Actions for Pending -->
            <div v-if="investor.verificationStatus === 'Pending'" class="space-y-3">
              <BaseButton class="w-full" @click="handleVerify" :loading="processing">
                {{ $t('admin.approveInvestor') }}
              </BaseButton>
              <div>
                <BaseTextarea v-model="rejectionReason" :label="$t('admin.rejectionReason')" rows="3" :placeholder="$t('admin.investorRejectionPlaceholder')" />
                <BaseButton variant="danger" class="w-full mt-2" @click="handleReject" :loading="processing" :disabled="!rejectionReason">
                  {{ $t('common.reject') }}
                </BaseButton>
              </div>
            </div>

            <!-- Reviewed info -->
            <div v-if="investor.reviewedAt" class="text-xs text-gray-500 pt-2 border-t">
              <p>{{ $t('admin.reviewedAt') }}: {{ new Date(investor.reviewedAt).toLocaleDateString() }}</p>
              <p v-if="investor.rejectionReason" class="mt-1 text-red-500">{{ $t('admin.reason') }}: {{ investor.rejectionReason }}</p>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const route = useRoute();
const api = useApi();
const { t } = useI18n();
const { success, error: notifyError } = useNotification();

const loading = ref(true);
const processing = ref(false);
const investor = ref<any>(null);
const rejectionReason = ref('');

const formatDocType = (type: string) => {
  const map: Record<string, string> = {
    id_card: 'ID Card',
    passport: 'Passport',
    proof_of_address: 'Proof of Address',
  };
  return map[type] || type;
};

onMounted(async () => {
  try {
    const res = await api.get(`/admin/investors/${route.params.id}`);
    if (res.success) investor.value = res.data;
  } catch { /* ignore */ }
  loading.value = false;
});

const handleVerify = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/admin/investors/${route.params.id}/verify`);
    if (res.success) {
      investor.value = res.data;
      success(t('common.approve'), t('admin.investorApproved'));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to verify');
  }
  processing.value = false;
};

const handleReject = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/admin/investors/${route.params.id}/reject`, { rejectionReason: rejectionReason.value });
    if (res.success) {
      investor.value = res.data;
      success(t('common.reject'), t('admin.investorRejected'));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to reject');
  }
  processing.value = false;
};
</script>
