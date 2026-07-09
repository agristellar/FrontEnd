<template>
  <BaseBadge :color="statusColor">{{ $t('statuses.' + status, status) }}</BaseBadge>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string }>();

const statusColor = computed(() => {
  const map: Record<string, 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' | 'orange'> = {
    // Verification
    Verified: 'green',
    Pending: 'yellow',
    Rejected: 'red',
    // Application
    Draft: 'gray',
    Submitted: 'blue',
    UnderReview: 'yellow',
    NeedMoreInfo: 'orange',
    Approved: 'green',
    // Campaign
    Published: 'blue',
    Funding: 'blue',
    FullyFunded: 'green',
    FundingLocked: 'purple',
    Active: 'green',
    InProgress: 'blue',
    AwaitingRepayment: 'yellow',
    PartialRepayment: 'orange',
    RepaymentVerified: 'green',
    Settled: 'green',
    Defaulted: 'red',
    OnHold: 'orange',
    Cancelled: 'gray',
    FundingFailed: 'red',
    // Harvest Note
    Issued: 'blue',
    AwaitingPayout: 'yellow',
    PaidOut: 'green',
    Burned: 'gray',
    Frozen: 'red',
    // Repayment
    ComplianceHold: 'orange',
    // Logistics
    Delivered: 'green',
    Delayed: 'red',
    InTransit: 'blue',
  };
  return map[props.status] || 'gray';
});
</script>
