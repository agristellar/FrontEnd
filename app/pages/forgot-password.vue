<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <img src="~/assets/images/logo.png" alt="AgriStellar" class="h-9 mx-auto" />
        </NuxtLink>
        <h2 class="mt-4 text-xl font-semibold text-gray-900">{{ $t('auth.forgotPasswordTitle') }}</h2>
        <p class="mt-2 text-sm text-gray-500">{{ $t('auth.forgotPasswordDesc') }}</p>
      </div>

      <div class="card">
        <!-- Success State -->
        <div v-if="sent" class="text-center py-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('auth.checkEmail') }}</h3>
          <p class="text-sm text-gray-500 mb-6">{{ $t('auth.resetLinkSent') }}</p>
          <NuxtLink to="/login" class="text-primary-600 font-medium text-sm hover:text-primary-700">
            {{ $t('auth.backToLogin') }}
          </NuxtLink>
        </div>

        <!-- Form State -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-5">
          <BaseInput
            v-model="email"
            :label="$t('auth.email')"
            type="email"
            :placeholder="$t('auth.emailPlaceholder')"
            required
          />

          <p v-if="errorMsg" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{{ errorMsg }}</p>

          <BaseButton type="submit" :loading="loading" class="w-full">
            {{ $t('auth.sendResetLink') }}
          </BaseButton>
        </form>

        <p class="mt-6 text-center text-sm text-gray-600">
          {{ $t('auth.rememberPassword') }}
          <NuxtLink to="/login" class="text-primary-600 font-medium hover:text-primary-700">{{ $t('common.signIn') }}</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { t } = useI18n();
const api = useApi();

useSeoMeta({ title: 'Forgot Password', robots: 'noindex' });

const email = ref('');
const loading = ref(false);
const sent = ref(false);
const errorMsg = ref('');

const handleSubmit = async () => {
  errorMsg.value = '';
  if (!email.value) return;
  loading.value = true;
  try {
    await api.post('/auth/forgot-password', { email: email.value });
    sent.value = true;
  } catch (err: any) {
    errorMsg.value = err?.data?.error?.message || t('auth.forgotPasswordFailed');
  }
  loading.value = false;
};
</script>
