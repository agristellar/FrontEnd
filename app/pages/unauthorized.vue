<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-300 mb-4">{{ $t('unauthorized.code') }}</h1>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ $t('unauthorized.title') }}</h2>
      <p class="text-gray-600 mb-6">{{ $t('unauthorized.message') }}</p>
      <NuxtLink to="/" class="btn-primary">{{ $t('unauthorized.goHome') }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });
</script>
